describe('Profile Management', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'Test123!@#',
  }

  beforeEach(() => {
    cy.login(testUser.email, testUser.password)
    cy.visit('/profile')
  })

  describe('Profile Update', () => {
    it('should successfully update profile information', () => {
      const newEmail = `test${Date.now()}@example.com`
      
      cy.get('[data-testid=email-input]').clear().type(newEmail)
      cy.get('[data-testid=save-profile-button]').click()
      
      cy.get('[data-testid=success-message]')
        .should('be.visible')
        .and('contain', 'Profile updated successfully')
      
      cy.reload()
      cy.get('[data-testid=email-input]').should('have.value', newEmail)
    })

    it('should show error when updating with invalid data', () => {
      cy.get('[data-testid=email-input]').clear().type('invalid-email')
      cy.get('[data-testid=save-profile-button]').click()
      
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Invalid email format')
    })
  })

  describe('Password Update', () => {
    const newPassword = 'NewTest123!@#'

    it('should successfully update password', () => {
      cy.get('[data-testid=current-password-input]').type(testUser.password)
      cy.get('[data-testid=new-password-input]').type(newPassword)
      cy.get('[data-testid=confirm-password-input]').type(newPassword)
      cy.get('[data-testid=update-password-button]').click()
      
      cy.get('[data-testid=success-message]')
        .should('be.visible')
        .and('contain', 'Password updated successfully')
    })

    it('should show error when current password is incorrect', () => {
      cy.get('[data-testid=current-password-input]').type('wrongpassword')
      cy.get('[data-testid=new-password-input]').type(newPassword)
      cy.get('[data-testid=confirm-password-input]').type(newPassword)
      cy.get('[data-testid=update-password-button]').click()
      
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Current password is incorrect')
    })
  })
})
