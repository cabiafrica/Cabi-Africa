describe('Admin Document Review Flow', () => {
  const driverId = 'driver-123';

  beforeEach(() => {
    // Intercept the PATCH requests to the backend to verify they are sent correctly.
    // We give them aliases ('reviewLicense', 'reviewInsurance') to wait for them later.
    cy.intercept('PATCH', '/api/admin/documents/sub-2/review').as('reviewLicense');
    cy.intercept('PATCH', '/api/admin/documents/sub-3/review').as('reviewInsurance');

    // In a real-world scenario with a live backend, you might also intercept the initial
    // GET request to provide consistent mock data for the page load.
    // Since the page currently uses hardcoded mock data, we can proceed directly.

    // Visit the specific driver's review page.
    cy.visit(`/approvals/${driverId}`);
  });

  it('should allow an admin to reject a document with a reason', () => {
    // 1. Find the "Driver's License" document card and click "Reject".
    cy.contains('h2', "Driver's License")
      .parents('[class*="bg-white"]')
      .within(() => {
        cy.contains('button', 'Reject').click();
      });

    // 2. The rejection modal should appear.
    cy.contains('h2', "Reject Driver's License").should('be.visible');

    // 3. The confirm button should be disabled initially.
    cy.contains('button', 'Confirm Rejection').should('be.disabled');

    // 4. Type a reason into the textarea.
    const rejectionReason = 'The photo is blurry and unreadable.';
    cy.get('textarea[name="reason"]').type(rejectionReason);

    // 5. The confirm button should now be enabled.
    cy.contains('button', 'Confirm Rejection').should('be.enabled');

    // 6. Click to confirm the rejection.
    cy.contains('button', 'Confirm Rejection').click();

    // 7. Wait for the API call to complete and verify its request body.
    cy.wait('@reviewLicense').its('request.body').should('deep.equal', {
      status: 'Rejected',
      rejectionReason: rejectionReason,
    });

    // 8. The modal should close, and the buttons on the card should be disabled.
    cy.contains('h2', "Reject Driver's License").should('not.exist');
    cy.contains('h2', "Driver's License")
      .parents('[class*="bg-white"]')
      .within(() => {
        cy.contains('button', 'Reject').should('be.disabled');
        cy.contains('button', 'Approve').should('be.disabled');
      });
  });

  it('should allow an admin to approve a document', () => {
    // 1. Find the "Vehicle Insurance" card and click "Approve".
    cy.contains('h2', 'Vehicle Insurance')
      .parents('[class*="bg-white"]')
      .within(() => {
        cy.contains('button', 'Approve').click();
      });

    // 2. Wait for the API call and verify its body.
    cy.wait('@reviewInsurance').its('request.body').should('deep.equal', {
      status: 'Approved',
    });

    // 3. The buttons on the card should become disabled.
    cy.contains('h2', 'Vehicle Insurance')
      .parents('[class*="bg-white"]')
      .within(() => {
        cy.contains('button', 'Approve').should('be.disabled');
        cy.contains('button', 'Reject').should('be.disabled');
      });
  });
});