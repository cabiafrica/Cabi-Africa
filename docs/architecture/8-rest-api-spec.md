# 8. REST API Spec

**Rationale:**
This section defines the OpenAPI 3.0 specification for the new backend services.

Here is the OpenAPI 3.0 specification for the `Driver Lead Service` and `MLM Service`:

```yaml
openapi: 3.0.0
info:
  title: Cabi Backend Services API
  version: 1.0.0
  description: API for managing driver prospect registrations and MLM fee distribution.
servers:
  - url: /api/v1
    description: Base path for services behind API Gateway

paths:
  /driver-leads/register:
    post:
      summary: Register a new driver prospect
      operationId: registerDriverLead
      requestBody:
        description: Driver prospect registration data
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegistrationRequest'
      responses:
        '201':
          description: Successful registration.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RegistrationSuccessResponse'
        '400':
          description: Invalid input or user already exists.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
  /admin/mlm/formula:
    get:
      summary: Get the current MLM fee distribution formula
      operationId: getMlmFormula
      responses:
        '200':
          description: The current MLM formula.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MlmFormula'
    put:
      summary: Update the MLM fee distribution formula
      operationId: updateMlmFormula
      requestBody:
        description: The new MLM formula
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MlmFormula'
      responses:
        '200':
          description: Formula updated successfully.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MlmFormula'

components:
  schemas:
    RegistrationRequest:
      type: object
      required: [email, firstName, lastName, phone, city, recaptchaToken]
      properties:
        email: { type: string, format: email }
        firstName: { type: string }
        lastName: { type: string }
        phone: { type: string }
        city: { type: string }
        recaptchaToken: { type: string }
    RegistrationSuccessResponse:
      type: object
      properties:
        userId: { type: string, format: uuid }
        message: { type: string }
    MlmFormula:
      type: object
      properties:
        rules:
          type: array
          items:
            type: object
            properties:
              recipient: { type: string, enum: [sponsor, upline, company] }
              value: { type: number }
              type: { type: string, enum: [fixed, percentage] }
    ErrorResponse:
      type: object
      properties:
        code: { type: string }
        message: { type: string }
```
