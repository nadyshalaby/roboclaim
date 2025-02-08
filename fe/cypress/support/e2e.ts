import './commands'
import '@testing-library/cypress/add-commands'

beforeEach(() => {
  // Clear localStorage before each test
  cy.window().then((win) => {
    win.localStorage.clear()
    cy.clearCookies()
  })
})
