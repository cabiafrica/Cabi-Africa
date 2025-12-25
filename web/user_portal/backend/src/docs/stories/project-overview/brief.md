# Project Brief: CABI

## Executive Summary

CABI is a new taxi-hailing application designed specifically for the Kenyan market. It aims to disrupt the current duopoly of Uber and Bolt by solving the primary pain points of both drivers and passengers: unfair compensation and punitive rating systems. The core of our solution is a driver-and-passenger-centric platform built on three pillars: a unique Multi-Level Marketing (MLM) system for shared earnings, a "fair" rating system that promotes partnership, and gamification to drive loyalty. By transforming users into partners, CABI will build a more engaged, loyal, and profitable ride-hailing community.

## Problem Statement

The Kenyan ride-hailing market, while mature, is rife with dissatisfaction.

*   **For Drivers**: They face high commission rates (up to 25%), inconsistent earnings, and a constant fear of deactivation due to punitive and often biased rating systems. Existing platforms treat them as disposable commodities, offering no long-term loyalty or growth incentives.
*   **For Passengers**: The experience is purely transactional. While functional, there is a lack of trust, minimal safety innovation, and no reward for loyalty. They often switch between apps based purely on price, indicating weak brand affinity.

Existing solutions like Uber, Bolt, and Little Cab compete primarily on price and availability, but have failed to build a true community or a sustainable partnership model with their users. This creates a significant market gap for a platform that offers a better, fairer value proposition.

## Proposed Solution

CABI is a full-stack mobile application that directly addresses the market's problems by introducing a partnership-first model.

*   **Core Concept**: A reliable, safe, and easy-to-use taxi-hailing app with native M-Pesa integration.
*   **Key Differentiators**:
    1.  **Multi-Level Marketing (MLM) Engine**: Passengers and drivers can earn a continuous passive income by referring new users. A portion of every driver's commission is shared with their two-tier upline, creating a powerful incentive for network growth and loyalty.
    2.  **Fair Rating System**: All users start with a default 3-star "partner" rating. This is only adjusted by their counterpart post-ride, removing the anxiety of the "perfect 5-star" culture and fostering a more respectful environment.
    3.  **Gamification & Rewards**: A system of badges and reward points recognizes and rewards positive behavior, such as high ratings, frequent usage, and successful referrals, making the platform "sticky" and engaging.

This solution will succeed by shifting the dynamic from a simple service transaction to a community-driven partnership, giving both drivers and passengers a tangible stake in the platform's success.

## Target Users

*   **Primary User Segment: Kenyan Ride-Hailing Drivers**
    *   **Profile**: Tech-savvy individuals who own or have access to a vehicle, likely working across multiple platforms to maximize income. They are highly sensitive to commission rates and operational fairness.
    *   **Needs & Pain Points**: Higher and more stable earnings, fair treatment, a sense of job security, and a voice. They are frustrated by high commissions, arbitrary deactivations, and a lack of support.
    *   **Goals**: To earn a stable and respectable living, be treated as a professional partner, and have opportunities for financial growth.

*   **Secondary User Segment: Kenyan Urban Commuters**
    *   **Profile**: Students and professionals in urban centers like Nairobi who rely on ride-hailing for daily transport. They are tech-literate, price-conscious, and value safety and convenience.
    *   **Needs & Pain Points**: Safe, reliable, and affordable transportation. They are uninspired by current offerings and would be receptive to an app that offers more value.
    *   **Goals**: To get to their destination safely and affordably, and to feel valued as a customer. The opportunity to earn ride credits or cash through referrals is a strong potential motivator.

## Goals & Success Metrics

### Business Objectives

*   Achieve 5% market share in Nairobi within the first 12 months of operation.
*   Establish a driver fleet of 5,000 active drivers in Nairobi within 9 months.
*   Achieve a 40% user acquisition rate through the referral program by the end of Year 1.

### User Success Metrics

*   Driver retention rate > 70% month-over-month.
*   Passenger referral conversion rate > 15%.
*   Average driver rating maintained above 4.5 after the initial 3-star default adjustment.

### Key Performance Indicators (KPIs)

*   **Growth**: Daily Active Users (DAU), Completed Rides per Day, User & Driver Acquisition Cost (CAC).
*   **Engagement**: Referral Rate, Session Duration, Badge Achievement Rate.
*   **Financial**: Gross Bookings Value (GBV), Net Revenue, Average Commission per Ride.

## MVP Scope

### Core Features (Must Have)

*   **Passenger App**: User registration, ride request (with destination), fare estimation, driver tracking, M-Pesa & cash payments, post-ride rating, referral code generation/sharing.
*   **Driver App**: User registration, ride request acceptance/rejection, navigation to pickup/destination, earnings summary, referral network view, post-ride rating.
*   **Admin Panel**: User management (drivers/passengers), configuration of MLM commission splits and fees, basic analytics dashboard (rides, earnings, referrals).
*   **Core MLM Engine**: Backend logic to track two-tier referral trees and correctly calculate/attribute commission splits for each ride.
*   **Fair Rating System**: Backend and UI logic to support the 3-star default and mutual adjustment system.

### Out of Scope for MVP

*   Advanced gamification (leaderboards, complex badges).
*   SACCO integration and in-app financial products.
*   "Trip Preview" feature for drivers (will be a fast-follow reward feature).
*   Multiple ride types (e.g., Boda, Premium).
*   Scheduled rides and corporate accounts.
*   In-app chat between driver and passenger.

### MVP Success Criteria

The MVP will be considered successful if we can demonstrate a 10% week-over-week growth in completed rides and sign up our first 500 drivers within the first two months, with at least 20% of those drivers coming from referrals.

## Post-MVP Vision

*   **Phase 2 Features**: Introduce the tiered "Trip Preview" feature for high-performing drivers. Launch advanced gamification with leaderboards and tangible badge rewards. Begin partnerships for SACCO integration.
*   **Long-term Vision**: To become the leading ride-hailing platform in East Africa, known for its fair and sustainable partnership model. Expand into logistics and delivery services.
*   **Expansion Opportunities**: Geographic expansion to other Kenyan cities (Mombasa, Kisumu). Launching different vehicle classes (Boda, Premium, Shuttles).

## Technical Considerations

*   **Platform Requirements**: iOS and Android for mobile apps. Web-based admin panel.
*   **Technology Preferences**: To be determined by the Architect, but should be a modern, scalable stack (e.g., React Native/Flutter for mobile, Node.js/Python/Go for backend, PostgreSQL/MongoDB for database).
*   **Architecture Considerations**: A microservices architecture is recommended to isolate the core ride-hailing logic from the MLM and ratings engines. Must be built for scalability and real-time performance. M-Pesa integration is a critical, non-negotiable requirement.

## Constraints & Assumptions

*   **Constraints**: The initial launch will be limited to Nairobi. The development team consists of [Number] engineers. The project must launch within a [Timeline] timeframe.
*   **Key Assumptions**:
    *   The MLM earning potential will be a strong enough incentive to attract drivers from established platforms.
    *   Passengers will be motivated to participate in the referral program.
    *   The "Fair Rating" system will be perceived as a significant improvement by drivers.
    *   We can achieve seamless and reliable M-Pesa integration.

## Risks & Open Questions

*   **Key Risks**:
    *   **Competitive Retaliation**: Uber/Bolt could respond with aggressive price cuts or by copying our referral model.
    *   **Regulatory Hurdles**: Potential changes in Kenyan transport regulations could impact our business model.
    *   **MLM Perception**: The MLM model could be misunderstood or perceived negatively if not communicated clearly.
*   **Open Questions**:
    *   What are the optimal commission split percentages to be both competitive and profitable?
    *   How do we effectively prevent fraud within the referral system?
    *   What is the most effective marketing strategy to launch and communicate our unique value proposition?

## Next Steps

1.  **Create Product Requirements Document (PRD)**: Hand off this brief to the Product Manager to create a detailed PRD with epics and user stories.
2.  **Design System Architecture**: Hand off the PRD to the Architect to design the full-stack technical architecture.
3.  **Begin Prototyping**: Start low-fidelity wireframes for the core user flows of the driver and passenger apps.