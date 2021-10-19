import sinon, { stubInterface } from 'ts-sinon';
import { App, OnDeleteTrigger, OnDeleteTriggerHandler } from '../../src/type';
import { onCountedDocDeleted } from '../../src/view-count';
// eslint-disable-next-line max-len
import * as deleteHandler from '../../src/view-count/makeOnCountedDocDeletedHandler';
import * as functions from '../../src/firebase-functions';
import { assert } from 'chai';

describe('view-count', () => {
  describe('onCOuntedDocDeleted', () => {
    // arrange
    const app = stubInterface<App>();
    const app2 = stubInterface<App>();
    const countSpecs = {
      articleCount: {
        groupBy: 'articleAuthorUserId',
        countedCollectionName: 'article',
      },
      likedArticleCount: {
        groupBy: 'likerUserId',
        countedCollectionName: 'like',
      },
    };
    const handler = stubInterface<OnDeleteTriggerHandler>();
    const handler2 = stubInterface<OnDeleteTriggerHandler>();
    const makeOnCountedDocDeletedHandler = sinon
      .stub(deleteHandler, 'makeOnCountedDocDeletedHandler')
      .returns(handler)
      .onSecondCall()
      .returns(handler2);

    const mockedTrigger = stubInterface<OnDeleteTrigger>();
    const mockedTrigger2 = stubInterface<OnDeleteTrigger>();
    const onDeleteTrigger = sinon
      .stub(functions, 'onDeleteTrigger')
      .returns(mockedTrigger)
      .onSecondCall()
      .returns(mockedTrigger2);
    // act
    const triggers = onCountedDocDeleted(app, 'user', 'detail', countSpecs);

    // assert
    assert.isTrue(makeOnCountedDocDeletedHandler.calledTwice);
    assert.isTrue(
      makeOnCountedDocDeletedHandler
        .getCall(0)
        .calledWith(
          app,
          'user',
          'detail',
          'articleCount',
          'articleAuthorUserId'
        )
    );
    assert.isFalse(
      makeOnCountedDocDeletedHandler
        .getCall(0)
        .calledWith(
          app2,
          'user',
          'detail',
          'articleCount',
          'articleAuthorUserId'
        )
    );
    assert.isTrue(
      makeOnCountedDocDeletedHandler
        .getCall(1)
        .calledWith(app, 'user', 'detail', 'likedArticleCount', 'likerUserId')
    );
    assert.isFalse(
      makeOnCountedDocDeletedHandler
        .getCall(1)
        .calledWith(app2, 'user', 'detail', 'likedArticleCount', 'likerUserId')
    );

    assert.isTrue(onDeleteTrigger.calledTwice);

    assert.equal(onDeleteTrigger.getCall(0).args[0], 'article');
    assert.equal(onDeleteTrigger.getCall(0).args[1], handler);

    assert.equal(onDeleteTrigger.getCall(1).args[0], 'like');
    assert.equal(onDeleteTrigger.getCall(1).args[1], handler2);

    assert.equal(Object.keys(triggers).length, 2);
    assert.equal(triggers['articleCount'], mockedTrigger);
    assert.equal(triggers['likedArticleCount'], mockedTrigger2);
    assert.notEqual(triggers['articleCount'], mockedTrigger2);
    assert.notEqual(triggers['likedArticleCount'], mockedTrigger);
  });
});
