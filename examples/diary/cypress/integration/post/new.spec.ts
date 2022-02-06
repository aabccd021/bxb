describe('Creation', () => {
  it('can create a post then redirecta and show the result immediately', () => {
    cy.visit('/post/new');

    cy.get('button').contains('Create').click();

    cy.url().should('include', '/post/');
    cy.url().should('not.include', '?');

    // show from cache
    cy.contains('Title: taitoru');
    cy.contains('Text: tekisuto');

    cy.wait(2000);
    cy.reload();

    cy.contains('Title: taitoru');
    cy.contains('Text: tekisuto');
  });
});