#!/usr/bin/env python3
"""
generate_all_compliance_pdfs.py
Converts all CABI AFRICA LIMITED NTSA Compliance final drafts into publication-grade legal PDFs.
Harmonized with NTSA Legal Notice No. 120 of 2022, Data Protection Act 2019, and Kenyan Corporate Law.
"""

import os
import re
import csv
import subprocess
import html

WORKSPACE_DIR = "/Users/user/Downloads/Cabi Africa Final"
CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS_PORTRAIT = """
@page {
    size: A4 portrait;
    margin: 18mm 18mm 18mm 18mm;
    @top-right {
        content: "CABI AFRICA LIMITED | NTSA COMPLIANCE DOSSIER";
        font-family: 'Times New Roman', Georgia, serif;
        font-size: 8pt;
        color: #64748b;
    }
    @bottom-center {
        content: "Page " counter(page);
        font-family: 'Times New Roman', Georgia, serif;
        font-size: 9pt;
        color: #475569;
    }
}

body {
    font-family: 'Times New Roman', 'Georgia', serif;
    font-size: 10pt;
    line-height: 1.45;
    color: #111827;
    margin: 0;
    padding: 0;
    text-align: justify;
}

h1 {
    font-size: 15pt;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    margin-top: 14px;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
    color: #0b2545;
    page-break-after: avoid;
}

h2 {
    font-size: 12.5pt;
    text-align: left;
    text-transform: uppercase;
    font-weight: bold;
    margin-top: 16px;
    margin-bottom: 8px;
    border-bottom: 1.5px solid #0b2545;
    padding-bottom: 3px;
    color: #0b2545;
    page-break-after: avoid;
}

h3 {
    font-size: 10.8pt;
    font-weight: bold;
    margin-top: 12px;
    margin-bottom: 4px;
    color: #133c55;
    page-break-after: avoid;
}

h4 {
    font-size: 10pt;
    font-weight: bold;
    font-style: italic;
    margin-top: 8px;
    margin-bottom: 3px;
    page-break-after: avoid;
}

p {
    margin-top: 0;
    margin-bottom: 6px;
    text-align: justify;
}

hr {
    border: none;
    border-top: 1px solid #cbd5e1;
    margin: 12px 0;
}

.legal-header-box {
    border: 2px solid #0b2545;
    padding: 10px 14px;
    margin-bottom: 14px;
    text-align: center;
    background-color: #f8fafc;
    page-break-inside: avoid;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 9pt;
    page-break-inside: avoid;
}

th, td {
    border: 1px solid #94a3b8;
    padding: 5px 7px;
    text-align: left;
    vertical-align: top;
}

th {
    background-color: #e2e8f0;
    font-weight: bold;
    color: #0f172a;
}

tr:nth-child(even) {
    background-color: #f8fafc;
}

ul, ol {
    margin-top: 3px;
    margin-bottom: 6px;
    padding-left: 22px;
}

li {
    margin-bottom: 3px;
}

pre, code {
    font-family: 'Courier New', Courier, monospace;
    font-size: 8.5pt;
    background-color: #f1f5f9;
}

pre {
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    white-space: pre-wrap;
    word-break: break-all;
    page-break-inside: avoid;
}

.badge-compliant {
    background-color: #dcfce7;
    color: #166534;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 8pt;
}

.badge-pending {
    background-color: #fef9c3;
    color: #854d0e;
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 8pt;
}

.signature-row {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    page-break-inside: avoid;
}

.signature-box {
    width: 48%;
    border-top: 1px solid #333;
    padding-top: 5px;
    font-size: 9pt;
}

.stamp-box {
    border: 1.5px solid #334155;
    padding: 8px 12px;
    margin: 14px 0;
    font-size: 9pt;
    background-color: #f8fafc;
    page-break-inside: avoid;
}

.page-break {
    page-break-before: always;
    break-before: page;
}
"""

CSS_LANDSCAPE = """
@page {
    size: A4 landscape;
    margin: 14mm 14mm 14mm 14mm;
    @top-right {
        content: "CABI AFRICA LIMITED | FLEET & DRIVER INVENTORY REGISTER (NTSA REGULATION 8)";
        font-family: 'Times New Roman', Georgia, serif;
        font-size: 8pt;
        color: #64748b;
    }
    @bottom-center {
        content: "Page " counter(page);
        font-family: 'Times New Roman', Georgia, serif;
        font-size: 9pt;
        color: #475569;
    }
}

body {
    font-family: 'Times New Roman', 'Georgia', serif;
    font-size: 8.5pt;
    line-height: 1.35;
    color: #111827;
    margin: 0;
    padding: 0;
}

h1 {
    font-size: 14pt;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    margin-top: 5px;
    margin-bottom: 4px;
    color: #0b2545;
}

.header-banner {
    border: 1.5px solid #0b2545;
    padding: 6px 10px;
    margin-bottom: 10px;
    text-align: center;
    background-color: #f8fafc;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 6px 0;
    font-size: 8pt;
}

th, td {
    border: 1px solid #94a3b8;
    padding: 4px 5px;
    text-align: left;
    vertical-align: middle;
}

th {
    background-color: #0b2545;
    color: #ffffff;
    font-weight: bold;
    text-align: center;
    font-size: 8pt;
}

tr:nth-child(even) {
    background-color: #f8fafc;
}

.badge-active {
    background-color: #dcfce7;
    color: #166534;
    padding: 2px 4px;
    border-radius: 3px;
    font-weight: bold;
    font-size: 7.5pt;
    text-align: center;
    display: inline-block;
}
"""


def markdown_to_html_content(md_text):
    lines = md_text.split("\n")
    html_lines = []
    in_table = False
    table_lines = []
    in_ul = False
    in_ol = False
    in_code = False
    code_lines = []

    def close_lists():
        nonlocal in_ul, in_ol
        res = ""
        if in_ul:
            res += "</ul>\n"
            in_ul = False
        if in_ol:
            res += "</ol>\n"
            in_ol = False
        return res

    def process_table(tbl_lines):
        if not tbl_lines:
            return ""
        out = ["<table>"]
        header_done = False
        for line in tbl_lines:
            if re.match(r"^\|[\s\-:|]+\|$", line.strip()):
                header_done = True
                continue
            cells = [c.strip() for c in line.strip().split("|")[1:-1]]
            if not header_done:
                out.append("  <thead><tr>" + "".join(f"<th>{inline_formatting(c)}</th>" for c in cells) + "</tr></thead><tbody>")
            else:
                out.append("  <tr>" + "".join(f"<td>{inline_formatting(c)}</td>" for c in cells) + "</tr>")
        if header_done:
            out.append("</tbody></table>")
        else:
            out.append("</table>")
        return "\n".join(out)

    def inline_formatting(text):
        text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        text = re.sub(r"\*\*\*(.*?)\*\*\*", r"<strong><em>\1</em></strong>", text)
        text = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", text)
        text = re.sub(r"\*(.*?)\*", r"<em>\1</em>", text)
        text = re.sub(r"`(.*?)`", r"<code>\1</code>", text)
        text = re.sub(r"\[COMPLIANT\]|\[VERIFIED\]", r"<span class='badge-compliant'>VERIFIED</span>", text)
        text = re.sub(r"\[PENDING\]", r"<span class='badge-pending'>PENDING</span>", text)
        text = re.sub(r"_{4,}", r"<span style='border-bottom: 1px dotted #444; display: inline-block; min-width: 220px;'>&nbsp;</span>", text)
        return text

    for line in lines:
        stripped = line.strip()

        # Fenced code blocks
        if stripped.startswith("```"):
            if not in_code:
                html_lines.append(close_lists())
                in_code = True
                code_lines = []
            else:
                in_code = False
                html_lines.append("<pre><code>" + html.escape("\n".join(code_lines)) + "</code></pre>")
                code_lines = []
            continue

        if in_code:
            code_lines.append(line)
            continue

        # Table rows
        if stripped.startswith("|") and stripped.endswith("|"):
            html_lines.append(close_lists())
            in_table = True
            table_lines.append(stripped)
            continue
        elif in_table:
            html_lines.append(process_table(table_lines))
            table_lines = []
            in_table = False

        if not stripped:
            html_lines.append(close_lists())
            continue

        if stripped in ["---", "***", "___"]:
            html_lines.append(close_lists())
            html_lines.append("<hr/>")
            continue

        if stripped == "\\" or stripped == "\\\\":
            html_lines.append("<br/>")
            continue

        # Headers
        if stripped.startswith("# "):
            html_lines.append(close_lists())
            html_lines.append(f"<h1>{inline_formatting(stripped[2:])}</h1>")
            continue
        if stripped.startswith("## "):
            html_lines.append(close_lists())
            html_lines.append(f"<h2>{inline_formatting(stripped[3:])}</h2>")
            continue
        if stripped.startswith("### "):
            html_lines.append(close_lists())
            html_lines.append(f"<h3>{inline_formatting(stripped[4:])}</h3>")
            continue
        if stripped.startswith("#### "):
            html_lines.append(close_lists())
            html_lines.append(f"<h4>{inline_formatting(stripped[5:])}</h4>")
            continue

        # Lists
        if stripped.startswith("* ") or stripped.startswith("- "):
            if in_ol:
                html_lines.append("</ol>\n")
                in_ol = False
            if not in_ul:
                html_lines.append("<ul>")
                in_ul = True
            item_content = inline_formatting(stripped[2:])
            html_lines.append(f"  <li>{item_content}</li>")
            continue

        m_ol = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if m_ol:
            if in_ul:
                html_lines.append("</ul>\n")
                in_ul = False
            if not in_ol:
                html_lines.append("<ol>")
                in_ol = True
            item_content = inline_formatting(m_ol.group(2))
            html_lines.append(f"  <li>{item_content}</li>")
            continue

        html_lines.append(close_lists())
        html_lines.append(f"<p>{inline_formatting(stripped)}</p>")

    if in_table:
        html_lines.append(process_table(table_lines))
    html_lines.append(close_lists())

    return "\n".join(html_lines)


def build_page_html(title, body_content):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(title)}</title>
    <style>
        {CSS_PORTRAIT}
    </style>
</head>
<body>
    <div class="legal-header-box">
        <div style="font-size: 13pt; font-weight: bold; letter-spacing: 1px; color: #0b2545;">REPUBLIC OF KENYA</div>
        <div style="font-size: 10pt; font-weight: bold; color: #1e3a8a; margin-top: 2px;">NATIONAL TRANSPORT AND SAFETY AUTHORITY (NTSA)</div>
        <div style="font-size: 8.5pt; color: #475569;">Transport Network Companies Regulations, 2022 (Legal Notice No. 120 of 2022)</div>
        <div style="margin-top: 4px; font-size: 9.5pt; font-weight: bold; color: #0b2545;">CABI AFRICA LIMITED &bull; REGISTRATION NO. PVT-OD169L8L</div>
    </div>
    {body_content}
</body>
</html>
"""


def csv_to_landscape_pdf(csv_path, html_path, pdf_path):
    print(f"[*] Processing CSV Fleet Register: {csv_path}...")
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        rows = list(reader)

    if not rows:
        return

    header = rows[0]
    data_rows = rows[1:]

    table_html = ["<table><thead><tr>"]
    for col in header:
        table_html.append(f"<th>{html.escape(col)}</th>")
    table_html.append("</tr></thead><tbody>")

    for r in data_rows:
        table_html.append("<tr>")
        for i, val in enumerate(r):
            if val.strip() == "Active Verified":
                table_html.append(f"<td><span class='badge-active'>{html.escape(val)}</span></td>")
            else:
                table_html.append(f"<td>{html.escape(val)}</td>")
        table_html.append("</tr>")
    table_html.append("</tbody></table>")

    doc_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>CABI AFRICA LIMITED - FLEET AND DRIVER INVENTORY REGISTER</title>
    <style>{CSS_LANDSCAPE}</style>
</head>
<body>
    <div class="header-banner">
        <div style="font-size: 12pt; font-weight: bold; color: #0b2545;">REPUBLIC OF KENYA &bull; NATIONAL TRANSPORT AND SAFETY AUTHORITY (NTSA)</div>
        <div style="font-size: 10pt; font-weight: bold; color: #1e3a8a;">CABI AFRICA LIMITED &bull; FLEET AND DRIVER INVENTORY REGISTER</div>
        <div style="font-size: 8pt; color: #475569;">Formulated pursuant to Regulation 8 of the NTSA (Operation of Transport Network Companies) Regulations, 2022 | Company Reg: PVT-OD169L8L</div>
    </div>
    {"".join(table_html)}
    <div style="margin-top: 15px; font-size: 8pt; color: #475569; display: flex; justify-content: space-between;">
        <div><strong>Certified By:</strong> Director of Fleet & Safety Compliance, Cabi Africa Limited</div>
        <div><strong>Official Stamp / Seal:</strong> ____________________________________</div>
        <div><strong>Date of Submission:</strong> 10th January 2026</div>
    </div>
</body>
</html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(doc_html)

    cmd = [
        CHROME_BIN,
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--user-data-dir=/tmp/chrome-pdf-fleet-profile",
        f"--print-to-pdf={pdf_path}",
        "--no-pdf-header-footer",
        html_path
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    size_kb = os.path.getsize(pdf_path) / 1024
    print(f"    [+] Successfully generated PDF: {pdf_path} ({size_kb:.1f} KB)")


def render_file_to_pdf(input_md_path, title, output_html_path, output_pdf_path):
    print(f"[*] Processing {title}...")
    with open(input_md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    body = markdown_to_html_content(md_text)
    full_html = build_page_html(title, body)

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(full_html)

    cmd = [
        CHROME_BIN,
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--user-data-dir=/tmp/chrome-pdf-batch-profile",
        f"--print-to-pdf={output_pdf_path}",
        "--no-pdf-header-footer",
        output_html_path
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if os.path.exists(output_pdf_path):
        size_kb = os.path.getsize(output_pdf_path) / 1024
        print(f"    [+] Successfully generated PDF: {output_pdf_path} ({size_kb:.1f} KB)")
        return output_pdf_path, size_kb
    else:
        print(f"    [!] Error creating {output_pdf_path}: {res.stderr}")
        return None, 0


def render_html_to_pdf(input_html_path, output_pdf_path, title):
    print(f"[*] Processing HTML document: {title}...")
    cmd = [
        CHROME_BIN,
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--user-data-dir=/tmp/chrome-pdf-html-profile",
        f"--print-to-pdf={output_pdf_path}",
        "--no-pdf-header-footer",
        input_html_path
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if os.path.exists(output_pdf_path):
        size_kb = os.path.getsize(output_pdf_path) / 1024
        print(f"    [+] Successfully generated PDF: {output_pdf_path} ({size_kb:.1f} KB)")
        return output_pdf_path, size_kb
    return None, 0


def main():
    generated = []

    # Category 1 Corporate
    cat1_dir = os.path.join(WORKSPACE_DIR, "compliance/ntsa/category_1_corporate")
    docs_cat1 = [
        ("01_BOARD_RESOLUTION_NTSA_APPLICATION.md", "01_BOARD_RESOLUTION_NTSA_APPLICATION.html", "01_BOARD_RESOLUTION_NTSA_APPLICATION.pdf", "Board Resolution - NTSA Application"),
        ("02_REGISTERED_OFFICE_STATUTORY_DECLARATION.md", "02_REGISTERED_OFFICE_STATUTORY_DECLARATION.html", "02_REGISTERED_OFFICE_STATUTORY_DECLARATION.pdf", "Statutory Declaration of Registered Office"),
        ("03_CORPORATE_PROFILE_AND_STATUTORY_DISCLOSURE.md", "03_CORPORATE_PROFILE_AND_STATUTORY_DISCLOSURE.html", "03_CORPORATE_PROFILE_AND_STATUTORY_DISCLOSURE.pdf", "Corporate Profile and Statutory Disclosure"),
    ]
    for md_f, html_f, pdf_f, title in docs_cat1:
        pdf_path, sz = render_file_to_pdf(
            os.path.join(cat1_dir, md_f),
            title,
            os.path.join(cat1_dir, html_f),
            os.path.join(cat1_dir, pdf_f)
        )
        if pdf_path:
            generated.append((title, pdf_path, sz))

    # Category 4 Policies
    cat4_dir = os.path.join(WORKSPACE_DIR, "compliance/ntsa/category_4_policies_and_contracts")
    docs_cat4 = [
        ("03_CUSTOMER_CARE_AND_DISPUTE_RESOLUTION_SOP.md", "03_CUSTOMER_CARE_AND_DISPUTE_RESOLUTION_SOP.html", "03_CUSTOMER_CARE_AND_DISPUTE_RESOLUTION_SOP.pdf", "Customer Care and Dispute Resolution SOP"),
        ("04_ACCOUNT_DEACTIVATION_AND_APPEALS_POLICY.md", "04_ACCOUNT_DEACTIVATION_AND_APPEALS_POLICY.html", "04_ACCOUNT_DEACTIVATION_AND_APPEALS_POLICY.pdf", "Account Deactivation and Appeals Policy"),
        ("05_COMMUNITY_CODE_OF_CONDUCT.md", "05_COMMUNITY_CODE_OF_CONDUCT.html", "05_COMMUNITY_CODE_OF_CONDUCT.pdf", "Community Code of Conduct and Safety Charter"),
    ]
    for md_f, html_f, pdf_f, title in docs_cat4:
        pdf_path, sz = render_file_to_pdf(
            os.path.join(cat4_dir, md_f),
            title,
            os.path.join(cat4_dir, html_f),
            os.path.join(cat4_dir, pdf_f)
        )
        if pdf_path:
            generated.append((title, pdf_path, sz))

    # Fleet CSV
    csv_f = os.path.join(cat4_dir, "06_FLEET_AND_DRIVER_INVENTORY_REGISTER.csv")
    csv_html = os.path.join(cat4_dir, "06_FLEET_AND_DRIVER_INVENTORY_REGISTER.html")
    csv_pdf = os.path.join(cat4_dir, "06_FLEET_AND_DRIVER_INVENTORY_REGISTER.pdf")
    csv_to_landscape_pdf(csv_f, csv_html, csv_pdf)
    generated.append(("Fleet & Driver Inventory Register (Landscape)", csv_pdf, os.path.getsize(csv_pdf)/1024))

    # Category 5 Onboarding
    cat5_dir = os.path.join(WORKSPACE_DIR, "compliance/ntsa/category_5_onboarding_guide")
    pdf_path, sz = render_file_to_pdf(
        os.path.join(cat5_dir, "DRIVER_AND_VEHICLE_ONBOARDING_OPERATIONAL_GUIDE.md"),
        "Driver and Vehicle Onboarding Operational Guide",
        os.path.join(cat5_dir, "DRIVER_AND_VEHICLE_ONBOARDING_OPERATIONAL_GUIDE.html"),
        os.path.join(cat5_dir, "DRIVER_AND_VEHICLE_ONBOARDING_OPERATIONAL_GUIDE.pdf")
    )
    if pdf_path:
        generated.append(("Driver & Vehicle Onboarding Guide", pdf_path, sz))

    # Master Dossier
    ntsa_dir = os.path.join(WORKSPACE_DIR, "compliance/ntsa")
    pdf_path, sz = render_file_to_pdf(
        os.path.join(ntsa_dir, "CABI_AFRICA_NTSA_COMPLIANCE_MASTER_DOSSIER.md"),
        "NTSA Transport Network Operator Compliance Master Dossier",
        os.path.join(ntsa_dir, "CABI_AFRICA_NTSA_COMPLIANCE_MASTER_DOSSIER.html"),
        os.path.join(ntsa_dir, "CABI_AFRICA_NTSA_COMPLIANCE_MASTER_DOSSIER.pdf")
    )
    if pdf_path:
        generated.append(("NTSA Compliance Master Dossier", pdf_path, sz))

    # TNC Checklist HTML Artifact
    artifact_checklist = "/Users/user/.gemini/antigravity/brain/8d99b854-7d3e-4256-9de1-489135dc7725/tnc_checklist.html"
    if os.path.exists(artifact_checklist):
        target_checklist_pdf = os.path.join(ntsa_dir, "CABI_AFRICA_NTSA_LICENSING_CHECKLIST.pdf")
        pdf_path, sz = render_html_to_pdf(artifact_checklist, target_checklist_pdf, "NTSA Licensing Checklist & Progress")
        if pdf_path:
            generated.append(("NTSA 28-Point Licensing Checklist", pdf_path, sz))

    print("\n=======================================================")
    print("ALL FINAL COMPLIANCE DRAFTS GENERATED IN PDF FORMAT:")
    print("=======================================================")
    for title, path, sz in generated:
        print(f" - {title}: {path} ({sz:.1f} KB)")


if __name__ == "__main__":
    main()
