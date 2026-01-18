import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3001',
        specPattern: '__e2e__/**/*.cy.{js,jsx,ts,tsx}',
        supportFile: false,
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});
