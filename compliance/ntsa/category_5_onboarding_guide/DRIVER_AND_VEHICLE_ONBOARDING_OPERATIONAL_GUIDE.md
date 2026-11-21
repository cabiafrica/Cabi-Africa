# CABI AFRICA LIMITED
## DRIVER & VEHICLE ONBOARDING OPERATIONAL GUIDE
### COMPREHENSIVE REGULATORY SCREENING, VERIFICATION & AUDIT WORKFLOW
**AUTHOR:** CABI COMPLIANCE & SAFETY DIRECTORATE  
**TARGET AUDIENCE:** ONBOARDING AGENTS, COMPLIANCE OFFICERS, FLEET MANAGERS, SUPPORT LEADS  
**REGULATORY BASIS:** NTSA TNC REGULATIONS, 2022 | TRAFFIC ACT (CAP 403) | DCI KENYA STANDARDS

---

## 1. THE REGULATORY MANDATE
Under Regulation 6 and Regulation 8 of the **National Transport and Safety Authority (Transport Network Companies, Owners, Drivers and Passengers) Regulations, 2022**, a licensed TNC is **strictly prohibited** from dispatching rides to any driver or vehicle that has not been subjected to prior independent statutory verification. 

Allowing an unvetted driver or an uninspected vehicle onto the Cabi dispatch engine constitutes a strict liability offense under Kenyan law, exposing the company to:
1. Immediate regulatory suspension of the TNC Operator License;
2. Corporate fines and personal criminal liability for company directors;
3. Complete repudiation of insurance claims by underwriters in the event of an accident.

---

## 2. DRIVER VERIFICATION PIPELINE (5-TIER SCREENING)

Every applicant driver must pass through five rigorous validation gates before their Cabi Driver account status is flipped from `PENDING_VERIFICATION` to `ACTIVE`:

```
   [Applicant Driver App Registration]
                  │
                  ▼
   ┌───────────────────────────────────────────────┐
   │ Gate 1: Identity & Age Verification           │
   │ Gate 2: Smart Driving License (Class D1/A2)   │
   │ Gate 3: DCI Clearance & Accredited Trust Vetting│
   │ Gate 4: NTSA PSV Driver Badge / Credential    │
   │ Gate 5: Safety Induction & Profile Activation │
   └───────────────────────────────────────────────┘
                  │
                  ▼
   [Account Activated on Cabi Dispatch Engine]
```

---

### GATE 1: Identity & Age Qualification
* **Statutory Requirement:** Must be a Kenyan citizen (or valid work-permit holder) aged **at least 24 years of age** (Traffic Act statutory minimum for commercial passenger transport).
* **Document Required:** Original Kenyan National Identity Card (front & back) or valid Kenyan Passport.
* **Verification Steps:**
  1. Inspect the date of birth on the ID card; ensure the applicant has attained at least 24 years.
  2. Cross-check the name on the ID card against the KRA PIN certificate and registered mobile money number (must match exactly).
  3. Require a live "liveness selfie" during app registration to prevent identity theft.

---

### GATE 2: Smart Driving License (Smart DL) Verification
* **Statutory Requirement:** A valid, unexpired NTSA Smart Driving License card with the appropriate professional vehicle class endorsement.
* **Acceptable Class Endorsements:**
  * **Class D1 (Professional):** Light passenger vehicles / taxi cabs (up to 7 passengers).
  * **Class A2 / A3:** Commercial motorcycles (boda boda / delivery / courier).
  * *(Note: Class B1 Private is NOT legally sufficient for commercial ride-hailing).*
* **How to Verify:**
  1. Inspect the physical Smart DL card: check holographic chip, clear portrait, and expiration date.
  2. Scan the NTSA QR code on the back of the Smart DL using a standard QR scanner or the NTSA TIMS validation tool. It must return the driver’s official name, ID number, and active classes directly from the NTSA registry.
  3. Reject any paper/booklet driving licenses that have expired or have not been converted to the digital Smart DL.

---

### GATE 3: DCI Police Clearance & Secondary Trust Vetting
* **Statutory Requirement:** A valid Police Clearance Certificate issued by the Directorate of Criminal Investigations (DCI) issued within the **last six (6) months**.
* **Secondary Trust Layer:** Direct identity and background screening through an **accredited third-party background and trust verification agency**.
* **Common Industry Risk:** Forged / Photoshopped PDF certificates are widespread. **Visual inspection alone is prohibited.**
* **Mandatory Digital Verification Steps:**
  1. Locate the official DCI QR code printed on the top-right corner of the certificate.
  2. Scan the QR code using a mobile camera. It **MUST** redirect to an official Government of Kenya URL: `https://dci.ecitizen.go.ke/...` or `https://verify.ecitizen.go.ke/...`.
  3. Confirm that the online government verification page matches:
     * Full Name of the applicant;
     * ID Number;
     * Issue Date (must be within 6 months);
     * Criminal Record Status: **"NEGATIVE"** (No criminal convictions).
  4. If the QR code fails to resolve, links to an external non-government domain, or shows an active conviction, the application is **IMMEDIATELY REJECTED** and logged in the blacklisted fraud register.

---

### GATE 4: NTSA PSV Driver Badge & Welfare Affiliation
* **Statutory Requirement:** A valid NTSA Public Service Vehicle (PSV) Badge endorsing the driver for digital hailing operations.
* **How to Verify:**
  1. Request the physical PSV badge or the official eCitizen NTSA PSV Badge Verification Slip.
  2. Verify that the badge category specifies **"Driver"** (not Conductor) and **"PSV - Taxi / Digital Hailing"**.
  3. Confirm registration in the **Cabi Legacy Programme**.

---

### GATE 5: Driver Induction & Safety Training
* **Mandatory Driver Induction Course (2 Hours):**
  * Training on the Cabi Driver App features (dispatch acceptance, turn-by-turn navigation, in-app wallet);
  * Emergency protocols (when and how to activate the in-app SOS button);
  * Customer service etiquette and zero tolerance for harassment;
  * NTSA traffic compliance: seatbelt enforcement, speed limits, zero alcohol.

---

## 3. VEHICLE VERIFICATION & ROADWORTHINESS AUDIT

Every vehicle onboarding onto Cabi must undergo four mechanical and legal checks:

### 1. Proof of Ownership (Logbook Verification)
* **Document Required:** Copy of the official motor vehicle Logbook (Form E) issued by NTSA / BRS.
* **Validation:** If the vehicle owner is different from the driver, the driver must submit a signed **Vehicle Lease Agreement / Power of Attorney** from the registered owner authorizing commercial digital hailing usage.
* **Vehicle Age Restriction:** Under NTSA standards, vehicles operating under digital hailing should ideally be **no more than 8 to 10 years old** from the year of manufacture and in pristine mechanical condition.

### 2. NTSA Motor Vehicle Inspection Certificate
* **Statutory Requirement:** Annual Roadworthiness Inspection conducted at an official NTSA Motor Vehicle Inspection Center.
* **Validation Steps:**
  1. Inspect the yellow/blue NTSA Inspection Sticker affixed to the windscreen.
  2. Check the expiry date (must have at least thirty (30) days of validity remaining at onboarding).
  3. Scan the barcode/QR code on the sticker to verify that the vehicle class is registered as **"Commercial / PSV"**, NOT "Private".

### 3. Commercial PSV / Digital Hailing Insurance
* **Critical Requirement:** The vehicle must be covered by **Comprehensive Commercial PSV (Digital Hailing / Chauffeur-Driven) Insurance**.
* **Common Trap:** Many drivers submit standard "Private Comprehensive" insurance to save money. **Private insurance is strictly void for commercial passenger rides.**
* **Validation Checklist:**
  * Insurance Certificate must explicitly state: **"Use: Public Service Vehicle (Chauffeur-Driven / Digital Hailing / Special Taxi)"**.
  * Policy must cover: Passenger Legal Liability (PLL), Third-Party Property Damage, and Driver Personal Accident.
  * Check the policy expiry date; set automated platform reminders 30 days prior.

### 4. Secondary Roadworthiness Inspection (Accredited Center Audit)
In addition to the statutory NTSA certificate, the vehicle must clear a secondary multi-point safety and roadworthiness audit conducted at an **accredited automotive service and roadworthiness inspection center** or an authorized Cabi Hub:
* **Braking & Suspension:** Brake pad wear, disc condition, suspension bushings, and shock absorbers.
* **Tires:** Minimum 3mm tread depth across all 4 tires + 1 fully inflated spare tire.
* **Safety Restraints & Visibility:** Functional 3-point seatbelts on all passenger seats, clean windscreens without line-of-sight cracks, and working wipers.
* **Mandatory Safety Gear:** Valid dry-powder Fire Extinguisher (1kg or 2kg) + 2 reflective safety triangles (lifesavers) + first aid kit.

### 5. Motorcycle Roadworthiness Audit (Boda Boda / Delivery)
* **Helmets:** Two (2) standard-compliant helmets (one for the rider and one for the passenger).
* **Reflective Gear:** Two (2) high-visibility reflective vests/jackets with Cabi identification.
* **Mechanical:** Functional front and rear drum/disc brakes, dual rear-view mirrors, working headlights, brake lights, and turn indicators.

---

## 4. AUTOMATED CONTINUOUS COMPLIANCE IN CABI BACKEND

To ensure that no driver operates with expired credentials after onboarding, the Cabi administrative system integrates **Automated Document Expiry Alarms**:

```
 [Expiry Date - 30 Days] ──► Push Notification & SMS Warning to Driver
 [Expiry Date - 14 Days] ──► Reminder Alert + Admin Console Warning Flag
 [Expiry Date - 2 Days]  ──► Final Urgent Alert: Upload Renewal
 [Expiry Date + 00:00]   ──► AUTOMATIC PLATFORM LOCKOUT (Zero Dispatches)
```

1. **Automated Lockout Trigger:**  
   The database cron job runs daily at 00:01 AM. If a driver’s Smart DL, Good Conduct Certificate, PSV Badge, Vehicle Inspection, or PSV Insurance reaches its expiry timestamp, the system automatically transitions the profile status to `SUSPENDED_DOCUMENT_EXPIRED`.
2. **Dispatch Blackout:**  
   The dispatch algorithm immediately filters out any driver in `SUSPENDED_DOCUMENT_EXPIRED` state from the nearby driver query.
3. **Instant Reactivation:**  
   As soon as the driver uploads a renewed, verified document and the compliance agent approves it, the lockout is lifted immediately.

---

## 5. REPOSITORY ARCHIVING & REGULATORY AUDIT READINESS
* **Digital Dossier:** Every driver and vehicle must have an immutable digital dossier stored in Cabi’s cloud storage containing all certified documents.
* **Statutory Inspections:** These records must be readily accessible for on-demand inspection by NTSA compliance auditors during routine licensing audits.
