import os

def create_declaration_pdf(output_path, logo_jpg_path):
    with open(logo_jpg_path, 'rb') as f:
        jpeg_data = f.read()

    # A4 Page: 595.28 x 841.89 points
    # Left margin: 54, Right margin: 541 (Printable width = 487)
    stream_cmds = []

    # 1. Top Green Accent Bar
    stream_cmds.append("0.02 0.59 0.41 rg\n54 798 487 3.5 re\nf")

    # 2. Light Mode Logo: 90 x 50 points (Aspect ratio ~1.8:1 matching 1024x569) at x=54, y=730
    stream_cmds.append("q\n90 0 0 50 54 730 cm\n/Im1 Do\nQ")

    # 3. Letterhead Text (x=154, next to the logo)
    stream_cmds.append("BT\n0.02 0.59 0.41 rg\n/F2 15 Tf\n154 766 Td\n(CABI FAST AFRICA LIMITED) Tj\nET")
    stream_cmds.append("BT\n0.3 0.3 0.3 rg\n/F1 8.5 Tf\n12 TL\n154 750 Td")
    stream_cmds.append("(P.O. Box 64844 - 00620, Nairobi, Kenya  |  Location: Ridgeways Mall, Kiambu Road, Nairobi) Tj\nT*")
    stream_cmds.append("(Email: mailtosamkaranja@gmail.com  |  Tel: +254 711 786 722 / +254 758 777 222) Tj\nET")

    # 4. Divider Line
    stream_cmds.append("0.85 0.85 0.85 RG\n0.75 w\n54 718 m\n541 718 l\nS")

    # 5. Date
    stream_cmds.append("BT\n0.15 0.15 0.15 rg\n/F2 9.5 Tf\n54 698 Td\n(Date: 21st November 2026) Tj\nET")

    # 6. Recipient
    stream_cmds.append("BT\n0.15 0.15 0.15 rg\n/F2 9.5 Tf\n13 TL\n54 680 Td\n(TO:) Tj\nT*")
    stream_cmds.append("/F1 9.5 Tf\n(The Data Commissioner,) Tj\nT*")
    stream_cmds.append("(Office of the Data Protection Commissioner \\(ODPC\\),) Tj\nT*")
    stream_cmds.append("(P.O. Box 30920 - 00100, Nairobi, Kenya.) Tj\nET")

    # 7. Subject
    stream_cmds.append("BT\n0.05 0.05 0.05 rg\n/F2 10.5 Tf\n54 616 Td\n(RE: STATUTORY DECLARATION OF EMPLOYEE HEADCOUNT FOR CABI FAST AFRICA LIMITED) Tj\nET")
    stream_cmds.append("0.2 0.2 0.2 RG\n0.75 w\n54 613 m\n530 613 l\nS")

    # 8. Intro Paragraph
    stream_cmds.append("BT\n0.15 0.15 0.15 rg\n/F1 9.5 Tf\n13.5 TL\n54 594 Td")
    stream_cmds.append("(I, the undersigned, being a duly authorized Director of CABI FAST AFRICA LIMITED, do hereby solemnly make) Tj\nT*")
    stream_cmds.append("(this statutory declaration in support of our application for registration as a Data Controller with the Office of) Tj\nT*")
    stream_cmds.append("(the Data Protection Commissioner \\(ODPC\\):) Tj\nET")

    # 9. Numbered Points
    points_data = [
        ("1. Operational Status: Cabi Fast Africa Limited is a newly incorporated digital transport technology entity",
         "currently in its initial pre-launch infrastructure setup and platform testing phase."),
        ("2. Employee Headcount: As of the date of this declaration, the company has zero (0) salaried employees.",
         "System architecture, administrative setup, and operations are managed directly by the founding Directors."),
        ("3. Statutory Tier: Under the Data Protection (Registration of Data Controllers and Processors) Regulations, 2021,",
         "the company formally falls under the Micro Enterprise tier (range: 0 - 9 staff)."),
        ("4. Mandatory Category: The company registers under the non-exempt mandatory category of",
         "\"Transport services firms (including online passenger hailing applications)\"."),
        ("5. Compliance Undertaking: The company undertakes to notify the Office of the Data Protection Commissioner",
         "should there be any material change in employee headcount exceeding this tier during the registration period.")
    ]

    current_y = 542
    for line1, line2 in points_data:
        safe1 = line1.replace("(", "\\(").replace(")", "\\)")
        safe2 = line2.replace("(", "\\(").replace(")", "\\)")
        
        stream_cmds.append(f"BT\n0.1 0.1 0.1 rg\n/F1 9.5 Tf\n13 TL\n54 {current_y} Td")
        stream_cmds.append(f"({safe1}) Tj\nT*")
        stream_cmds.append(f"({safe2}) Tj\nET")
        current_y -= 34

    # 10. Concluding sentence after paragraph 5 (spaced cleanly at current_y - 10)
    current_y -= 10
    stream_cmds.append(f"BT\n0.15 0.15 0.15 rg\n/F1 9.5 Tf\n54 {current_y} Td")
    stream_cmds.append("(This declaration is made in good faith and in full compliance with the Kenya Data Protection Act, 2019.) Tj\nET")

    # 11. Signature intro
    current_y -= 32
    stream_cmds.append(f"BT\n0.1 0.1 0.1 rg\n/F1 9.5 Tf\n54 {current_y} Td")
    stream_cmds.append("(Declared and signed on behalf of CABI FAST AFRICA LIMITED:) Tj\nET")

    # 12. Signature Line (positioned at current_y - 50)
    sign_line_y = current_y - 50
    stream_cmds.append(f"0.3 0.3 0.3 RG\n1 w\n54 {sign_line_y} m\n260 {sign_line_y} l\nS")

    # 13. Name & Titles
    stream_cmds.append(f"BT\n0.1 0.1 0.1 rg\n/F2 10.5 Tf\n13.5 TL\n54 {sign_line_y - 14} Td")
    stream_cmds.append("(SAMUEL NJUGUNA KARANJA) Tj\nT*")
    stream_cmds.append("/F1 9 Tf\n(Director / Acting Data Protection Officer) Tj\nT*")
    stream_cmds.append("(Cabi Fast Africa Limited) Tj\nT*")
    stream_cmds.append("(Nairobi, Kenya) Tj\nET")

    # 14. Footer
    stream_cmds.append("0.88 0.88 0.88 RG\n0.5 w\n54 45 m\n541 45 l\nS")
    stream_cmds.append("BT\n0.5 0.5 0.5 rg\n/F1 8 Tf\n54 33 Td")
    stream_cmds.append("(Cabi Fast Africa Limited  |  Statutory Declaration under Kenya Data Protection Act, 2019  |  ODPC Portal) Tj\nET")

    content = "\n".join(stream_cmds)
    content_bytes = content.encode("latin1")

    objs = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> /XObject << /Im1 7 0 R >> >> >>",
        f"<< /Length {len(content_bytes)} >>\nstream\n".encode("latin1") + content_bytes + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
        f"<< /Type /XObject /Subtype /Image /Width 1024 /Height 569 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length {len(jpeg_data)} >>\nstream\n".encode("latin1") + jpeg_data + b"\nendstream"
    ]

    pdf = b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"
    xref = [0]
    for i, obj in enumerate(objs, 1):
        xref.append(len(pdf))
        pdf += f"{i} 0 obj\n".encode("latin1") + obj + b"\nendobj\n"

    xref_pos = len(pdf)
    pdf += f"xref\n0 {len(objs)+1}\n0000000000 65535 f \n".encode("latin1")
    for pos in xref[1:]:
        pdf += f"{pos:010d} 00000 n \n".encode("latin1")

    pdf += f"trailer\n<< /Size {len(objs)+1} /Root 1 0 R >>\nstartxref\n{xref_pos}\n%%EOF\n".encode("latin1")

    with open(output_path, "wb") as f:
        f.write(pdf)
    print(f"Successfully generated {output_path} with light mode logo ({len(pdf)} bytes)")

if __name__ == "__main__":
    create_declaration_pdf(
        "docs/compliance/DECLARATION_OF_EMPLOYEES.pdf",
        "docs/compliance/cabi_logo_light.jpg"
    )
