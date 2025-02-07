describe('Role Management', () => {
  const adminUser = {
    email: 'admin@example.com',
    password: 'Admin123!@#',
  }

  const regularUser = {
    email: 'user@example.com',
    password: 'User123!@#',
  }

  describe('Admin Role', () => {
    beforeEach(() => {
      cy.login(adminUser.email, adminUser.password)
    })

    it('should access admin dashboard', () => {
      cy.visit('/admin')
      cy.url().should('include', '/admin')
      cy.get('[data-testid=admin-dashboard]').should('be.visible')
    })

    it('should view all users', () => {
      cy.visit('/admin/users')
      cy.get('[data-testid=users-list]').should('be.visible')
      cy.get('[data-testid=user-row]').should('have.length.at.least', 1)
    })

    it('should modify user roles', () => {
      cy.visit('/admin/users')
      cy.get('[data-testid=user-row]')
        .contains(regularUser.email)
        .parent()
        .within(() => {
          cy.get('[data-testid=role-select]').click()
          cy.get('[data-testid=role-option-admin]').click()
          cy.get('[data-testid=save-role-button]').click()
        })
      
      cy.get('body')
        .should('be.visible')
        .and('contain', 'Role updated successfully')
    })
  })

  describe('Regular User Role', () => {
    beforeEach(() => {
      cy.login(regularUser.email, regularUser.password)
    })

    it('should not access admin dashboard', () => {
      cy.visit('/admin')
      cy.url().should('not.include', '/admin')
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Access denied')
    })

    it('should access regular user features', () => {
      cy.visit('/profile')
      cy.get('[data-testid=profile-form]').should('be.visible')
      
      cy.visit('/files')
      cy.get('[data-testid=file-upload]').should('be.visible')
    })

    it('should not see admin-only elements', () => {
      cy.get('[data-testid=admin-menu]').should('not.exist')
      cy.get('[data-testid=user-management]').should('not.exist')
    })
  })

  describe('Role-based File Access', () => {
    it('admin should access all files', () => {
      cy.login(adminUser.email, adminUser.password)
      cy.visit('/files')
      cy.get('[data-testid=all-files-toggle]').click()
      cy.get('[data-testid=file-list]')
        .should('be.visible')
        .and('contain', 'All Users Files')
    })

    it('regular user should only access own files', () => {
      cy.login(regularUser.email, regularUser.password)
      cy.visit('/files')
      cy.get('[data-testid=all-files-toggle]').should('not.exist')
      cy.get('[data-testid=file-list]')
        .should('be.visible')
        .and('contain', 'My Files')
    })
  })
})
