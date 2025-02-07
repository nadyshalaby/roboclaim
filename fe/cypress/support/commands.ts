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
Cypress.Commands.add('login', (email: string, password: string, shouldSucceed: boolean = true) => {
  // Clear any existing auth cookies
  cy.clearCookie('auth-storage')

  // Prepare the mock response data
  const mockUser = {
    id: '1',
    email: email,
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const mockResponse = {
    statusCode: 200,
    body: {
      user: mockUser,
      access_token: 'fake-jwt-token'
    }
  }

  // Set the auth cookie before the request
  cy.setCookie('auth-storage', JSON.stringify({
    state: {
      user: mockUser,
      token: mockResponse.body.access_token
    },
    version: 0
  }), { path: '/' })

  // Mock the login API response based on shouldSucceed
  cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/login`, (req) => {
    if (shouldSucceed) {
      req.reply(mockResponse)
    } else {
      req.reply({
        statusCode: 401,
        body: {
          message: 'Invalid credentials'
        }
      })
    }
  }).as('loginRequest')

  // Visit login page and wait for it to load
  cy.visit('/login', {
    failOnStatusCode: false,
    retryOnStatusCodeFailure: true,
    timeout: 10000
  })
  
  // Wait for the login form to be present and visible
  cy.get('[data-testid=login-form]', { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .within(() => {
      // Type credentials
      cy.get('[data-testid=email-input]')
        .should('be.visible')
        .type(email)
      
      cy.get('[data-testid=password-input]')
        .should('be.visible')
        .type(password)
      
      cy.get('[data-testid=login-button]')
        .should('be.visible')
        .click()
    })

  // Wait for the login API response
  cy.wait('@loginRequest')
  
  // Wait for navigation
  cy.url().should('include', '/dashboard')
  
  // Debug: Log the current DOM structure
  cy.document().then((doc) => {
    cy.log('Current DOM structure:', doc.body.innerHTML)
  })
  
  // Check if user menu exists with more detailed error
  cy.get('body').then($body => {
    if ($body.find('[data-testid=user-menu]').length === 0) {
      cy.log('User menu not found. Available data-testid elements:')
      const elements = $body.find('[data-testid]')
      elements.each((_, el) => {
        cy.log(`Found element with data-testid: ${el.getAttribute('data-testid')}`)
      })
    }
  })
  
  // Now try to find the menu
  cy.get('[data-testid=user-menu]', { timeout: 10000 }).should('exist')
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
