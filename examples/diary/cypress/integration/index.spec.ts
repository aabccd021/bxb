describe('Creation', () => {
  it('should be able to create a thread', () => {
    cy.visit('/');

    cy.get('button').contains('Create').click();

    cy.contains('text: textt');
    cy.contains('title: titlee');
  });
});
