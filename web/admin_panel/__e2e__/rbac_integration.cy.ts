describe('RBAC Integration Test', () => {
    const timestamp = Date.now();
    const testRoleName = `TEST_ROLE_BROWSER_${timestamp}`;
    const displayName = `Browser Test Role ${timestamp}`;

    it('Should login, create, verify, and delete a role', () => {
        // 1. Visit Login
        cy.visit('/login');

        // 2. Perform Login
        cy.get('input[name="email"]').should('be.visible').type('ithrivebusinessnetworks@gmail.com');
        cy.get('input[name="password"]').should('be.visible').type('Admin@2026');
        cy.get('button[type="submit"]').click();

        // 3. Verify Login Success
        cy.url().should('not.include', '/login');

        // 4. Navigate to Roles
        cy.visit('/roles');
        cy.contains('Roles & Permissions', { timeout: 10000 }).should('be.visible');

        // 5. Create Role
        cy.contains('button', 'Create New Role').click();
        cy.url().should('include', '/roles/new');

        // Fill Form
        // MUI Filled Inputs can be tricky, targeting by label text often works best if we find the input related to it.
        // We can target the input by placeholder or by parent structure.
        cy.get('input[placeholder="e.g. Super Administrator"]').type(displayName);

        // System Identifier
        cy.contains('label', 'System Identifier').parent().find('input').type(testRoleName);

        // Select Platform (Admin Panel is default but let's click it to be sure)
        cy.contains('Admin Panel').click();

        // Save
        cy.contains('button', 'Save Configuration').click();

        // 6. Verify Creation
        // Should redirect back to /roles
        cy.url().should('match', /\/roles$/);
        cy.contains(displayName).should('be.visible');
        cy.contains(testRoleName).should('be.visible');

        // 7. Delete Role
        // Setup spy for window.confirm
        cy.on('window:confirm', (str) => {
            expect(str).to.contain(`Are you sure you want to delete role "${displayName}"?`);
            return true;
        });

        // Find the row and click delete
        cy.contains('tr', testRoleName).within(() => {
            cy.get('[data-testid="DeleteIcon"]').closest('button').click();
        });

        // 8. Verify Deletion
        cy.contains(testRoleName).should('not.exist');
    });
});
