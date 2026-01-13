# Implementation Plan - Gamification, Ratings, and Loyalty System

## User Objective
Implement a comprehensive gamification system driven by user ratings and spending. This system will assign points, award badges, and unlock privileges (like loans, insurance, and analytics) for Drivers and Passengers. Additionally, it addresses the mechanism for risk-managed loan offsets for qualified drivers.

## 1. Conceptual Framework & Logic
### A. The Rating Engine
*   **Baseline**: Default Rating = 3 Stars.
*   **Scoring Logic**:
    *   5 Stars: +2 Points
    *   4 Stars: +1 Point
    *   3 Stars: 0 Points
    *   2 Stars: -1 Point
    *   1 Star: -3 Points (Severe penalty)
*   **The "6th Star"**: A conceptual "Bonus Round" or "Spin the Wheel" triggered after acquiring a set number of accumulated 5-star ratings (e.g., every 50 perfect trips).

### B. Badges & Privileges Hierarchy
Badges are milestones based on total points.
1.  **Bronze (Entry)**: Standard App Access.
2.  **Silver (Consistent)**: 
    *   *Passenger*: Priority Support.
    *   *Driver*: Access to Weekly Analytics.
3.  **Gold (Pro)**:
    *   *Passenger*: "Pay Later" options, Choose Specific Driver.
    *   *Driver*: Fuel Advances, Vehicle Service Discounts.
4.  **Platinum (Elite)**:
    *   *Passenger*: Monthly Free Trip (Redeemed points).
    *   *Driver*: **Big Ticket Loans** (Insurance, Mechanic Services), 0% Commission weeks.

### C. Passenger Loyalty
*   **Spend-to-Points**: 1 Point for every 100 KES spent.
*   **Redemption**: Points convertible to Wallet Credit or specific rewards.

### D. Loan Offset Mechanism (Answer to User Query)
To safely manage "Big Loans" (Mechanic, Insurance) for independent drivers:
*   **Eligibility**: Only available to **Gold/Platinum** badge holders (proven reliability).
*   **Smart Deductions**: Repayment is **automated** at the source.
    *   *Example*: Driver earns 1000 KES. System deducts 20% (200 KES) towards the loan *automatically* before settling the wallet.
    *   *Collateral*: The Driver's account status and future earnings are the collateral. If rating drops below a threshold, the account is restricted until a manual payment is made.

## 2. Implementation Steps

### Step 1: Admin Panel - Gamification Configuration
Create a new comprehensive settings module `GamificationManagement.tsx` in the Admin Panel.
*   **Tabs**:
    1.  **Point Rules**: Configure points earned/lost per star rating.
    2.  **Badge Levels**: Define thresholds (e.g., Silver = 500 pts) and assign privileges via checkboxes.
    3.  **Rewards & Economy**: Set spending ratios (KES to Points) and point values.
    4.  **Loan Configuration**: Define repayment percentages and eligibility by Badge Level.

### Step 2: Backend Mock Integration (`adminService.ts`)
*   Update `adminService` to store and retrieve:
    *   `GamificationConfig`
    *   `UserBadgeStatus` (Mock data for drivers showing their current badge and points).
    *   `LoanProducts` (Mock list of loans available to specific badges).

### Step 3: Admin Dashboard - Driver Loyalty View
*   Update `DriverPerformance.tsx` or create a new view to show:
    *   `GamificationConfig`
    *   `LoanProducts` (Mock list of loans available to specific badges).

## 3. Technical Specifications

### New Data Models (TypeScript Interfaces)
```typescript
interface RatingRule {
  stars: number;
  pointsAwarded: number;
}

interface BadgeLevel {
  id: string; // e.g., 'GOLD'
  name: string;
  minPoints: number;
  privileges: string[]; // ['LOAN_ACCESS', 'ANALYTICS_VIEW']
  loanDeductionRate: number; // e.g., 15 (15% deduction on earnings)
}

interface LoyaltyConfig {
  ratingRules: RatingRule[];
  badges: BadgeLevel[];
  passengerSpendRate: number; // e.g., 100 (100 KES = 1 Point)
}
```

## 4. Verification Plan
1.  **Configure**: Set 5 Stars to +5 Points and define a "Gold" badge at 100 Points.
2.  **Verify**: Ensure the UI reflects these rules.
3.  **Loan Logic**: Verify that the "Loan Deduction Rate" is configurable for specific badge levels (answering the safety question).
