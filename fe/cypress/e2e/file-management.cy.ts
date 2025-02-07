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
      cy.fixture('test-image.png').then(fileContent => {
        cy.get('[data-testid=file-input]').attachFile({
          fileContent,
          fileName: 'test-image.png',
          mimeType: 'image/png'
        })
      })
      
      cy.get('body')
        .should('be.visible')
        .and('contain', 'File uploaded successfully')
      
      cy.get('[data-testid=file-list]')
        .should('contain', 'test-image.png')
    })

    it('should upload a PDF file successfully', () => {
      cy.get('[data-testid=file-input]').attachFile({
        filePath: 'test-document.pdf',
        fileName: 'test-document.pdf',
        mimeType: 'application/pdf'
      })
      
      cy.get('body')
        .should('be.visible')
        .and('contain', 'File uploaded successfully')
      
      cy.get('[data-testid=file-list]')
        .should('contain', 'test-document.pdf')
    })

    it('should upload a CSV file successfully', () => {
      cy.get('[data-testid=file-input]').attachFile({
        filePath: 'test-data.csv',
        fileName: 'test-data.csv',
        mimeType: 'text/csv'
      })
      
      cy.get('body')
        .should('be.visible')
        .and('contain', 'File uploaded successfully')
      
      cy.get('[data-testid=file-list]')
        .should('contain', 'test-data.csv')
    })

    it('should show error when uploading invalid file type', () => {
      cy.fixture('test-invalid.exe').then(fileContent => {
        cy.get('[data-testid=file-input]').attachFile({
          fileContent,
          fileName: 'test-invalid.exe',
          mimeType: 'application/x-msdownload'
        })
      })
      
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Invalid file type')
    })
  })

  describe('File Deletion', () => {
    beforeEach(() => {
      // Upload a test file first
      cy.fixture('test-image.png').then(fileContent => {
        cy.get('[data-testid=file-input]').attachFile({
          fileContent,
          fileName: 'test-image.png',
          mimeType: 'image/jpeg'
        })
      })
    })

    it('should delete a file successfully', () => {
      cy.get('[data-testid=delete-file-button]').first().click()
      cy.get('[data-testid=confirm-delete-button]').click()
      
      cy.get('body')
        .should('be.visible')
        .and('contain', 'File deleted successfully')
      
      cy.get('[data-testid=file-list]')
        .should('not.contain', 'test-image.png')
    })

    it('should cancel file deletion', () => {
      cy.get('[data-testid=delete-file-button]').first().click()
      cy.get('[data-testid=cancel-delete-button]').click()
      
      cy.get('[data-testid=file-list]')
        .should('contain', 'test-image.png')
    })
  })
})
