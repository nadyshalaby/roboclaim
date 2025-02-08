describe('File Management', () => {
  const testUser = {
    email: 'user@example.com',
    password: 'password',
  }

  beforeEach(() => {
    cy.login(testUser.email, testUser.password)
  })

  describe('File Upload', () => {
    it('should upload an image file successfully', () => {
      cy.get('[data-testid=file-input]').selectFile('./cypress/fixtures/test-image.jpg', {
        force: true
      })
      
      cy.get('body')
        .should('be.visible')
        .and('contain', 'File uploaded successfully')
      
      cy.get('[data-testid=file-list]')
        .should('contain', 'test-image.jpg')
    })

    it('should upload a PDF file successfully', () => {
      cy.get('[data-testid=file-input]').selectFile('./cypress/fixtures/test-document.pdf', {
        force: true
      })
      
      cy.get('body')
        .should('be.visible')
        .and('contain', 'File uploaded successfully')
      
      cy.get('[data-testid=file-list]')
        .should('contain', 'test-document.pdf')
    })

    it('should upload a CSV file successfully', () => {
      cy.get('[data-testid=file-input]').selectFile('./cypress/fixtures/test-data.csv', {
        force: true
      })

      cy.get('body')
        .should('be.visible')
        .and('contain', 'File uploaded successfully')
      
      cy.get('[data-testid=file-list]')
        .should('contain', 'test-data.csv')
    })

    it('should show error when uploading invalid file type', () => {
      cy.get('[data-testid=file-input]').selectFile('./cypress/fixtures/test-file.txt', {
        force: true
      })
      
      cy.get('[data-testid=file-list]')
        .should('not.contain', 'test-file.txt')
    })
  })

  describe('File Deletion', () => {
    beforeEach(() => {
      // Upload a test file first
      cy.get('[data-testid=file-input]').selectFile('./cypress/fixtures/test-image.jpg', {
        force: true
      })
    })

    it('should delete a file successfully', () => {
      // Intercept the delete request
      cy.intercept('DELETE', '**/files/*').as('deleteFile')

      // Get the file ID from the button's parent
      cy.get('[data-testid=delete-file-button]')
        .should('be.visible')
        .first()
        .parent()
        .parent()
        .invoke('attr', 'data-file-id')
        .then(fileId => {
          // Trigger click with mousedown and mouseup events
          cy.get(`[data-file-id='${fileId}'] [data-testid=delete-file-button]`)
            .trigger('mousedown', { force: true })
            .trigger('mouseup', { force: true })
            .click({ force: true })
        })

      // Wait for the delete request to complete
      cy.wait('@deleteFile')

      // Wait for success message
      cy.contains('File deleted successfully')
        .should('be.visible')
    })
  })
})
