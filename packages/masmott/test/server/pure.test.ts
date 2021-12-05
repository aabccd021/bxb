import {
  deleteReferDocs,
  deleteViewDocs,
  getReferDocs,
} from '@src/server/pure';

describe('deleteViewDocs', () => {
  it('make delete view docs action', () => {
    expect(
      deleteViewDocs({
        ctx: {
          collection: 'user',
          srcDoc: { data: {}, id: 'aabccd021' },
          viewSpecs: {
            card: {},
            detail: {},
          },
        },
      })
    ).toStrictEqual([
      { _task: 'deleteDoc', collection: 'user_card', id: 'aabccd021' },
      { _task: 'deleteDoc', collection: 'user_detail', id: 'aabccd021' },
    ]);
  });
});

describe('getReferDocs', () => {
  it('make query for querying refer docs', () => {
    expect(
      getReferDocs({
        ctx: {
          refDoc: { data: {}, id: 'aabccd021' },
          refIdField: 'authorUser',
          referCollection: 'article',
        },
      })
    ).toStrictEqual({
      _task: 'getDocs',
      collection: 'article',
      where: [['authorUser', '==', 'aabccd021']],
    });
  });
});

describe('deleteReferDocs', () => {
  it('make DeleteDocAction for all refer docs', () => {
    expect(
      deleteReferDocs({
        ctx: {
          refDoc: { data: {}, id: 'aabccd021' },
          refIdField: 'authorUser',
          referCollection: 'article',
        },
        referDocs: [
          {
            data: {},
            id: '21',
          },
          {
            data: {},
            id: '46',
          },
        ],
      })
    ).toStrictEqual([
      { _task: 'deleteDoc', collection: 'article', id: '21' },
      { _task: 'deleteDoc', collection: 'article', id: '46' },
    ]);
  });
});
