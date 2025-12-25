---
id: epic-23
title: MLM Commission and Fee Management
status: NEW
---

## Description

As an administrator, I need a system to configure, manage, and audit the commission and fee structure for the Multi-Level Marketing (MLM) program. This includes defining how registration fees are distributed among sponsors and upline drivers, and maintaining an immutable ledger of all transactions for financial accuracy and transparency.

## Goals

- Develop administrative capabilities to create and update the MLM fee distribution formula.
- Implement the backend logic within the `MLM Service` to calculate commissions based on the active formula and the driver hierarchy.
- Create a `RegistrationFeeLedger` to serve as the immutable record of all fee distributions.
- Ensure all financial calculations are accurate and auditable.

## Stories
- story-23.1: Admin UI and API for MLM Fee Formula Management
- story-23.2: Implement Backend Logic for Commission Calculation and Ledgering