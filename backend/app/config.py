"""
CA Bharat AI - Statutory Tax Configuration & Settings
Governed by Income-tax Act, 1961 and Finance Act, 2024 (AY 2025-26 & AY 2024-25)
Zero-LLM Deterministic Rules Engine
"""

from pydantic_settings import BaseSettings
from typing import Dict, Any, List

class TaxSlab(BaseSettings):
    min_amount: float
    max_amount: float
    rate: float

class Settings(BaseSettings):
    APP_NAME: str = "CA Bharat AI Enterprise Backend"
    APP_VERSION: str = "1.0.0"
    DEFAULT_AY: str = "2025-26"
    DEFAULT_FY: str = "2024-25"
    
    # Standard Deduction u/s 16(ia)
    STANDARD_DEDUCTION_NEW_REGIME_AY_2025_26: float = 75000.0  # Increased by Finance Act 2024
    STANDARD_DEDUCTION_OLD_REGIME: float = 50000.0
    
    # Section 87A Tax Rebate
    REBATE_87A_NEW_REGIME_THRESHOLD: float = 700000.0
    REBATE_87A_NEW_REGIME_MAX: float = 25000.0
    
    REBATE_87A_OLD_REGIME_THRESHOLD: float = 500000.0
    REBATE_87A_OLD_REGIME_MAX: float = 12500.0
    
    # Health and Education Cess
    HEALTH_AND_EDUCATION_CESS_RATE: float = 0.04
    
    # Chapter VI-A Deduction Limits (Old Regime)
    MAX_80C_LIMIT: float = 150000.0
    MAX_80CCD_1B_NPS_LIMIT: float = 50000.0
    MAX_80D_SELF_LIMIT: float = 25000.0
    MAX_80D_PARENTS_LIMIT: float = 25000.0
    MAX_80D_PARENTS_SENIOR_LIMIT: float = 50000.0
    MAX_80TTA_SAVINGS_LIMIT: float = 10000.0
    MAX_80TTB_SENIOR_INTEREST_LIMIT: float = 50000.0
    
    # Presumptive Taxation Limits
    SEC_44ADA_GROSS_RECEIPTS_LIMIT: float = 7500000.0
    SEC_44ADA_DEEMED_PROFIT_RATE: float = 0.50  # 50% deemed profit
    
    SEC_44AD_TURNOVER_LIMIT: float = 30000000.0
    SEC_44AD_DIGITAL_PROFIT_RATE: float = 0.06   # 6%
    SEC_44AD_NON_DIGITAL_PROFIT_RATE: float = 0.08 # 8%

    # New Tax Regime Slabs (AY 2025-26 u/s 115BAC)
    NEW_REGIME_SLABS_AY_2025_26: List[Dict[str, Any]] = [
        {"min": 0, "max": 300000, "rate": 0.0},
        {"min": 300000, "max": 700000, "rate": 0.05},
        {"min": 700000, "max": 1000000, "rate": 0.10},
        {"min": 1000000, "max": 1200000, "rate": 0.15},
        {"min": 1200000, "max": 1500000, "rate": 0.20},
        {"min": 1500000, "max": float("inf"), "rate": 0.30},
    ]

    # Old Tax Regime Slabs (Individual < 60 years)
    OLD_REGIME_SLABS: List[Dict[str, Any]] = [
        {"min": 0, "max": 250000, "rate": 0.0},
        {"min": 250000, "max": 500000, "rate": 0.05},
        {"min": 500000, "max": 1000000, "rate": 0.20},
        {"min": 1000000, "max": float("inf"), "rate": 0.30},
    ]

    # Surcharge Rates for Individuals & HUF
    SURCHARGE_SLABS_NEW_REGIME: List[Dict[str, Any]] = [
        {"min": 5000000, "max": 10000000, "rate": 0.10},
        {"min": 10000000, "max": 20000000, "rate": 0.15},
        {"min": 20000000, "max": float("inf"), "rate": 0.25}, # Capped at 25% in new regime
    ]

    SURCHARGE_SLABS_OLD_REGIME: List[Dict[str, Any]] = [
        {"min": 5000000, "max": 10000000, "rate": 0.10},
        {"min": 10000000, "max": 20000000, "rate": 0.15},
        {"min": 20000000, "max": 50000000, "rate": 0.25},
        {"min": 50000000, "max": float("inf"), "rate": 0.37},
    ]

settings = Settings()
