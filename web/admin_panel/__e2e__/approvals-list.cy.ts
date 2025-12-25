describe('Admin Approvals List Page', () => {
  const mockDrivers = [
    { id: 'driver-123', name: 'Driver driver-123', email: 'driver-123@example.com', submissionDate: '2024-08-20T11:00:00Z', status: 'Pending Review' },
    { id: 'driver-abc', name: 'Driver driver-abc', email: 'driver-abc@example.com', submissionDate: '2024-08-21T12:00:00Z', status: 'Pending Review' },
  ];

  beforeEach(() => {
    // Intercept the initial data fetch for the page
    cy.intercept('GET', '/api/admin/documents?*', {
      statusCode: 200,
      body: mockDrivers,
    }).as('getDrivers');

    cy.visit('/approvals');
    cy.wait('@getDrivers'); // Wait for the initial load to complete
  });

  it('should allow an admin to search for a driver by name', () => {
    const searchTerm = 'driver-abc';

    // Mock the response for the search query
    cy.intercept('GET', `/api/admin/documents?*search=${searchTerm}*`, {
      statusCode: 200,
      body: [mockDrivers.find(d => d.id === 'driver-abc')],
    }).as('searchDrivers');

    // 1. Type the search term into the input field
    cy.get('input[placeholder*="Search by name or email"]').type(searchTerm);

    // 2. Click the search button
    cy.get('button[type="submit"]').click();

    // 3. Verify the API was called with the correct search parameter
    cy.wait('@searchDrivers').its('request.url').should('include', `search=${searchTerm}`);

    // 4. Verify the URL was updated correctly
    cy.url().should('include', `search=${searchTerm}`);

    // 5. Verify the UI updated to show only the searched driver
    cy.contains('td', 'Driver driver-abc').should('be.visible');
    cy.contains('td', 'Driver driver-123').should('not.exist');
  });

  it('should display a "No drivers found" message for an unsuccessful search', () => {
    cy.intercept('GET', '/api/admin/documents?*search=nonexistent*', { statusCode: 200, body: [] }).as('searchDrivers');
    cy.get('input[placeholder*="Search by name or email"]').type('nonexistent');
    cy.get('button[type="submit"]').click();
    cy.wait('@searchDrivers');
    cy.contains('td', 'No drivers found.').should('be.visible');
  });
});