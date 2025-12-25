# GitHub Project Board Template: Driver Acquisition & MLM Registration Funnel

**Epic:** epic-101 (driver-acquisition-funnel)  
**Created:** 2025-12-12  
**Author:** Bob (Scrum Master)

---

## 📋 **Setup Instructions**

### **Step 1: Create GitHub Project**
1. Navigate to your repository: `https://github.com/your-org/cabi-monorepo`
2. Click **Projects** tab → **New Project**
3. Select **Board** view
4. Name: `Driver Acquisition & MLM Funnel (Epic-101)`
5. Description: `Complete driver acquisition funnel from marketing website to MLM commission distribution`

### **Step 2: Configure Board Columns**

Create the following columns (in order):

1. **📥 Backlog** - Stories not yet started
2. **📋 Ready** - Stories ready to be picked up (meets DoR)
3. **🏗️ In Progress** - Currently being worked on
4. **👀 In Review** - Code review or QA testing
5. **✅ Done** - Completed and deployed to staging
6. **🚀 Production** - Deployed to production

### **Step 3: Configure Automation**

Enable these automations:
- **To Do → In Progress**: When issue is assigned
- **In Progress → In Review**: When PR is opened
- **In Review → Done**: When PR is merged
- **Done → Production**: When deployed (manual move)

---

## 🎫 **Issue Templates**

### **Story Issue Template**

```markdown
## Story: [Title]
**Epic:** epic-101 (driver-acquisition-funnel)  
**Story ID:** story-101.X  
**Sprint:** Sprint X  
**Story Points:** X  
**Priority:** HIGH/MEDIUM/LOW

### Description
[User story in format: As a [role], I want [feature] so that [benefit]]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Dependencies
- Depends on: #issue-number
- Blocks: #issue-number

### Technical Notes
[Any technical considerations, architecture decisions, or implementation notes]

### Definition of Done
- [ ] Code written and reviewed (2+ approvals)
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] QA validated acceptance criteria
- [ ] No critical/high bugs
- [ ] Merged to main
- [ ] Deployed to staging

### Resources
- PRD: [Link to section]
- Architecture: [Link to section]
- Design: [Figma link if applicable]
```

### **Task Issue Template**

```markdown
## Task: [Title]
**Parent Story:** #story-issue-number  
**Assignee:** @username  
**Estimated Hours:** X

### Description
[Clear description of what needs to be done]

### Subtasks
- [ ] Subtask 1
- [ ] Subtask 2
- [ ] Subtask 3

### Acceptance Criteria
- [ ] Task-specific criteria

### Technical Details
[Code snippets, file paths, API endpoints, etc.]
```

---

## 📊 **Initial Board Setup**

### **Column: 📥 Backlog**

No issues initially (all stories are READY or IN_PROGRESS)

---

### **Column: 📋 Ready**

#### **Issue #1: story-101.2 - Implement Web-Based Driver Registration Form UI**
```markdown
**Story Points:** 13  
**Sprint:** Sprint 2  
**Labels:** `frontend`, `high-priority`, `epic-101`

**Description:**
As a prospective driver, I want to begin the registration process through a simple web form
so that I can show my interest without having to download the mobile app first.

**Acceptance Criteria:**
- [ ] Multi-step form created in user-portal
- [ ] Form fields: First Name, Last Name, Email, Phone, City, Referral Code (optional)
- [ ] Client-side validation implemented
- [ ] Google reCAPTCHA v3 integrated
- [ ] Success message with app download CTA
- [ ] Stubbed API submission handler

**Dependencies:**
- Depends on: #story-101.1 (homepage for CTA link)

**Files to Create:**
- `apps/user-portal/src/pages/register/page.tsx`
- `apps/user-portal/src/components/DriverRegistrationForm.tsx`

**Files to Modify:**
- `apps/user-portal/src/pages/index.tsx` (add Sign Up button)
```

---

#### **Issue #2: story-101.3 - Implement Backend for Web-Based Driver Registration**
```markdown
**Story Points:** 21  
**Sprint:** Sprint 3  
**Labels:** `backend`, `high-priority`, `epic-101`, `payment`

**Description:**
As a developer, I want to implement the backend service for the web-based driver registration form,
so that prospective driver data can be securely captured, validated, stored, and the driver registration
fee can be collected and distributed according to the MLM formula.

**Acceptance Criteria:**
- [ ] `driver-lead-service` NestJS app created
- [ ] `POST /driver-leads/register` endpoint implemented
- [ ] reCAPTCHA server-side validation
- [ ] User Management Service integration (create User + DriverProfile with PROSPECT status)
- [ ] Referral code validation and linking
- [ ] Stripe payment integration
- [ ] MLM Service trigger via `POST /mlm/distribute-fee`
- [ ] Frontend form updated to call live endpoint

**Dependencies:**
- Depends on: #story-101.2 (requires frontend form)

**Files to Create:**
- `apps/driver-lead-service/src/main.ts`
- `apps/driver-lead-service/src/app/app.module.ts`
- `apps/driver-lead-service/src/app/driver-lead.controller.ts`
- `apps/driver-lead-service/src/app/driver-lead.service.ts`

**Technical Notes:**
- Use Stripe test mode for development
- Implement idempotency for payment processing
- Add comprehensive error handling
```

---

#### **Issue #3: story-101.4 - Implement Backend for MLM Registration Fee Distribution**
```markdown
**Story Points:** 21  
**Sprint:** Sprint 4  
**Labels:** `backend`, `high-priority`, `epic-101`, `mlm`

**Description:**
As a developer, I want to implement the backend service for distributing the driver registration fee,
so that referrers are compensated according to the configured MLM formula when a new driver they referred signs up.

**Acceptance Criteria:**
- [ ] `mlm-service` NestJS app created
- [ ] `POST /mlm/distribute-fee` endpoint implemented
- [ ] Fetch referral hierarchy from User Management Service
- [ ] Read MlmFeeFormula from database
- [ ] Calculate commissions for sponsor and upline
- [ ] Create RegistrationFeeLedger entries
- [ ] Handle edge cases (no referrer, invalid hierarchy)
- [ ] Audit logging for all calculations

**Dependencies:**
- Depends on: #story-101.3 (requires driver-lead-service trigger)

**Files to Create:**
- `apps/mlm-service/src/main.ts`
- `apps/mlm-service/src/app/app.module.ts`
- `apps/mlm-service/src/app/mlm.controller.ts`
- `apps/mlm-service/src/app/mlm.service.ts`

**Technical Notes:**
- Commission calculations must be 100% accurate
- All calculations must be auditable
- Use database transactions for ledger entries
```

---

### **Column: 🏗️ In Progress**

#### **Issue #4: story-101.1 - Create Static Marketing Pages for Driver Acquisition**
```markdown
**Story Points:** 8  
**Sprint:** Sprint 1  
**Labels:** `frontend`, `high-priority`, `epic-101`, `marketing`  
**Assignee:** @frontend-dev-1

**Description:**
As a prospective driver, I want to visit a professional and informative website
so that I can learn about the benefits of driving for Cabi before I decide to sign up.

**Acceptance Criteria:**
- [ ] Next.js app (`user-portal`) configured
- [ ] Homepage with driver value proposition
- [ ] "About Us" page
- [ ] "Why Drive with Us?" page
- [ ] Comprehensive FAQ section
- [ ] Tailwind CSS design system
- [ ] PageSpeed ≥85 (mobile and desktop)

**Current Status:**
- ✅ Next.js app initialized
- ✅ Tailwind configured
- 🏗️ Homepage in progress
- ⏳ About Us page pending
- ⏳ Why Drive page pending
- ⏳ FAQ page pending

**Files to Create:**
- `apps/user-portal/src/pages/index.tsx` (Homepage)
- `apps/user-portal/src/pages/about.tsx`
- `apps/user-portal/src/pages/why-drive.tsx`
- `apps/user-portal/src/pages/faq.tsx`
```

---

### **Column: 👀 In Review**

(Empty initially - issues move here when PRs are opened)

---

### **Column: ✅ Done**

(Empty initially - issues move here when PRs are merged)

---

### **Column: 🚀 Production**

(Empty initially - issues move here after production deployment)

---

## 🏷️ **Labels Configuration**

Create these labels in your repository:

### **Epic Labels**
- `epic-101` (color: #0052CC) - Driver Acquisition & MLM Funnel

### **Type Labels**
- `frontend` (color: #1D76DB) - Frontend work
- `backend` (color: #0E8A16) - Backend work
- `infrastructure` (color: #5319E7) - DevOps/Infrastructure
- `documentation` (color: #0075CA) - Documentation updates

### **Priority Labels**
- `high-priority` (color: #D73A4A) - Must be done this sprint
- `medium-priority` (color: #FBCA04) - Should be done this sprint
- `low-priority` (color: #0E8A16) - Nice to have

### **Status Labels**
- `blocked` (color: #D93F0B) - Blocked by dependency
- `needs-review` (color: #FBCA04) - Needs code review
- `needs-qa` (color: #FBCA04) - Needs QA validation
- `bug` (color: #D73A4A) - Bug found during development

### **Component Labels**
- `payment` (color: #F9D0C4) - Stripe payment integration
- `mlm` (color: #C5DEF5) - MLM commission logic
- `marketing` (color: #BFDADC) - Marketing pages
- `security` (color: #D4C5F9) - Security-related (reCAPTCHA, etc.)

---

## 📈 **Project Views**

### **View 1: Kanban Board (Default)**
- Group by: Column
- Sort by: Priority (High → Low)
- Filter: `epic-101`

### **View 2: Sprint View**
- Group by: Sprint
- Sort by: Story Points
- Filter: `epic-101` AND `sprint:current`

### **View 3: Team View**
- Group by: Assignee
- Sort by: Status
- Filter: `epic-101` AND `status:in-progress`

### **View 4: Roadmap View**
- Layout: Roadmap
- Group by: Sprint
- Show: Start date, Due date
- Filter: `epic-101`

---

## 📊 **Milestones**

Create these milestones:

### **Milestone 1: Sprint 1 - Marketing Foundation**
- **Due Date:** Week 2
- **Description:** Static marketing pages deployed to staging
- **Issues:** #story-101.1

### **Milestone 2: Sprint 2 - Registration Form**
- **Due Date:** Week 4
- **Description:** Registration form UI complete and tested
- **Issues:** #story-101.2

### **Milestone 3: Sprint 3 - Backend & Payment**
- **Due Date:** Week 6
- **Description:** Backend services and Stripe integration live
- **Issues:** #story-101.3

### **Milestone 4: Sprint 4 - MLM Distribution**
- **Due Date:** Week 8
- **Description:** MLM commission distribution complete, E2E validated
- **Issues:** #story-101.4

### **Milestone 5: Production Launch**
- **Due Date:** Week 9
- **Description:** Full epic deployed to production
- **Issues:** All stories

---

## 🔄 **Workflow Example**

### **Story Lifecycle:**

1. **Story Created** → Moves to **📋 Ready**
   - Product Owner creates issue from template
   - Adds labels, assigns to sprint
   - Ensures DoR is met

2. **Sprint Planning** → Assign to developer
   - Team commits to story
   - Developer assigned
   - Issue auto-moves to **🏗️ In Progress**

3. **Development** → Create PR
   - Developer creates feature branch
   - Writes code, tests, documentation
   - Opens PR → Issue auto-moves to **👀 In Review**

4. **Code Review** → Merge PR
   - 2+ approvals required
   - CI/CD passes
   - PR merged → Issue auto-moves to **✅ Done**

5. **Deployment** → Manual move to **🚀 Production**
   - Deployed to staging (automatic)
   - QA validates
   - Deployed to production (manual)
   - Issue manually moved to **🚀 Production**

---

## 📝 **Task Breakdown Example**

### **story-101.1: Create Static Marketing Pages**

Break down into these tasks:

#### **Task 1.1: Setup Next.js Application**
- [ ] Initialize Next.js app in monorepo
- [ ] Configure Tailwind CSS
- [ ] Set up folder structure
- [ ] Configure deployment pipeline

#### **Task 1.2: Create Homepage**
- [ ] Design hero section
- [ ] Add driver benefits section
- [ ] Add testimonials section
- [ ] Add CTA buttons
- [ ] Optimize images

#### **Task 1.3: Create About Us Page**
- [ ] Write company mission section
- [ ] Add team section
- [ ] Add values section
- [ ] Add contact information

#### **Task 1.4: Create Why Drive Page**
- [ ] Highlight earning potential
- [ ] Explain MLM benefits
- [ ] Add driver success stories
- [ ] Add comparison table (Cabi vs competitors)

#### **Task 1.5: Create FAQ Page**
- [ ] Write 20+ FAQs
- [ ] Implement accordion UI
- [ ] Add search functionality
- [ ] Categorize questions

#### **Task 1.6: Performance Optimization**
- [ ] Run PageSpeed Insights
- [ ] Optimize images (WebP, lazy loading)
- [ ] Implement code splitting
- [ ] Add CDN caching
- [ ] Achieve PageSpeed ≥85

---

## 🎯 **Success Metrics Dashboard**

Track these metrics in GitHub Project Insights:

### **Velocity Metrics:**
- Story points completed per sprint
- Average cycle time (Ready → Done)
- Lead time (Backlog → Production)

### **Quality Metrics:**
- Number of bugs found in QA
- Number of bugs found in production
- Code review turnaround time

### **Delivery Metrics:**
- Stories completed vs committed
- Sprint burndown
- Release frequency

---

## 🚀 **Quick Start Checklist**

- [ ] Create GitHub Project with Board view
- [ ] Configure 6 columns (Backlog → Production)
- [ ] Create labels (epic, type, priority, component)
- [ ] Create milestones for each sprint
- [ ] Create issues for all 4 stories using template
- [ ] Assign story-101.1 to Sprint 1
- [ ] Move story-101.1 to "In Progress"
- [ ] Break down story-101.1 into tasks
- [ ] Assign tasks to team members
- [ ] Start daily standups
- [ ] Track progress in project board

---

## 📞 **Support & Resources**

- **Project Board:** `https://github.com/your-org/cabi-monorepo/projects/X`
- **Epic Document:** `stories/driver-acquisition-funnel.epic.yml`
- **Sprint Plan:** `docs/sprint-plan-driver-acquisition.md`
- **Slack Channel:** `#driver-acquisition-epic`
- **Scrum Master:** Bob (@bob-sm)

---

**Ready to start Sprint 1? Let's build! 🚀**
