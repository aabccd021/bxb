import { assert } from 'chai';
import { EventContext } from 'firebase-functions/v1';
import {
  DocumentBuilder,
  QueryDocumentSnapshot,
} from 'firebase-functions/v1/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import { DocumentSnapshot, OnCreateTrigger, OnDeleteTrigger } from '../../src';
import { onCreateTrigger, onDeleteTrigger } from '../../src/firebase-functions';
import * as functionUtil from '../../src/firebase-functions/util';
import * as util from '../../src/util';

describe('firebase-functions', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('onCreateTrigger', () => {
    it('make on create trigger', async () => {
      // arrange
      const mockedTrigger = stubInterface<OnCreateTrigger>();

      const documentBuilder = stubInterface<DocumentBuilder>();
      documentBuilder.onCreate.returns(mockedTrigger);

      const getDocTrigger = sinon
        .stub(functionUtil, 'getDocTrigger')
        .returns(documentBuilder);

      const mockedHandlerResult = stubInterface<Promise<unknown>>();

      const handler = sinon.stub<
        Parameters<OnCreateTrigger>,
        ReturnType<OnCreateTrigger>
      >();
      handler.returns(mockedHandlerResult);

      const triggerSnapshot = stubInterface<QueryDocumentSnapshot>();

      const wrappedSnapshot = stubInterface<DocumentSnapshot>();
      const context = stubInterface<EventContext>();

      const wrapFirebaseSnapshot = sinon
        .stub(util, 'wrapFirebaseSnapshot')
        .returns(wrappedSnapshot);

      // act
      const trigger = onCreateTrigger('fooCol', handler);
      const [triggerHandler] = documentBuilder.onCreate.getCall(0).args;
      const handlerResult = triggerHandler(triggerSnapshot, context);

      // assert
      assert.isTrue(getDocTrigger.calledOnceWith('fooCol'));
      assert.equal(trigger, mockedTrigger);
      assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(triggerSnapshot));
      assert.isTrue(handler.calledOnceWith(wrappedSnapshot, context));
      assert.equal(handlerResult, mockedHandlerResult);
    });
  });

  describe('onDeleteTrigger', () => {
    it('make on delete trigger', async () => {
      // arrange
      const mockedTrigger = stubInterface<OnDeleteTrigger>();

      const documentBuilder = stubInterface<DocumentBuilder>();
      documentBuilder.onDelete.returns(mockedTrigger);

      const getDocTrigger = sinon
        .stub(functionUtil, 'getDocTrigger')
        .returns(documentBuilder);

      const mockedHandlerResult = stubInterface<Promise<unknown>>();

      const handler = sinon.stub<
        Parameters<OnDeleteTrigger>,
        ReturnType<OnDeleteTrigger>
      >();
      handler.returns(mockedHandlerResult);

      const triggerSnapshot = stubInterface<QueryDocumentSnapshot>();

      const wrappedSnapshot = stubInterface<DocumentSnapshot>();
      const context = stubInterface<EventContext>();

      const wrapFirebaseSnapshot = sinon
        .stub(util, 'wrapFirebaseSnapshot')
        .returns(wrappedSnapshot);

      // act
      const trigger = onDeleteTrigger('fooCol', handler);
      const [triggerHandler] = documentBuilder.onDelete.getCall(0).args;
      const handlerResult = triggerHandler(triggerSnapshot, context);

      // assert
      assert.isTrue(getDocTrigger.calledOnceWith('fooCol'));
      assert.equal(trigger, mockedTrigger);
      assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(triggerSnapshot));
      assert.isTrue(handler.calledOnceWith(wrappedSnapshot, context));
      assert.equal(handlerResult, mockedHandlerResult);
    });
  });
});
