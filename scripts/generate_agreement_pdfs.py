#!/usr/bin/env python3
"""
generate_agreement_pdfs.py
Converts CABI AFRICA LIMITED legal markdown agreements into publication-quality legal PDFs.
Harmonized with NTSA Legal Notice No. 120 of 2022, Data Protection Act 2019, and Mwangi Mungai Law Advocates drafts.
"""

import os
import re
import subprocess
import html

WORKSPACE_DIR = "/Users/user/Downloads/Cabi Africa Final"
CATEGORY_4_DIR = os.path.join(WORKSPACE_DIR, "compliance/ntsa/category_4_policies_and_contracts")

CHROME_BIN = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

AGREEMENTS = [
    {
        "id": "driver",
        "title": "CABI AFRICA LIMITED DRIVER SERVICES AGREEMENT",
        "input_md": os.path.join(CATEGORY_4_DIR, "01_DRIVER_PARTNER_SERVICE_AGREEMENT.md"),
        "output_html": os.path.join(CATEGORY_4_DIR, "CABI_AFRICA_LIMITED_DRIVER_SERVICES_AGREEMENT.html"),
        "output_pdf": os.path.join(CATEGORY_4_DIR, "CABI_AFRICA_LIMITED_DRIVER_SERVICES_AGREEMENT.pdf"),
        "doc_type": "DRIVER SERVICES AGREEMENT"
    },
    {
        "id": "owner",
        "title": "CABI AFRICA LIMITED VEHICLE OWNER SERVICE AGREEMENT",
        "input_md": os.path.join(CATEGORY_4_DIR, "02_VEHICLE_OWNER_SERVICE_AGREEMENT.md"),
        "output_html": os.path.join(CATEGORY_4_DIR, "CABI_AFRICA_LIMITED_VEHICLE_OWNER_AGREEMENT.html"),
        "output_pdf": os.path.join(CATEGORY_4_DIR, "CABI_AFRICA_LIMITED_VEHICLE_OWNER_AGREEMENT.pdf"),
        "doc_type": "VEHICLE OWNER SERVICE AGREEMENT"
    },
    {
        "id": "passenger",
        "title": "CABI AFRICA PASSENGER TERMS AND CONDITIONS OF USE, RIDE-HAILING POLICY AND PASSENGER CODE OF CONDUCT",
        "input_md": os.path.join(CATEGORY_4_DIR, "00_PASSENGER_BY_LAWS_AND_TERMS_OF_USE.md"),
        "output_html": os.path.join(CATEGORY_4_DIR, "CABi_AFRICA_PASSENGER_BY_LAWS_.html"),
        "output_pdf": os.path.join(CATEGORY_4_DIR, "CABi_AFRICA_PASSENGER_BY_LAWS_.pdf"),
        "doc_type": "PASSENGER TERMS OF USE & CODE OF CONDUCT"
    }
]

CSS_STYLES = """
@page {
    size: A4 portrait;
    margin: 18mm 18mm 18mm 18mm;
    @top-right {
        content: "CABI AFRICA LIMITED | LEGAL COMPLIANCE";
        font-family: 'Times New Roman', Georgia, serif;
        font-size: 8pt;
        color: #666;
    }
    @bottom-center {
        content: "Page " counter(page);
        font-family: 'Times New Roman', Georgia, serif;
        font-size: 9pt;
        color: #444;
    }
}

body {
    font-family: 'Times New Roman', 'Georgia', serif;
    font-size: 10.2pt;
    line-height: 1.45;
    color: #111;
    margin: 0;
    padding: 0;
    text-align: justify;
}

h1 {
    font-size: 15pt;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    margin-top: 12px;
    margin-bottom: 6px;
    letter-spacing: 0.5px;
    color: #0b2545;
    page-break-after: avoid;
}

h2 {
    font-size: 12.5pt;
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    margin-top: 16px;
    margin-bottom: 10px;
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
    font-size: 10.2pt;
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
    text-justify: inter-word;
}

hr {
    border: none;
    border-top: 1px solid #ccc;
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

.advocate-stamp {
    border: 1.5px solid #334155;
    padding: 8px 12px;
    margin: 14px 0;
    font-size: 9pt;
    background-color: #f1f5f9;
    max-width: 340px;
    page-break-inside: avoid;
}

.advocate-stamp strong {
    color: #0b2545;
    font-size: 9.5pt;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 9.2pt;
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

.execution-block {
    margin-top: 18px;
    page-break-inside: avoid;
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
    font-size: 9.2pt;
}

.schedule-header {
    background-color: #0b2545;
    color: #ffffff;
    padding: 6px 10px;
    font-weight: bold;
    font-size: 10.5pt;
    margin-top: 20px;
    margin-bottom: 10px;
    text-transform: uppercase;
    page-break-after: avoid;
    break-after: avoid;
}

.page-break {
    page-break-before: always;
    break-before: page;
}

.badge {
    display: inline-block;
    padding: 2px 5px;
    font-size: 8pt;
    font-weight: bold;
    border-radius: 3px;
    background-color: #dbeafe;
    color: #1e40af;
}

.fillable-line {
    border-bottom: 1px dotted #555;
    display: inline-block;
    min-width: 250px;
}
"""

def markdown_to_html_content(md_text):
    lines = md_text.split("\n")
    html_lines = []
    in_table = False
    table_lines = []
    in_ul = False
    in_ol = False

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
            # Check separator
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
        # Escape raw HTML entities first except deliberate ones
        text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        # Bold + Italic
        text = re.sub(r"\*\*\*(.*?)\*\*\*", r"<strong><em>\1</em></strong>", text)
        # Bold
        text = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", text)
        # Italic
        text = re.sub(r"\*(.*?)\*", r"<em>\1</em>", text)
        # Underscore fillable lines: 4 or more underscores
        text = re.sub(r"_{4,}", r"<span class='fillable-line'>&nbsp;</span>", text)
        return text

    for line in lines:
        stripped = line.strip()

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

        # Horizontal rule
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
            title_text = inline_formatting(stripped[3:])
            if "SCHEDULE 1" in title_text.upper() or "SCHEDULE 3" in title_text.upper():
                html_lines.append(f"<div class='page-break'></div><div class='schedule-header'>{title_text}</div>")
            elif "SCHEDULE" in title_text.upper():
                html_lines.append(f"<div class='schedule-header'>{title_text}</div>")
            elif "EXECUTION" in title_text.upper():
                html_lines.append(f"<div class='page-break'></div><h2>{title_text}</h2>")
            else:
                html_lines.append(f"<h2>{title_text}</h2>")
            continue
        if stripped.startswith("### "):
            html_lines.append(close_lists())
            title_text = inline_formatting(stripped[4:])
            if "SCHEDULE 1" in title_text.upper() or "SCHEDULE 3" in title_text.upper():
                html_lines.append(f"<div class='page-break'></div><div class='schedule-header'>{title_text}</div>")
            elif "SCHEDULE" in title_text.upper():
                html_lines.append(f"<div class='schedule-header'>{title_text}</div>")
            elif "EXECUTION" in title_text.upper():
                html_lines.append(f"<div class='page-break'></div><h3>{title_text}</h3>")
            else:
                html_lines.append(f"<h3>{title_text}</h3>")
            continue
        if stripped.startswith("#### "):
            html_lines.append(close_lists())
            html_lines.append(f"<h4>{inline_formatting(stripped[5:])}</h4>")
            continue

        # Unordered list
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

        # Ordered list
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

        # Drawn by box special detection
        if "DRAWN BY:" in stripped or "DRAWN BY" == stripped:
            html_lines.append(close_lists())
            html_lines.append("<div class='advocate-stamp'>")
            html_lines.append(f"<strong>{inline_formatting(stripped)}</strong><br/>")
            continue
        if "MWANGI MUNGAI LAW ADVOCATES" in stripped:
            html_lines.append(f"<strong>{inline_formatting(stripped)}</strong><br/>")
            continue
        if any(term in stripped for term in ["9 PARK SQUARE", "OFF KIAMBU ROAD", "P.O. BOX 11942", "P.O BOX 11942", "NAIROBI, KENYA", "NAIROBI .", "Email: mmlawadvocates"]):
            html_lines.append(f"{inline_formatting(stripped)}<br/>")
            if "NAIROBI" in stripped or "mmlawadvocates" in stripped:
                html_lines.append("</div>")
            continue

        # Default paragraph
        html_lines.append(close_lists())
        html_lines.append(f"<p>{inline_formatting(stripped)}</p>")

    if in_table:
        html_lines.append(process_table(table_lines))
    html_lines.append(close_lists())

    return "\n".join(html_lines)


def build_full_html(doc_title, doc_type, body_html):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{html.escape(doc_title)}</title>
    <style>
        {CSS_STYLES}
    </style>
</head>
<body>
    <div class="legal-header-box">
        <div style="font-size: 13pt; font-weight: bold; letter-spacing: 1px; color: #0b2545;">REPUBLIC OF KENYA</div>
        <div style="font-size: 10pt; font-weight: bold; color: #1e3a8a; margin-top: 2px;">NATIONAL TRANSPORT AND SAFETY AUTHORITY (NTSA)</div>
        <div style="font-size: 9pt; color: #475569;">Transport Network Companies Regulations, 2022 (Legal Notice No. 120 of 2022)</div>
        <div style="margin-top: 4px; font-size: 10pt; font-weight: bold; color: #0b2545;">CABI AFRICA LIMITED &bull; REGISTRATION NO. PVT-OD169L8L</div>
    </div>

    {body_html}

</body>
</html>
"""


def convert_agreements():
    os.makedirs(CATEGORY_4_DIR, exist_ok=True)
    results = []

    for item in AGREEMENTS:
        print(f"[*] Processing {item['doc_type']}...")
        if not os.path.exists(item["input_md"]):
            print(f"[!] Error: File not found: {item['input_md']}")
            continue

        with open(item["input_md"], "r", encoding="utf-8") as f:
            md_content = f.read()

        body_html = markdown_to_html_content(md_content)
        full_html = build_full_html(item["title"], item["doc_type"], body_html)

        with open(item["output_html"], "w", encoding="utf-8") as f:
            f.write(full_html)
        print(f"    [+] Wrote HTML: {item['output_html']}")

        # Render PDF via Chrome Headless
        cmd = [
            CHROME_BIN,
            "--headless",
            "--no-sandbox",
            "--disable-gpu",
            "--user-data-dir=/tmp/chrome-pdf-builder-profile",
            f"--print-to-pdf={item['output_pdf']}",
            "--no-pdf-header-footer",
            item["output_html"]
        ]
        
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if proc.returncode == 0 and os.path.exists(item["output_pdf"]):
            size_kb = os.path.getsize(item["output_pdf"]) / 1024
            print(f"    [+] Successfully generated PDF: {item['output_pdf']} ({size_kb:.1f} KB)")
            results.append((item["doc_type"], item["output_pdf"], size_kb))
        else:
            print(f"    [!] Error running Chrome: {proc.stderr[:300]}")

    print("\n[SUMMARY OF GENERATED AGREEMENT PDFS]")
    for doc_type, pdf_path, size_kb in results:
        print(f" - {doc_type}: {pdf_path} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    convert_agreements()
