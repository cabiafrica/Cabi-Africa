# 7. Core Workflows

**Rationale:**
This section illustrates key system workflows using sequence diagrams to clarify component interactions.

## 7.1. Driver Registration & Commission Workflow

This diagram outlines the refined user journey, including the MLM commission calculation and driver group assignment.

```mermaid
sequenceDiagram
    participant User
    participant MW[Cabi Marketing Website]
    participant DLS[Driver Lead Service]
    participant UMS[User Management Service]
    participant MLM[MLM Service]
    participant DB[Cabi Database]
    participant AS[Authentication Service]
    participant CDA[Cabi Driver App]

    User->>MW: 1. Fills Registration Form (with referral code/group info)
    MW->>DLS: 2. POST /driver-leads/register
    DLS->>UMS: 3. Create User, Link Referrer & Assign Group
    UMS->>DB: 4. Persist User, Hierarchy & Group Data
    DB-->>UMS: 5. Success
    UMS-->>DLS: 6. New User ID
    DLS->>MLM: 7. POST /distribute-fee (newUserID, registrationFee)
    MLM->>UMS: 8. Get User Hierarchy (newUserID)
    UMS-->>MLM: 9. Returns Upline Chain & Group Info
    MLM->>DB: 10. Read Fee Formula & Group-Specific Rules
    DB-->>MLM: 11. Fee Formula Rules
    MLM->>MLM: 12. Calculate Commissions (based on formula & hierarchy)
    MLM->>DB: 13. Record Ledger Entries
    DB-->>MLM: 14. Success
    MLM-->>DLS: 15. Distribution Complete
    DLS-->>MW: 16. Registration Success
    MW->>User: 17. Show Success & Deep Link to App
    User->>CDA: 18. Opens Cabi Driver App (via Deep Link)
    CDA->>AS: 19. Authenticate User (newUserID)
    AS->>DB: 20. Validate Credentials
    DB-->>AS: 21. Valid
    AS-->>CDA: 22. Authentication Token
    CDA->>User: 23. Navigates to Onboarding Flow
```
