# Epic: Driver Payouts

**Status:** Done
**Priority:** High

## Description
Implement the end-to-end workflow for calculating driver earnings and processing payouts. This includes managing payout methods (M-Pesa, Bank), calculating net earnings after commissions and deductions, and initiating transfers.

## Goals
1. Allow drivers to manage their payout details securely.
2. Accurately calculate net earnings (Gross Fare - Commission - SACCO - Penalties).
3. Provide a transparent view of earnings and deductions to drivers.
4. Enable admins to review and initiate payout batches.

## Scope
- Driver App: Payout Method Management, Earnings View.
- Admin Panel: Payout Processing Dashboard.
- Backend: Payout Service, Integration with Payment Gateways.

## Key Stories
- Manage Payout Methods (Driver)
- View Earnings Breakdown (Driver)
- Admin Payout Processing
- Automated Weekly Payout Job