# CABI AFRICA LIMITED
## NTSA TRANSPORT NETWORK OPERATOR (TNC) LICENSE COMPLIANCE MASTER DOSSIER
### OFFICIAL STATUTORY SUBMISSION DIRECTORY
**SUBMITTED TO:** THE NATIONAL TRANSPORT AND SAFETY AUTHORITY (NTSA)  
**DIRECTORATE OF ROAD SAFETY & REGULATORY LICENSING**  
**LEGAL NOTICE NO. 120 OF 2022 (TNC REGULATIONS)**

---

### CORPORATE PARTICULARS
* **Legal Entity Name:** CABI AFRICA LIMITED
* **Registration Number:** PVT-OD169L8L
* **Registered Head Office:** Ridgeways Commercial Centre, 9 Park Square Mall, F13, Off Kiambu Road, Nairobi, Kenya
* **Postal Address:** P.O. Box 11942-10100 Kiambu/Nairobi, Kenya
* **Legal Counsel:** Mwangi Mungai Law Advocates (P.O. Box 11942-10100 Nairobi)
* **Official Corporate Email:** cabifastafrica@gmail.com
* **Dedicated Operations Support Phone:** +254 758 777 222
* **Statutory Commission Model:** Exactly 18% Platform Fee (Compliant with NTSA Statutory Cap)

---

## MASTER COMPLIANCE TABLE & DOCUMENT REPOSITORY

| No. | Statutory NTSA Requirement | Applicable Regulation | Verification Document / Source Code | Compliance Status |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Corporate Body Incorporation** | Reg. 4(1)(a) | Certificate of Incorporation (PVT-OD169L8L) & [03_CORPORATE_PROFILE_AND_STATUTORY_DISCLOSURE.md](file:///Users/user/Downloads/Cabi%20Africa%20Final/compliance/ntsa/category_1_corporate/03_CORPORATE_PROFILE_AND_STATUTORY_DISCLOSURE.md) | **100% READY** |
| **2** | **Physical Commercial Office in Kenya** | Reg. 4(1)(c) | [02_REGISTERED_OFFICE_STATUTORY_DECLARATION.md](file:///Users/user/Downloads/Cabi%20Africa%20Final/compliance/ntsa/category_1_corporate/02_REGISTERED_OFFICE_STATUTORY_DECLARATION.md) (Ridgeways Commercial Centre, Kiambu Road) | **100% READY** |
| **3** | **Board Resolution Authorizing Application** | Reg. 4(1) | [01_BOARD_RESOLUTION_NTSA_APPLICATION.md](file:///Users/user/Downloads/Cabi%20Africa%20Final/compliance/ntsa/category_1_corporate/01_BOARD_RESOLUTION_NTSA_APPLICATION.md) (Extract of Board Minutes) | **100% READY** |
| **4** | **Tax Compliance (KRA PIN & TCC)** | Reg. 4(1)(d) | Documented in Statutory Profile; KRA TCC attached | **100% READY** |
| **5** | **Data Protection Registration (ODPC)** | Reg. 4(1)(f) | Data Controller/Processor Compliance; privacy policies aligned with Data Protection Act 2019 | **100% READY** |
| **6** | **Statutory 18% Commission Cap** | Reg. 9 | Enforced in `commission.service.ts` (0.18), `payment.service.ts` (0.18), and Driver Contract Clause 8 | **100% READY** |
| **7** | **Transparent Upfront Fare Breakdown** | Reg. 10 | Implemented in `booking_screen.dart` (Base + Distance + Time + 18% Fee itemization) | **100% READY** |
| **8** | **In-App SOS Emergency Button** | Reg. 15 | Implemented in passenger & driver apps (`sos_button.dart`, `sos_service.dart`) with 24/7 dispatch | **100% READY** |
| **9** | **Real-Time GPS Tracking & Identification** | Reg. 8 & 16 | Real-time telemetry (`location_tracking_service.dart`) + Driver profile display (`driver_profile_screen.dart`) | **100% READY** |
| **10** | **Driver Partner Service Agreement** | Reg. 6 | [01_DRIVER_PARTNER_SERVICE_AGREEMENT.md](file:///Users/user/Downloads/Cabi%20Africa%20Final/compliance/ntsa/category_4_policies_and_contracts/01_DRIVER_PARTNER_SERVICE_AGREEMENT.md) (Mwangi Mungai Law Advocates, Class D1/A2, 18% cap, shift management) | **100% READY** |
| **11** | **Vehicle Owner Service Agreement** | Reg. 7 | [02_VEHICLE_OWNER_SERVICE_AGREEMENT.md](file:///Users/user/Downloads/Cabi%20Africa%20Final/compliance/ntsa/category_4_policies_and_contracts/02_VEHICLE_OWNER_SERVICE_AGREEMENT.md) (Strict Driver-App relationship, accredited inspection & vetting layers) | **100% READY** |
| **12** | **Customer Support & Dispute Resolution SOP** | Reg. 12 | [03_CUSTOMER_CARE_AND_DISPUTE_RESOLUTION_SOP.md](file:///Users/user/Downloads/Cabi%20Africa%20Final/compliance/ntsa/category_4_policies_and_contracts/03_CUSTOMER_CARE_AND_DISPUTE_RESOLUTION_SOP.md) (Dedicated line +254 758 777 222, escalation hierarchy) | **100% READY** |
| **13** | **Account Deactivation & Due Process Policy** | Reg. 14 | [04_ACCOUNT_DEACTIVATION_AND_APPEALS_POLICY.md](file:///Users/user/Downloads/Cabi%20Africa%20Final/compliance/ntsa/category_4_policies_and_contracts/04_ACCOUNT_DEACTIVATION_AND_APPEALS_POLICY.md) (Independent Appeals Committee, Category B reset penalty) | **100% READY** |
| **14** | **Community Safety Code of Conduct** | Reg. 13 | [05_COMMUNITY_CODE_OF_CONDUCT.md](file:///Users/user/Downloads/Cabi%20Africa%20Final/compliance/ntsa/category_4_policies_and_contracts/05_COMMUNITY_CODE_OF_CONDUCT.md) (Mandatory passenger photo verification, in-cabin cameras, zero harassment) | **100% READY** |
| **15** | **Fleet & Driver Inventory Register** | Reg. 5 | [06_FLEET_AND_DRIVER_INVENTORY_REGISTER.csv](file:///Users/user/Downloads/Cabi%20Africa%20Final/compliance/ntsa/category_4_policies_and_contracts/06_FLEET_AND_DRIVER_INVENTORY_REGISTER.csv) (Standard NTSA CSV schedule) | **100% READY** |
| **16** | **Driver & Vehicle Onboarding Verification** | Reg. 8 | [DRIVER_AND_VEHICLE_ONBOARDING_OPERATIONAL_GUIDE.md](file:///Users/user/Downloads/Cabi%20Africa%20Final/compliance/ntsa/category_5_onboarding_guide/DRIVER_AND_VEHICLE_ONBOARDING_OPERATIONAL_GUIDE.md) (DCI QR verification, Smart DL Class D1/A2, accredited vetting & inspection) | **100% READY** |
| **17** | **Application Filing & Statutory Fee** | Reg. 4(2) | KES 100,000 statutory operator fee allocated on eCitizen | **100% READY** |

---

### SUMMARY OF COMPETITOR HARMONIZATION (UBER, BOLT, LITTLE)
* **Uber Kenya & Bolt Benchmark:** High Court litigation centered on commission cuts and due process. Cabi has legally embedded the **statutory 18% cap** and instituted the **Independent Appeals Committee**, protecting Cabi against driver strikes and regulatory sanctions.
* **Secondary Inspection & Vetting Benchmark:** Cabi adopted an **accredited automotive center secondary inspection layer** and **accredited third-party background trust screening**, establishing a higher trust and safety standard for Kenyan passengers and drivers.
* **Driver Welfare Benchmark:** Replaced coercive commission structures with the **Cabi Legacy Programme**, providing transparent earnings reconciliations and voluntary savings.

---

**SUBMITTED FOR AND ON BEHALF OF CABI AFRICA LIMITED**  
\
______________________________________________  
**Managing Director / Chief Executive Officer**  
CABI AFRICA LIMITED  
Date: ________________________________________  
