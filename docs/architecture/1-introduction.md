# 1. Introduction

This document outlines the overall project architecture for the Cabi Marketing Website, including backend systems, shared services, and non-UI specific concerns. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development, ensuring consistency and adherence to chosen patterns and technologies.

**Relationship to Frontend Architecture:**
If the project includes a significant user interface, a separate Frontend Architecture Document will detail the frontend-specific design and MUST be used in conjunction with this document. Core technology stack choices documented herein (see "Tech Stack") are definitive for the entire project, including any frontend components.

## 1.1. Starter Template or Existing Project

For this greenfield project, a modern web framework like Next.js (React) is provisionally assumed to meet performance (PageSpeed > 85) and SEO requirements, and to facilitate the development of the multi-step registration form. The final technology stack will be explicitly defined and confirmed in the "Tech Stack" section of this document.

**Rationale:**
Based on the PRD, this is a new greenfield project for a web-based marketing and registration portal. However, it must integrate deeply with the existing Cabi-Flutter mobile ecosystem, particularly for user account creation and the hand-off to the driver app. The choice of a starter template or framework is critical for meeting the high-performance and scalability requirements (NFR1, NFR4) while ensuring a smooth developer experience.

A modern, server-side rendering (SSR) or static site generation (SSG) framework is highly recommended to achieve the PageSpeed goals. Options like Next.js (React), Nuxt.js (Vue), or Astro would be strong candidates.

## 1.2. Change Log

| Date         | Version | Description              | Author  |
| :----------- | :------ | :----------------------- | :------ |
| 2025-12-01   | 1.1     | Added MLM & Subgroup architecture | Winston |
| 2025-12-01   | 1.0     | Initial document creation| Winston |
