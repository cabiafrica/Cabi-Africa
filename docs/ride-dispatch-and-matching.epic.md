---
id: epic-22
title: Ride Dispatch and Matching
status: IN PROGRESS
---

## Description

As a platform, I need a robust and efficient dispatch system to manage incoming ride requests and match them with suitable, available drivers in real-time. This system is the core of the ride-hailing service, directly impacting passenger wait times and driver utilization.

## Goals

- Develop a `Dispatch Service` to handle the lifecycle of a ride request.
- Implement a driver-scoring algorithm to determine the best driver for a given request (e.g., based on proximity, rating, vehicle type).
- Create a real-time communication mechanism to offer rides to drivers.
- Manage the state of a ride from "searching" to "driver assigned".
- Provide APIs for the passenger and driver apps to interact with the dispatch process.

## Stories
- story-22.1: Handle Incoming Ride Requests in Dispatch Service
- story-22.2: Implement Driver Scoring and Selection Algorithm
- story-22.3: Offer Ride to Selected Driver and Handle Response
- story-22.4: Implement E2E Tests for Ride Request Endpoint