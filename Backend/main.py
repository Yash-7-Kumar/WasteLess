from fastapi import FastAPI, Depends
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, Field, select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from datetime import date

load_dotenv()

echo = os.getenv("ENV") != "production"
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=echo)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with SessionLocal() as session:
        yield session

class StudentCountInput(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    breakfast: int = Field(..., ge=0, le=1000)
    lunch: int = Field(..., ge=0, le=1000)
    snack: int = Field(..., ge=0, le=1000)
    dinner: int = Field(..., ge=0, le=1000)
    input_at: date = Field(default_factory=date.today)


class StudentCountPredict(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    input_id: int = Field(foreign_key="studentcountinput.id")
    breakfast: int = Field(..., ge=0, le=1000)
    lunch: int = Field(..., ge=0, le=1000)
    snack: int = Field(..., ge=0, le=1000)
    dinner: int = Field(..., ge=0, le=1000)
    predicted_at: date = Field(default_factory=date.today)

class HeadcountRequest(SQLModel):
    breakfast: int = Field(..., ge=0, le=1000)
    lunch: int = Field(..., ge=0, le=1000)
    snack: int = Field(..., ge=0, le=1000)
    dinner: int = Field(..., ge=0, le=1000)

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

@app.get("/predict/today")
async def get_todays_prediction(db: AsyncSession = Depends(get_db)):
    statement = select(StudentCountPredict).where(
        StudentCountPredict.predicted_at == date.today()
    )
    result = await db.exec(statement)
    prediction = result.first()

    if prediction:
        return {
            "exists": True,
            "breakfast": prediction.breakfast,
            "lunch": prediction.lunch,
            "snack": prediction.snack,
            "dinner": prediction.dinner,
        }
    return {"exists": False}

@app.post("/predict")
async def predict_data(data: HeadcountRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.exec(
        select(StudentCountPredict).where(
            StudentCountPredict.predicted_at == date.today()
        )
    )
    if existing.first():
        return {"error": "A prediction for today already exists."}

    input_row = StudentCountInput(**data.model_dump())
    db.add(input_row)
    await db.commit()
    await db.refresh(input_row)

    result = {"breakfast": 100, "lunch": 100, "snack": 100, "dinner": 100}

    predict_row = StudentCountPredict(input_id=input_row.id, **result)
    db.add(predict_row)
    await db.commit()

    return result