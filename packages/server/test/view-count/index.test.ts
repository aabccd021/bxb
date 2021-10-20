import { assert } from 'chai';
import sinon, { stubInterface } from 'ts-sinon';
import * as functions from '../../src/firebase-functions';
import { App, OnDeleteTrigger, OnDeleteTriggerHandler } from '../../src/type';
import { onCountedDocDeleted, _ } from '../../src/view-count';
// eslint-disable-next-line max-len

describe('view-count', () => {
  describe('onCountedDocDeleted', () => {
    // arrange
    const mockedApp = stubInterface<App>();
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
    const mockedHandler = stubInterface<OnDeleteTriggerHandler>();
    const mockedHandler2 = stubInterface<OnDeleteTriggerHandler>();
    const wrappedMakeHandler = sinon
      .stub(_, 'makeOnCountedDocDeletedHandler')
      .returns(mockedHandler)
      .onSecondCall()
      .returns(mockedHandler2);

    const mockedTrigger = stubInterface<OnDeleteTrigger>();
    const mockedTrigger2 = stubInterface<OnDeleteTrigger>();
    const onDeleteTrigger = sinon
      .stub(functions, 'makeOnDeleteTrigger')
      .returns(mockedTrigger)
      .onSecondCall()
      .returns(mockedTrigger2);

    // act
    const triggers = onCountedDocDeleted(
      mockedApp,
      'user',
      'detail',
      countSpecs
    );

    // assert
    assert.isTrue(wrappedMakeHandler.calledTwice);
    assert.isTrue(
      wrappedMakeHandler
        .getCall(0)
        .calledWith(
          mockedApp,
          'user',
          'detail',
          'articleCount',
          'articleAuthorUserId'
        )
    );
    assert.isTrue(
      wrappedMakeHandler
        .getCall(1)
        .calledWith(
          mockedApp,
          'user',
          'detail',
          'likedArticleCount',
          'likerUserId'
        )
    );
    assert.equal(onDeleteTrigger.callCount, 2);

    assert.equal(onDeleteTrigger.getCall(0).args[0], 'article');
    assert.equal(onDeleteTrigger.getCall(0).args[1], mockedHandler);

    assert.equal(onDeleteTrigger.getCall(1).args[0], 'like');
    assert.equal(onDeleteTrigger.getCall(1).args[1], mockedHandler2);

    assert.equal(Object.keys(triggers).length, 2);
    assert.equal(triggers['articleCount'], mockedTrigger);
    assert.equal(triggers['likedArticleCount'], mockedTrigger2);
    assert.notEqual(triggers['articleCount'], mockedTrigger2);
    assert.notEqual(triggers['likedArticleCount'], mockedTrigger);
  });
});
