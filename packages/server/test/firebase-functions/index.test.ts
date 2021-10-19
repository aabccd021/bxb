import { assert } from 'chai';
import { Change, EventContext } from 'firebase-functions/v1';
import {
  DocumentBuilder,
  QueryDocumentSnapshot,
} from 'firebase-functions/v1/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import {
  DocumentChangeSnapshot,
  DocumentSnapshot,
  OnCreateTrigger,
  OnDeleteTrigger,
  OnUpdateTrigger,
} from '../../src';
import {
  makeOnCreateTrigger,
  makeOnDeleteTrigger,
  makeOnUpdateTrigger,
} from '../../src/firebase-functions';
import * as functionUtil from '../../src/firebase-functions/util';
import * as util from '../../src/util';

describe('firebase-functions', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('makeOnCreateTrigger', () => {
    it('make onCreateTrigger', async () => {
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
      const trigger = makeOnCreateTrigger('fooCol', handler);
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

  describe('makeOnUpdateTrigger', () => {
    it('make onUpdateTrigger', async () => {
      // arrange
      const mockedTrigger = stubInterface<OnUpdateTrigger>();

      const documentBuilder = stubInterface<DocumentBuilder>();
      documentBuilder.onUpdate.returns(mockedTrigger);

      const getDocTrigger = sinon
        .stub(functionUtil, 'getDocTrigger')
        .returns(documentBuilder);

      const mockedHandlerResult = stubInterface<Promise<unknown>>();

      const handler = sinon.stub<
        Parameters<OnUpdateTrigger>,
        ReturnType<OnUpdateTrigger>
      >();
      handler.returns(mockedHandlerResult);

      const triggerSnapshot = stubInterface<Change<QueryDocumentSnapshot>>();

      const wrappedChange = stubInterface<DocumentChangeSnapshot>();
      const context = stubInterface<EventContext>();

      const wrapFirebaseChangeSnapshot = sinon
        .stub(util, 'wrapFirebaseChangeSnapshot')
        .returns(wrappedChange);

      // act
      const trigger = makeOnUpdateTrigger('fooCol', handler);
      const [triggerHandler] = documentBuilder.onUpdate.getCall(0).args;
      const handlerResult = triggerHandler(triggerSnapshot, context);

      // assert
      assert.isTrue(getDocTrigger.calledOnceWith('fooCol'));
      assert.equal(trigger, mockedTrigger);
      assert.isTrue(wrapFirebaseChangeSnapshot.calledOnceWith(triggerSnapshot));
      assert.isTrue(handler.calledOnceWith(wrappedChange, context));
      assert.equal(handlerResult, mockedHandlerResult);
    });
  });

  describe('makeOnDeleteTrigger', () => {
    it('make onDeleteTrigger', async () => {
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
      const trigger = makeOnDeleteTrigger('fooCol', handler);
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
