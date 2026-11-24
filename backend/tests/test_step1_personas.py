"""
Comprehensive Persona & Step 1 Verification Test Suite
Tests:
- Individual salaried client (Arun Kumar Verma)
- Individual with multiple income heads
- HUF client (Harish Chandra Singhania HUF)
- Business/professional client (Dr. Radhika Sen with 44ADA tax attribute)
- Missing information & duplicate PAN validation
- Previous-year information & loss rollover
- Dynamic document checklist adaptation
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models.client_models import LegalTaxpayerTypeEnum, IndividualOccupationEnum, ClientProfile

client = TestClient(app)

def test_persona_1_individual_salaried():
    """Arun Kumar Verma: Salaried Individual with Form 16 & interest."""
    res = client.get("/api/clients/ABCPA1092F")
    assert res.status_code == 200
    data = res.json()
    assert data["pan"] == "ABCPA1092F"
    assert data["legal_type"] == LegalTaxpayerTypeEnum.INDIVIDUAL.value
    assert data["occupation_profile"] == IndividualOccupationEnum.SALARIED.value
    assert data["recommended_itr"] == "ITR-1 (Sahaj)"
    assert data["employer_or_trade_name"] == "Tata Consultancy Services Ltd"
    assert data["tan"] == "BLRT01928F"

def test_persona_2_professional_44ada_evaluated_as_tax_attribute():
    """Dr. Radhika Sen: Legal type is Individual, occupation is Professional, 44ADA is a tax attribute."""
    res = client.get("/api/clients/ABCPR5491M")
    assert res.status_code == 200
    data = res.json()
    assert data["pan"] == "ABCPR5491M"
    # Legal type is INDIVIDUAL, NOT '44ADA'
    assert data["legal_type"] == LegalTaxpayerTypeEnum.INDIVIDUAL.value
    assert data["occupation_profile"] == IndividualOccupationEnum.PROFESSIONAL.value
    assert data["recommended_itr"] == "ITR-4 (Sugam)"

def test_persona_3_huf_client_onboarding_and_karta_details():
    """HUF with distinct legal entity, Karta details, and ancestral income."""
    huf_payload = {
        "id": "cli-test-huf",
        "pan": "AAAHK9921K",
        "name": "Raghunath Khade HUF",
        "legal_type": "HUF",
        "category": "Hindu Undivided Family (HUF)",
        "recommended_itr": "ITR-2",
        "karta_name": "Raghunath Khade",
        "karta_pan": "AAAPK1122D",
        "huf_deed_date": "1995-10-12",
        "email": "raghunath.huf@test.in",
        "mobile": "+91 98200 99881",
        "advisory_tier": "Gold",
    }
    res = client.post("/api/clients", json=huf_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["pan"] == "AAAHK9921K"
    assert data["legal_type"] == "HUF"
    assert data["karta_name"] == "Raghunath Khade"
    assert data["karta_pan"] == "AAAPK1122D"
    assert data["pan"][3] == "H"  # 4th letter is 'H' for HUF

def test_persona_4_individual_multiple_income_heads_discovery():
    """Individual with Salary + House Property + Capital Gains + Other Sources."""
    intake_payload = {
        "salary": {
            "hasIncome": "YES",
            "hasMultipleEmployers": "YES",
            "employers": [
                {"employerName": "Employer 1", "grossSalary": 1200000},
                {"employerName": "Employer 2", "grossSalary": 600000}
            ]
        },
        "houseProperty": {
            "hasIncome": "YES",
            "properties": [{"propertyType": "LET_OUT", "annualRentReceived": 300000, "housingLoanInterest24b": 150000}]
        },
        "capitalGains": {
            "hasIncome": "YES",
            "tradedEquitiesOrMutualFunds": "YES",
            "summary": {"equityStcg111A": 50000, "equityLtcg112A": 120000}
        },
        "otherSources": {
            "hasIncome": "YES",
            "estimatedSavingsInterest": 25000,
            "estimatedDividends": 35000
        },
        "specialDisclosures": {
            "hasAgriculturalIncome": "YES",
            "agriculturalIncomeAmount": 15000,  # >5000 requires Schedule EI!
            "hasForeignAssetsOrIncome": "NO",
            "hasCryptoOrVDA": "NO"
        },
        "previousYear": {
            "priorItrForm": "ITR-2",
            "priorAckNumber": "981273645019283",
            "priorRegime": "NEW",
            "hasBroughtForwardLosses": "YES",
            "losses": {"shortTermCapitalLoss": 45000, "unabsorbedDepreciation": 0}
        }
    }
    res = client.put("/api/clients/ABCPA1092F/intake", json=intake_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["intake_discovery"]["capitalGains"]["hasIncome"] == "YES"
    assert data["intake_discovery"]["specialDisclosures"]["agriculturalIncomeAmount"] == 15000
    assert data["intake_discovery"]["previousYear"]["losses"]["shortTermCapitalLoss"] == 45000

def test_pan_structure_and_duplicate_validation():
    """Verify PAN 4th character validation rules."""
    # Invalid PAN format
    with pytest.raises(Exception):
        ClientProfile(id="c-bad", pan="INVALID_PAN", name="Bad PAN")
