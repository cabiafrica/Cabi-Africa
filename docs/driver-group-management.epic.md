---
id: epic-21
title: Driver Group and MLM Hierarchy Management
status: IN PROGRESS
---

## Description

As an administrator, I need a robust system to create, manage, and organize drivers into hierarchical groups and subgroups. This system is the foundation for the Multi-Level Marketing (MLM) structure, enabling referral tracking, commission calculations, and organized management of the driver network.

## Goals

- Establish a data model for hierarchical driver groups (parent-child relationships).
- Develop administrative UI/APIs to create, view, update, and delete driver groups.
- Allow administrators to assign drivers to specific groups.
- Lay the groundwork for the `MLM Service` to traverse these hierarchies for commission calculations.

## Stories
- story-21.1: Implement Backend for Driver Group Hierarchy
- story-21.2: Implement Admin UI for Driver Group Management
- story-21.3: Implement Admin UI for Assigning Drivers to Groups
- story-21.4: Implement E2E Tests for Driver Group Management API