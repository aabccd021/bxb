describe('Creation', function () {
  it(
    'should be able to create a thread',
    {
      retries: {
        runMode: 1,
        openMode: 1,
      },
    },
    function () {
      cy.visit('/');

      cy.get('button').contains('Create').click();

      cy.url().should('include', '/thread/');
      cy.contains('Thread Id : ');
      cy.contains('replyCount : 0');

      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(500);

      cy.get('input').type('aabccd').should('have.value', 'aabccd');
      cy.get('button').contains('post').click();

      // cy.contains('replyCount : 1');
    }
  );
});
