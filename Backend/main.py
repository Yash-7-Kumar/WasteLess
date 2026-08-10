from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import model


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    data = model.modelPredictor(1,1,1,1)
    return data