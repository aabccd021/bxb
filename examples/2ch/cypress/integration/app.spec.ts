describe('Creation', function () {
  it('should be able to create a thread', function () {
    // Start from the index page
    cy.visit('/');

    // Find a link with an href attribute containing "about" and click it
    cy.get('button').contains('Create').click();

    cy.url().should('include', '/thread/');

    // The new page should contain an h1 with "About page"
    cy.contains('Thread Id : ');
    cy.contains('replyCount : 0');
  });
});
