describe('Creation', function () {
  it(
    'should be able to create a thread',
    {
      retries: {
        runMode: 2,
        openMode: 2,
      },
    },
    function () {
      cy.visit('/');

      cy.get('button').contains('Create').click();

      cy.url().should('include', '/thread/');

      cy.contains('Thread Id : ');
      cy.contains('replyCount : 0');

      cy.get('input').type('aabccd').should('have.value', 'aabccd');
      cy.get('button').contains('post').click();

      cy.contains('replyCount : 1');
    }
  );
});
