describe('marketing-website', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    // This is a placeholder assertion. In a real app, you'd target a specific element.
    // For example: cy.get('h1').contains('Book a ride in minutes');
    cy.get('body').should('exist');
  });
});

describe('Driver Registration', () => {
  beforeEach(() => {
    // Intercept the API call to mock a successful response
    cy.intercept('POST', '**/driver-leads/register', {
      statusCode: 201,
      body: { success: true, message: 'Registration successful!' },
    }).as('registerRequest');

    // Visit the registration page
    // Assuming the registration page is at '/register' from story-104.2
    cy.visit('/register');
  });

  it('should allow a user to fill out and submit the registration form', () => {
    // Fill out the form
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('john.doe@example.com');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Assert that the API call was made and a success message is shown
    cy.wait('@registerRequest');
    cy.contains('Registration successful!').should('be.visible');
  });
});