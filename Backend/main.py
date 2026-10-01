from fastapi import FastAPI, Depends, HTTPException
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import os
from typing import Literal
from dotenv import load_dotenv
from sqlmodel import SQLModel, Field, select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from datetime import date,timedelta
from typing import Literal

load_dotenv()

echo = os.getenv("ENV") != "production"
DATABASE_URL = os.getenv("DATABASE_URL_backend")
engine = create_async_engine(DATABASE_URL, echo=echo)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Meal = Literal["breakfast", "lunch", "snack", "dinner"]

async def get_db():
    async with SessionLocal() as session:
        yield session


# New table names, so create_all makes fresh tables and your old ones are untouched.
class MealInput(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    meal: str = Field(index=True)
    count: int = Field(..., ge=0, le=12000)
    input_at: date = Field(default_factory=date.today)


class MealPrediction(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    input_id: int = Field(foreign_key="mealinput.id")
    meal: str = Field(index=True)
    count_XGB: int = Field(..., ge=10, le=12000)
    predicted_for: date = Field(...)
    count_LGBM: int = Field(..., ge=10, le=12000)
    count_CB: int = Field(..., ge=10, le=12000)
    count_EN: int = Field(..., ge=10, le=12000)


class MealCountRequest(SQLModel):
    """Frontend sends only the selected meal, e.g. {"lunch": 120}."""
    breakfast: int | None = Field(default=None, ge=0, le=12000)
    lunch: int | None = Field(default=None, ge=0, le=12000)
    snack: int | None = Field(default=None, ge=0, le=12000)
    dinner: int | None = Field(default=None, ge=0, le=12000)

class MealCountInput(SQLModel):
    meal: Literal["Breakfast", "Lunch", "Evening_Snacks", "Dinner"]
    count: int = Field(ge=10, le=12000)


def run_model(meal: str, yesterday_count: int) -> int:
    from pred_sys.main.db import get_calendar_df, get_raw_history_df
    from pred_sys.main.main import predict_for
    from pred_sys.main.feature_engineering import build_master

    raw_df = get_raw_history_df()
    calendar = get_calendar_df()
    df_master = build_master(raw_df, calendar)

    tDate = date.today() + timedelta(days=1)
    finalPred = predict_for(meal,df_master,tDate)

    return finalPred

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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/predict/{meal}/today")
async def get_todays_prediction(meal: Meal, db: AsyncSession = Depends(get_db)):
    result = await db.exec(
        select(MealPrediction).where(
            MealPrediction.meal == meal,
            MealPrediction.predicted_for == date.today(),
        )
    )
    prediction = result.first()

    if prediction:
        return {"exists": True, meal: prediction.count}
    return {"exists": False}


@app.post("/predict/{meal}")
async def predict_meal(
    meal: Meal, data: MealCountRequest, db: AsyncSession = Depends(get_db)
):
    yesterday_count = getattr(data, meal)
    if yesterday_count is None:
        raise HTTPException(status_code=422, detail=f"'{meal}' count is required.")

    meal = meal.title()

    existing = await db.exec(
        select(MealPrediction).where(
            MealPrediction.meal == meal,
            MealPrediction.predicted_for == date.today(),
        )
    )

    if existing.first():
        return {"error": f"A {meal} prediction for today already exists."}

    input_row = MealInput(meal=meal, count=yesterday_count)
    db.add(input_row)
    await db.commit()
    await db.refresh(input_row)

    predicted = run_model(meal, yesterday_count)

    await db.add(MealPrediction(input_id=input_row.id, meal=meal,count_XGB=predicted.get("xgb"),predicted_for=predicted.get("target_date"), count_LGBM=predicted.get("lgbm"),count_CB=predicted.get("cb"),count_EN=predicted.get("ensemble")))

    if meal=="Breakfast":
        db.exec(text(f""))
    
    # await db.execute(
    #     text(f'UPDATE "{table}" SET "{meal}" = :count WHERE "Date" = :d RETURNING "Date"'),
    #     {"count": count, "d": target},
    # )


    if (meal=="breakfast")

    await db.commit()

    return {meal: predicted}