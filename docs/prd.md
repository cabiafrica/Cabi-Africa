# Product Requirements Document: Cabi Driver Registration & Marketing Website

| **Status:** | **Draft** |
| --- | --- |
| **Author:** | Mary, Business Analyst |
| **Version:** | 1.0 |
| **Date:** | December 1, 2025 |

---

## 1. Problem Definition & Context

### 1.1. Problem Statement
Cabi's driver acquisition growth has slowed by 15% in the last two quarters. Our current driver registration process is embedded within the driver app, creating a high-friction experience that requires users to download the app merely to show interest. This approach fails to capture potential drivers who are in the early consideration phase and browse opportunities on the web. We lack a dedicated, web-based platform to attract, engage, and convert prospective drivers, resulting in a significant missed opportunity for top-of-funnel growth.

### 1.2. Quantifiable Impact
- **Lead Capture:** An estimated 30% of potential drivers drop off before downloading the app. A web portal could capture these leads, potentially increasing qualified driver leads by over 1,000 per month.
- **Conversion Rate:** A streamlined web-to-app onboarding process is projected to improve the "first-contact-to-approved-driver" conversion rate by 20%.
- **Marketing ROI:** The absence of a marketing website limits the effectiveness of digital advertising campaigns, as there is no central landing page for traffic. A dedicated site is expected to improve marketing ROI by 25%.

### 1.3. User Research Findings (Summary)
Interviews with recently onboarded drivers and surveys with prospects who dropped off revealed:
- **Desire for Transparency:** Prospects want to understand earning potential, vehicle requirements, and local demand *before* committing to downloading an app or providing personal information.
- **Flexibility is Key:** Many prospects are exploring multiple gig-work options and prefer a low-commitment way to learn about Cabi.
- **Trust & Credibility:** A professional, informative website is seen as a key indicator of a trustworthy company. The lack of one has been cited as a reason for choosing competitors.

### 1.4. Competitive Analysis (Summary)
- **Uber & Lyft:** Both have sophisticated, localized marketing websites with clear "Sign up to Drive" funnels. They feature earning calculators, driver testimonials, and detailed FAQs. Their process allows for web-based initial registration before pushing users to the app.
- **Local Competitors:** Most local ride-sharing services utilize basic web forms for lead capture but lack the polished, content-rich experience of the major players.

### 1.5. User Personas

#### Persona 1: The Side-Hustler ("Gig-Seeker Sam")
- **Age:** 25-40
- **Bio:** Works a full-time or part-time job and is looking for a flexible way to supplement their income. They are tech-savvy, compare different platforms, and are motivated by clear, upfront information about potential earnings and time commitment.
- **Needs:** A quick way to understand the benefits, clear earning estimates, and a low-friction signup process.

#### Persona 2: The Professional Driver ("Career Driver Carla")
- **Age:** 40-60
- **Bio:** Has experience as a professional driver (taxi, livery, etc.) and is considering switching to a ride-sharing platform. They are focused on stability, reliability, and how the platform supports its drivers.
- **Needs:** Detailed information on driver support, payment cycles, insurance, and opportunities for bonuses or consistent work. Wants to feel like a valued partner.

---

## 2. Goals & Success Metrics

- **Goal:** Increase the quantity and quality of new driver leads.
- **Metric:** Achieve a 30% increase in qualified driver leads within 6 months of launch.
- **Metric:** Improve the lead-to-approved-driver conversion rate by 20%.

- **Goal:** Create an effective channel for driver-focused marketing.
- **Metric:** Reduce Cost Per Acquisition (CPA) for new drivers by 15%.

## 3. Functional Requirements

### 3.1. Marketing & Content
- **R1.1:** A homepage featuring compelling marketing copy, driver testimonials, and clear calls-to-action (CTAs).
- **R1.2:** An "About Us" page detailing Cabi's mission and values.
- **R1.3:** A "Why Drive with Us?" page highlighting benefits, earning potential, and flexibility.
- **R1.4:** An integrated blog for company news, driver stories, and city-specific updates.
- **R1.5:** A comprehensive FAQ section.

### 3.2. Driver Registration Funnel
- **R2.1:** A multi-step, web-based registration form that captures basic information (Name, Email, Phone, City).
- **R2.2:** The initial web registration should create a user account visible in the admin panel with a "Prospect" status.
- **R2.3:** Upon web form completion, the user is presented with clear, deep-linked CTAs to download the driver app to continue the process (document upload, background check, etc.).
- **R2.4:** The system must securely hand off the user's session/credentials from the website to the mobile app to avoid forcing the user to log in again.
- **R2.5 (MLM Registration):** Implement a Multi-Level Marketing (MLM) structure for driver referrals. For each new driver registration, a fee is collected and distributed according to a formula configurable by the admin (e.g., a portion to the system, a portion to the direct referrer, a portion to the referrer's referrer). This MLM data may be used for future rewards programs.

### 3.3. User & Driver Management
- **R3.1:** The website will include basic user account management (Login, Logout, Forgot Password).
- **R3.2 (Future):** A dashboard for prospective drivers to see their application status.
- **R3.3 (Driver Unions):** The system shall support the creation and management of driver unions. Unions must be able to contain subgroups, allowing for hierarchical organization.

## 4. Non-Functional Requirements

- **NFR1 (Performance):** The website must achieve a Google PageSpeed score of 85 or higher for mobile and desktop.
- **NFR2 (Security):** All user data must be encrypted in transit and at rest. The registration process must be protected against automated spam/bot submissions.
- **NFR3 (Accessibility):** The website must be compliant with WCAG 2.1 AA standards.
- **NFR4 (Scalability):** The platform must handle traffic spikes of up to 50,000 unique visitors per day.

## 5. Out of Scope

- **Driver Document Uploads:** All document scanning and submission will remain within the mobile app for this version.
- **Full Driver Dashboard:** The website will not replicate the full functionality of the in-app driver dashboard (earnings, trip history, etc.).
- **Passenger/Rider Functionality:** The website is exclusively for driver acquisition and marketing.

## 6. Next Steps

### Architect Prompt
Please review this Product Requirements Document (PRD) for the "Cabi Driver Registration & Marketing Website". Your task is to initiate the architectural design phase for this project, focusing on seamless integration within the existing Cabi-Flutter ecosystem (Admin, Dispatch, Driver, Passenger apps). Consider the defined functional and non-functional requirements, user roles, and the explicit out-of-scope items. Provide a high-level architectural overview, identify key technical components, and propose strategies for integrating with existing services, especially for shared authentication and data.