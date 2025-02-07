describe('Authentication', () => {
  const testUser = {
    email: 'user@example.com',
    password: 'password',
  }

  beforeEach(() => {
    cy.visit('/')
  })

  describe('Login', () => {
    it('should successfully login with valid credentials', () => {
      cy.login(testUser.email, testUser.password)
      
      // Wait for navigation
      cy.url().should('include', '/dashboard')
      
      // Debug: Log the current localStorage state
      cy.window().then((win) => {
        console.log('LocalStorage auth:', win.localStorage.getItem('auth-storage'))
      })
      
      // Debug: Log all data-testid elements
      cy.get('[data-testid]').then($elements => {
        console.log('Found data-testid elements:', $elements.map((_, el) => el.getAttribute('data-testid')).get())
      })
      
      // Check for user menu and wait for hydration
      cy.get('[data-testid=user-menu]')
        .should('exist')
        .should('be.visible')
        // Wait for hydration to complete
        .should('have.attr', 'data-user-state', 'logged-in')
        // Debug: Log the menu's attributes
        .invoke('attr', 'data-cy-debug')
        .then(debugAttr => {
          console.log('User menu debug data:', debugAttr)
        })
      
      // Check menu contents
      cy.get('[data-testid=user-menu]').within(() => {
        cy.contains('Dashboard').should('be.visible')
        cy.contains('Profile').should('be.visible')
        cy.contains('Logout').should('be.visible')
      })
    })

    it('should show error with invalid credentials', () => {
      // Login with shouldSucceed = false to trigger error response
      cy.login(testUser.email, 'wrongpassword')
      
      // Wait for the API response
      cy.wait('@loginRequest')
      
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

    it('should successfully register a new user', () => {
      cy.register(newUser.email, newUser.password)
      cy.url().should('include', '/login')
      cy.get('[data-testid=success-message]').should('be.visible').and('contain', 'Registered successfully')
    })

    it('should show error when registering with existing email', () => {
      cy.register(testUser.email, testUser.password)
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Email already exists')
    })
  })

  describe('Logout', () => {
    beforeEach(() => {
      cy.login(testUser.email, testUser.password)
    })

    it('should successfully logout', () => {
      cy.logout()
      cy.url().should('include', '/login')
      cy.get('[data-testid=login-button]').should('be.visible')
    })
  })
})
