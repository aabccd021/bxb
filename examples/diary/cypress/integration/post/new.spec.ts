describe('Creation', () => {
  it('should be able to create a thread', () => {
    cy.visit('/post/new');

    cy.get('button').contains('Create').click();

    cy.url().should('include', '/post/');
    cy.url().should('not.include', '?');

    cy.contains('Title: taitoru');
    cy.contains('Text: tekisuto');

    cy.wait(2000);
    cy.reload();

    cy.contains('Title: taitoru');
    cy.contains('Text: tekisuto');
  });
});
