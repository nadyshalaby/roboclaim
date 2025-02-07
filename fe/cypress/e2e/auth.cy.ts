describe('Authentication', () => {
  // Use environment variables for test credentials
  const testUser = {
    email: Cypress.env('TEST_USER_EMAIL') || 'user@example.com',
    password: Cypress.env('TEST_USER_PASSWORD') || 'password',
  }

  beforeEach(() => {
    cy.visit('/')
  })

  describe('Login', () => {
    it('should successfully login with valid credentials', () => {
      cy.login(testUser.email, testUser.password)

      // Wait for the login request to complete
      cy.wait('@loginRequest').its('response.statusCode').should('eq', 201)

      // Wait for navigation
      cy.url().should('include', '/dashboard')

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
      cy.get('[data-testid=user-menu]', { timeout: 10000 })
        .should('exist')
        .should('be.visible')
        .should('have.attr', 'data-user-state', 'logged-in')
        .within(() => {
          cy.contains('Dashboard').should('be.visible')
          cy.contains('Profile').should('be.visible')
          cy.contains('Logout').should('be.visible')
        })
    })

    it('should show error with invalid credentials', () => {
      cy.login(testUser.email, 'wrongpassword')

      // Wait for failed API response
      cy.wait('@loginRequest').its('response.statusCode').should('eq', 401)

      // Check for error message
      cy.get('[data-testid=login-form]').within(() => {
        cy.get('[data-testid=error-message]')
          .should('be.visible')
          .and('contain', 'Invalid credentials')
      })

      // Verify we're still on the login page
      cy.url().should('include', '/login')
    })
  })

  describe('Register', () => {
    const newUser = {
      email: `test${Date.now()}@example.com`,
      password: 'Test123!@#',
    }

    beforeEach(() => {
      // Intercept registration requests
      cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/register`).as('registerRequest')
    })

    it('should successfully register a new user', () => {
      cy.register(newUser.email, newUser.password)

      // Wait for successful registration
      cy.wait('@registerRequest').its('response.statusCode').should('eq', 201)

      // Verify redirect to login
      cy.url().should('include', '/login')
      cy.get('[data-testid=success-message]')
        .should('be.visible')
        .and('contain', 'Registered successfully')
    })

    it('should show error when registering with existing email', () => {
      cy.register(testUser.email, testUser.password)

      // Wait for error response
      cy.wait('@registerRequest').its('response.statusCode').should('eq', 400)

      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Email already exists')
    })
  })

  describe('Logout', () => {
    beforeEach(() => {
      // Login and wait for success before testing logout
      cy.login(testUser.email, testUser.password)
      cy.wait('@loginRequest').its('response.statusCode').should('eq', 200)

      // Intercept logout request
      cy.intercept('POST', `${Cypress.env('apiUrl')}/auth/logout`).as('logoutRequest')
    })

    it('should successfully logout', () => {
      cy.logout()
      cy.url().should('include', '/login')
      cy.get('[data-testid=login-button]').should('be.visible')
    })
  })
})
