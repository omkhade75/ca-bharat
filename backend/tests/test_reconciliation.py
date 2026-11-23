"""
Unit Tests for 3-Way Reconciliation Engine
"""

from app.engine.reconciliation_engine import ReconciliationEngine
from app.models.reconciliation_models import MatchStatusEnum, NoticeRiskEnum

def test_salary_and_tds_exact_match():
    engine = ReconciliationEngine()
    f16 = {"part_b": {"gross_salary": 1500000.0}, "part_a": {"total_tax_deposited": 120000.0}}
    f26as = {"tds_salary_part_a": [{"total_amount_credited": 1500000.0, "total_tax_deposited": 120000.0}]}
    
    matrix = engine.reconcile(
        client_pan="ABCPA1092F",
        client_name="Arun Kumar Verma",
        f16_data=f16,
        f26as_data=f26as,
    )
    
    sal_row = next(r for r in matrix.rows if r.id == "row-salary-gross")
    tds_row = next(r for r in matrix.rows if r.id == "row-tds-192")
    
    assert sal_row.match_status == MatchStatusEnum.MATCHED
    assert tds_row.match_status == MatchStatusEnum.MATCHED
    assert matrix.total_discrepancies == 0

def test_tds_mismatch_flags_high_risk_notice():
    """Form 16A TDS ₹25k vs Portal ₹23k flags HIGH notice risk."""
    engine = ReconciliationEngine()
    matrix = engine.reconcile(
        client_pan="ABCPR5491M",
        client_name="Dr. Radhika Sen",
        f26as_data={"tds_non_salary_part_b": [{"section": "194J", "total_tax_deposited": 23000.0}]},
    )
    
    mismatch_row = next((r for r in matrix.rows if r.id == "row-tds-194j"), None)
    assert mismatch_row is not None
    assert mismatch_row.variance == 2000.0
    assert mismatch_row.notice_risk == NoticeRiskEnum.HIGH
    assert mismatch_row.is_resolved is False
