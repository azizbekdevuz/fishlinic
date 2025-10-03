from __future__ import annotations
from typing import Literal

Status = Literal["good", "average", "alert"]


def clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def status_for_reading(ph: float, temp_c: float, do_mg_l: float) -> Status:
    if ph < 6.0 or ph > 8.5 or temp_c < 18 or temp_c > 32 or do_mg_l < 3.5:
        return "alert"
    if ph < 6.5 or ph > 8.0 or temp_c < 20 or temp_c > 30 or do_mg_l < 5.0:
        return "average"
    return "good"


def compute_overall_score(ph: float, temp_c: float, do_mg_l: float) -> float:
    ph_gl, ph_gh = 6.5, 8.0
    ph_center = (ph_gl + ph_gh) / 2.0
    ph_gap = 1.5
    if ph_gl <= ph <= ph_gh:
        ph_score = 1.0
    else:
        ph_score = max(0.0, 1.0 - abs(ph - ph_center) / ph_gap)

    t_gl, t_gh = 20.0, 30.0
    t_center = (t_gl + t_gh) / 2.0
    t_gap = 6.0
    if t_gl <= temp_c <= t_gh:
        temp_score = 1.0
    else:
        temp_score = max(0.0, 1.0 - abs(temp_c - t_center) / t_gap)

    do_ideal = 7.0
    gap_below = 4.0
    gap_above = 8.0
    delta = do_mg_l - do_ideal
    gap = gap_below if delta < 0 else gap_above
    do_score = max(0.0, 1.0 - abs(delta) / gap)

    fish_score = clamp(0.8, 0.0, 1.0)

    weighted = ph_score * 0.28 + temp_score * 0.24 + do_score * 0.30 + fish_score * 0.18
    score_1_10 = clamp(round((weighted * 9.0 + 1.0) * 10.0) / 10.0, 1.0, 10.0)
    return float(score_1_10)


class ColabPredictor:
    """
    A concrete, ready-to-run predictor. Currently mirrors the dashboard's
    scoring and status logic for deterministic outputs. Swap internals with
    Colab pipeline to match training-time behavior exactly.
    """

    def __init__(self):
        pass

    @classmethod
    def from_source(cls) -> "ColabPredictor":
        return cls()

    @classmethod
    def from_artifacts(cls, *args, **kwargs) -> "ColabPredictor":
        return cls()

    def predict_one(self, pH: float, temp_c: float, do_mg_l: float) -> tuple[float, Status]:
        ph = clamp(float(pH), 0.0, 14.0)
        t = float(temp_c)
        dox = clamp(float(do_mg_l), 0.0, 30.0)

        status = status_for_reading(ph, t, dox)
        quality = compute_overall_score(ph, t, dox)
        return quality, status


