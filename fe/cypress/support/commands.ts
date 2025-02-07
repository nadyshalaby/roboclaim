/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      register(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
      uploadFile(filePath: string, fileType: string): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  // Clear any existing auth data
  cy.clearLocalStorage()
  cy.clearCookies()

  // Intercept the login request to verify it later
  cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/login`).as('loginRequest')

  // Visit login page and wait for it to load
  cy.visit('/login', {
    timeout: 10000
  })
  
  // Wait for the login form and fill it in
  cy.get('[data-testid=login-form]', { timeout: 10000 })
    .should('be.visible')
    .within(() => {
      cy.get('[data-testid=email-input]').type(email)
      cy.get('[data-testid=password-input]').type(password)
      cy.get('[data-testid=login-button]').click()
    })
})

// Register command
Cypress.Commands.add('register', (email: string, password: string) => {
  cy.visit('/register')
  cy.get('[data-testid=email-input]').type(email)
  cy.get('[data-testid=password-input]').type(password)
  cy.get('[data-testid=confirm-password-input]').type(password)
  cy.get('[data-testid=register-button]').click()
  cy.url().should('not.include', '/register')
})

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid=user-menu]').click()
  cy.get('[data-testid=logout-button]').click()
  cy.url().should('include', '/login')
})

// File upload command
Cypress.Commands.add('uploadFile', (filePath: string, fileType: string) => {
  cy.get('[data-testid=file-input]').attachFile({
    filePath: filePath,
    encoding: 'utf-8',
    mimeType: fileType
  })
})

export {}
