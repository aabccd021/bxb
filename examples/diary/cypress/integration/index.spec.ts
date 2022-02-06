describe('Creation', () => {
  it('can create a post and show the result immediately from the cache', () => {
    cy.visit('/');

    cy.get('button').contains('Create').click();

    cy.contains('text: textt');
    cy.contains('title: titlee');
  });
});
