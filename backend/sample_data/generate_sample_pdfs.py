"""
Generates authentic sample Indian Form 16 Part A & B, Form 26AS, and AIS/TIS PDFs
Used for deterministic zero-LLM OCR parsing verification
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def generate_form16_pdf(output_path: str = "backend/sample_data/Form16_Arun_TCS.pdf"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    c = canvas.Canvas(output_path, pagesize=letter)
    
    # Page 1: Part A (TRACES Certificate)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(180, 750, "FORM NO. 16 — PART A")
    c.setFont("Helvetica", 9)
    c.drawString(140, 735, "Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source")
    
    c.drawString(50, 700, "Certificate No: WBLR20250918281")
    c.drawString(350, 700, "Assessment Year: 2025-26")
    
    c.drawString(50, 670, "Name of Employer: Tata Consultancy Services Ltd")
    c.drawString(50, 655, "TAN of Deductor: BLRT01928F")
    c.drawString(350, 655, "PAN of Deductor: AAACT2718K")
    
    c.drawString(50, 625, "Name of Employee: Arun Kumar Verma")
    c.drawString(50, 610, "PAN of Employee: ABCPA1092F")
    c.drawString(350, 610, "Period with Employer: 01-Apr-2024 to 31-Mar-2025")
    
    # Summary of Tax Deducted Table
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, 560, "Summary of Tax Deducted and Deposited in Central Government Account:")
    c.setFont("Helvetica", 9)
    c.drawString(50, 540, "Quarter 1 (Q1): Amount Paid: Rs. 3,75,000.00 | Tax Deducted: Rs. 29,640.00 | Tax Deposited: Rs. 29,640.00")
    c.drawString(50, 520, "Quarter 2 (Q2): Amount Paid: Rs. 3,75,000.00 | Tax Deducted: Rs. 29,640.00 | Tax Deposited: Rs. 29,640.00")
    c.drawString(50, 500, "Quarter 3 (Q3): Amount Paid: Rs. 3,75,000.00 | Tax Deducted: Rs. 29,640.00 | Tax Deposited: Rs. 29,640.00")
    c.drawString(50, 480, "Quarter 4 (Q4): Amount Paid: Rs. 3,95,000.00 | Tax Deducted: Rs. 29,640.00 | Tax Deposited: Rs. 29,640.00")
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, 440, "Total tax deducted at source: Rs. 1,18,560.00")
    c.showPage()
    
    # Page 2: Part B (Salary Details & Section 16 Deductions)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(180, 750, "FORM NO. 16 — PART B")
    c.setFont("Helvetica", 9)
    c.drawString(160, 735, "Annexure to Form 16: Details of Salary paid and any other income")
    
    c.drawString(50, 700, "1. Gross Salary:")
    c.drawString(70, 680, "(a) Salary as per provisions contained in sec 17(1): Rs. 14,85,000.00")
    c.drawString(70, 660, "(b) Value of perquisites under sec 17(2): Rs. 35,000.00")
    c.drawString(70, 640, "(c) Profits in lieu of salary under sec 17(3): Rs. 0.00")
    c.drawString(70, 620, "(d) Total Gross Salary: Rs. 15,20,000.00")
    
    c.drawString(50, 590, "2. Less: Allowances to the extent exempt under section 10:")
    c.drawString(70, 570, "(a) House Rent Allowance under sec 10(13A): Rs. 0.00")
    c.drawString(70, 550, "(b) Leave Travel Assistance under sec 10(5): Rs. 0.00")
    
    c.drawString(50, 520, "3. Deductions under section 16:")
    c.drawString(70, 500, "(a) Standard deduction under sec 16(ia): Rs. 75,000.00")
    c.drawString(70, 480, "(b) Tax on employment / Professional tax 16(iii): Rs. 2,400.00")
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, 440, "4. Income chargeable under the head 'Salaries': Rs. 14,42,600.00")
    
    c.setFont("Helvetica", 9)
    c.drawString(50, 400, "5. Deductions under Chapter VI-A:")
    c.drawString(70, 380, "(a) Section 80C (Life Insurance, EPF, PPF): Rs. 1,50,000.00")
    c.drawString(70, 360, "(b) Section 80CCD(1B) (NPS): Rs. 50,000.00")
    c.drawString(70, 340, "(c) Section 80D (Health Insurance): Rs. 25,000.00")
    c.drawString(70, 320, "(d) Section 80TTA: Rs. 10,000.00")
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, 280, "6. Total Taxable Income: Rs. 12,07,600.00")
    c.drawString(50, 260, "7. Net tax deducted at source: Rs. 1,18,560.00")
    c.save()
    return output_path

def generate_form26as_pdf(output_path: str = "backend/sample_data/Form26AS_Arun.pdf"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    c = canvas.Canvas(output_path, pagesize=letter)
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(160, 750, "FORM 26AS — ANNUAL TAX STATEMENT")
    c.setFont("Helvetica", 9)
    c.drawString(180, 735, "Under Section 203AA of the Income-tax Act, 1961")
    
    c.drawString(50, 700, "Assessee PAN: ABCPA1092F")
    c.drawString(350, 700, "Name of Assessee: Arun Kumar Verma")
    c.drawString(50, 680, "Financial Year: 2024-25")
    c.drawString(350, 680, "Assessment Year: 2025-26")
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, 640, "Part I — Details of Tax Deducted at Source on Salary (Sec 192)")
    c.setFont("Helvetica", 9)
    c.drawString(50, 620, "Deductor: Tata Consultancy Services Ltd | TAN: BLRT01928F")
    c.drawString(50, 605, "Total Amount Credited: Rs. 14,85,000.00 | Total Tax Deducted: Rs. 1,18,560.00 | Total Tax Deposited: Rs. 1,18,560.00")
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, 560, "Part II — Details of Tax Deducted at Source on Other than Salary")
    c.setFont("Helvetica", 9)
    c.drawString(50, 540, "Deductor: HDFC Bank Ltd | Section: 194A | Amount Credited: Rs. 46,200.00 | Tax Deposited: Rs. 4,620.00")
    
    c.setFont("Helvetica-Bold", 11)
    c.drawString(50, 500, "Part IV — Details of Tax Paid (Advance Tax / Self-Assessment Tax)")
    c.setFont("Helvetica", 9)
    c.drawString(50, 480, "Major Head: 0021 | Minor Head: 100 | BSR Code: 0210045 | Challan No: 04912 | Date: 15-Dec-2024 | Amount: Rs. 0.00")
    
    c.save()
    return output_path

def generate_ais_pdf(output_path: str = "backend/sample_data/AIS_TIS_Arun.pdf"):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    c = canvas.Canvas(output_path, pagesize=letter)
    
    c.setFont("Helvetica-Bold", 14)
    c.drawString(140, 750, "ANNUAL INFORMATION STATEMENT (AIS)")
    c.setFont("Helvetica", 9)
    c.drawString(170, 735, "Directorate of Income Tax (Systems), New Delhi")
    
    c.drawString(50, 700, "PAN: ABCPA1092F")
    c.drawString(350, 700, "Name: Arun Kumar Verma")
    c.drawString(50, 680, "Financial Year: 2024-25")
    c.drawString(350, 680, "Assessment Year: 2025-26")
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, 640, "Part B — Information Details:")
    c.setFont("Helvetica", 9)
    c.drawString(50, 620, "1. [TDS-192] Salary from Tata Consultancy Services Ltd: Rs. 14,85,000.00 (TDS: Rs. 1,18,560.00)")
    c.drawString(50, 600, "2. [INT-SAV] Interest from Savings Bank Accounts: Rs. 18,400.00")
    c.drawString(50, 580, "3. [DIV-001] Dividend from Listed Domestic Equities: Rs. 24,500.00")
    c.drawString(50, 560, "4. [SFT-017] Sale of Mutual Fund Units / Securities: Rs. 1,85,000.00")
    
    c.save()
    return output_path

if __name__ == "__main__":
    p1 = generate_form16_pdf()
    p2 = generate_form26as_pdf()
    p3 = generate_ais_pdf()
    print(f"Generated sample PDFs: {p1}, {p2}, {p3}")
