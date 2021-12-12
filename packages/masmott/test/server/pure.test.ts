import {
  createViews,
  deleteReferDocs,
  deleteViewDocs,
  getReferDocs,
  logErrors,
} from '@src/server/pure';
import * as E from 'fp-ts/Either';

describe('deleteViewDocs', () => {
  it('make delete view docs action', () =>
    expect(
      deleteViewDocs({
        ctx: {
          collection: 'user',
          errorMessage: 'onViewSrcDeleted',
          viewSpecs: {
            card: {},
            detail: {},
          },
        },
        triggerCtx: {
          snapshot: { data: {}, id: 'aabccd021' },
        },
      })
    ).toStrictEqual([
      {
        _task: 'deleteDoc',
        collection: 'user_card',
        id: 'aabccd021',
      },
      {
        _task: 'deleteDoc',
        collection: 'user_detail',
        id: 'aabccd021',
      },
    ]));
});

describe('getReferDocs', () => {
  it('make query for querying refer docs', () =>
    expect(
      getReferDocs({
        ctx: {
          errorMessage: 'onRefDeleted',
          refIdField: 'authorUser',
          referCollection: 'article',
        },
        triggerCtx: {
          snapshot: { data: {}, id: 'aabccd021' },
        },
      })
    ).toStrictEqual({
      _task: 'getDocs',
      collection: 'article',
      where: [['authorUser', '==', 'aabccd021']],
    }));
});

describe('deleteReferDocs', () => {
  it('make DeleteDocAction for all refer docs', () =>
    expect(
      deleteReferDocs({
        ctx: {
          errorMessage: 'onRefDeleted',
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
      {
        _task: 'deleteDoc',
        collection: 'article',
        id: '21',
      },
      {
        _task: 'deleteDoc',
        collection: 'article',
        id: '46',
      },
    ]));
});

describe('logErrors', () => {
  it('log errors', () =>
    expect(
      logErrors({
        ctx: { errorMessage: 'fooErrorMessage' },
        writeResults: [
          ['action1', E.right('some_result')],
          ['action2', E.left('some_error')],
        ],
      })
    ).toStrictEqual([
      {
        _task: 'log',
        jsonPayload: {
          action: 'action2',
          error: 'some_error',
        },
        message: 'fooErrorMessage',
        severity: 'ERROR',
      },
    ]));
});

describe('createViews', () => {
  it('create views', () =>
    expect(
      createViews({
        ctx: {
          collection: 'user',
          errorMessage: 'onViewSrcCreated',
          viewSpecs: {
            card: { name: undefined },
            page: { group: undefined, name: undefined },
          },
        },
        triggerCtx: {
          snapshot: {
            data: {
              birthPlace: 'hyogo',
              group: 'sakurazaka46',
              name: 'kira masumoto',
            },
            id: 'masmott021',
          },
        },
      })
    ).toStrictEqual([
      {
        _task: 'createDoc',
        collection: 'user_card',
        data: { name: 'kira masumoto' },
        id: 'masmott021',
      },
      {
        _task: 'createDoc',
        collection: 'user_page',
        data: { group: 'sakurazaka46', name: 'kira masumoto' },
        id: 'masmott021',
      },
    ]));
});
