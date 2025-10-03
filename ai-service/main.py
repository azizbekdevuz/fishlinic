from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
from typing import Literal
from predictor import load_predictor, clamp, Status


class PredictRequest(BaseModel):
    pH: float = Field(..., description="Measured pH value (0-14)")
    temp_c: float = Field(..., description="Temperature in °C")
    do_mg_l: float = Field(..., description="Dissolved oxygen in mg/L")


class PredictResponse(BaseModel):
    quality_ai: float
    status_ai: Status


app = FastAPI(title="Fishlinic AI Service", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


PREDICTOR = load_predictor()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    # Optional plausibility clamps (same spirit as mock-server)
    ph = clamp(payload.pH, 0.0, 14.0)
    dox = clamp(payload.do_mg_l, 0.0, 30.0)
    temp_c = float(payload.temp_c)

    quality, status = PREDICTOR.predict_one(ph, temp_c, dox)
    return PredictResponse(quality_ai=quality, status_ai=status)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


