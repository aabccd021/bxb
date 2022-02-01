/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable jest/expect-expect */
describe('Creation', () => {
  it('should be able to create a thread', () => {
    cy.visit('/');

    cy.get('button').contains('Create').click();

    cy.contains('created: {"data":{"text":"textt","title":"tiltee"},"id":"');
  });
});
