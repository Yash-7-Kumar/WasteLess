from fastapi import FastAPI, Depends, HTTPException
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio
from typing import Literal
from dotenv import load_dotenv
from sqlmodel import SQLModel, Field, select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

load_dotenv()

echo = os.getenv("ENV") != "production"
DATABASE_URL = os.getenv("DATABASE_URL_backend")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

engine = create_async_engine(DATABASE_URL, echo=echo)
SessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

IST = ZoneInfo("Asia/Kolkata")

Meal = Literal["breakfast", "lunch", "snack", "dinner"]

COLUMN_FOR = {
    "breakfast": "Breakfast",
    "lunch": "Lunch",
    "snack": "Evening_Snacks",
    "dinner": "Dinner",
}


def today() -> date:
    return datetime.now(IST).date()


def tomorrow() -> date:
    return today() + timedelta(days=1)


async def get_db():
    async with SessionLocal() as session:
        yield session


class MealInput(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    meal: str = Field(index=True)
    count: int = Field(..., ge=0, le=12000)
    input_at: date = Field(default_factory=today)


class MealPrediction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    input_id: int = Field(foreign_key="mealinput.id")
    meal: str = Field(index=True)
    predicted_for: date = Field(...)
    count_XGB: int = Field(..., ge=10, le=12000)
    count_LGBM: int = Field(..., ge=10, le=12000)
    count_CB: int = Field(..., ge=10, le=12000)
    count_EN: int = Field(..., ge=10, le=12000)


class MealCountRequest(SQLModel):
    breakfast: int | None = Field(default=None, ge=10, le=12000)
    lunch: int | None = Field(default=None, ge=10, le=12000)
    snack: int | None = Field(default=None, ge=10, le=12000)
    dinner: int | None = Field(default=None, ge=10, le=12000)


def run_model(meal: str, todays_count: int) -> dict:
    from pred_sys.main.db import get_calendar_df, get_raw_history_df
    from pred_sys.main.main import predict_for
    from pred_sys.main.feature_engineering import build_master

    raw_df = get_raw_history_df()
    calendar = get_calendar_df()
    df_master = build_master(raw_df, calendar)

    return predict_for(meal, df_master, tomorrow())


HEADCOUNT_TABLE = "08_2026"


async def save_meal_count(
    db: AsyncSession, column: str, count: int, target: date
) -> None:
    result = await db.execute(
        text(f'UPDATE "{HEADCOUNT_TABLE}" SET "{column}" = :count WHERE "Date" = :d'),
        {"count": count, "d": target},
    )
    if result.rowcount == 0:
        raise HTTPException(
            status_code=404, detail=f"No row for {target} in '{HEADCOUNT_TABLE}'."
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("Database connection successful.")
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        print("Database tables initialized.")
    except Exception as e:
        print(f"Database connection failed: {e}")

    yield
    await engine.dispose()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/predict/{meal}/today")
async def get_todays_prediction(meal: Meal, db: AsyncSession = Depends(get_db)):
    result = await db.exec(
        select(MealPrediction).where(
            MealPrediction.meal == COLUMN_FOR[meal],
            MealPrediction.predicted_for == tomorrow(),
        )
    )
    prediction = result.first()

    if prediction:
        return {"exists": True, meal: prediction.count_EN}
    return {"exists": False}


@app.post("/predict/{meal}")
async def predict_meal(
    meal: Meal, data: MealCountRequest, db: AsyncSession = Depends(get_db)
):
    todays_count = getattr(data, meal)
    if todays_count is None:
        raise HTTPException(status_code=422, detail=f"'{meal}' count is required.")

    column = COLUMN_FOR[meal]

    existing = await db.exec(
        select(MealPrediction).where(
            MealPrediction.meal == column,
            MealPrediction.predicted_for == tomorrow(),
        )
    )
    if existing.first():
        return {"error": f"A {column} prediction for tomorrow already exists."}

    input_row = MealInput(meal=column, count=todays_count)
    db.add(input_row)

    await save_meal_count(db, column, todays_count, today())
    await db.commit()
    await db.refresh(input_row)

    predicted = await asyncio.to_thread(run_model, column, todays_count)

    print(predicted.get("xgb"))

    db.add(
        MealPrediction(
            input_id=input_row.id,
            meal=column,

            predicted_for=predicted.get("target_date"),
            count_XGB=int(predicted.get("xgb")),
            count_LGBM=int(predicted.get("lgbm")),
            count_CB=int(predicted.get("cb")),
            count_EN=int(predicted.get("ensemble")),
        )
    )
    await db.commit()

    return {meal: int(predicted.get("ensemble"))}