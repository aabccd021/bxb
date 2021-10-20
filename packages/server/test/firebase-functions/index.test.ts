import { assert } from 'chai';
import * as fc from 'fast-check';
import { Change, EventContext } from 'firebase-functions/v1';
import { DocumentBuilder, QueryDocumentSnapshot } from 'firebase-functions/v1/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import {
  DocumentChangeSnapshot,
  DocumentSnapshot,
  FunctionsFirestore,
  OnCreateTrigger,
  OnDeleteTrigger,
  OnUpdateTrigger,
} from '../../src';
import {
  makeOnCreateTrigger,
  makeOnDeleteTrigger,
  makeOnUpdateTrigger,
  _,
} from '../../src/firebase-functions';
import * as nonTestable from '../../src/firebase-functions/non-testable';
import * as util from '../../src/util';

describe('firebase-functions', () => {
  describe('getDocTrigger', () => {
    it('get doc trigger with given collectionName', () =>
      fc.assert(
        fc
          .property(fc.string(), fc.string(), (collectionName, docPath) => {
            // arrange
            const mockedDocTrigger = stubInterface<DocumentBuilder>();

            const functionsFirestore = stubInterface<FunctionsFirestore>();
            functionsFirestore.document.returns(mockedDocTrigger);

            const mockedGetFunctionsFirestore = sinon
              .stub(nonTestable, 'getFunctionsFirestore')
              .returns(functionsFirestore);

            const mockedGetDocPath = sinon.stub(_, 'makeDocTriggerPath').returns(docPath);

            // act
            const docTrigger = _.makeDocTrigger(collectionName);

            //assert
            assert.isTrue(mockedGetFunctionsFirestore.calledOnceWith());
            assert.isTrue(functionsFirestore.document.calledOnceWith(docPath));
            assert.isTrue(mockedGetDocPath.calledOnceWith(collectionName));
            assert.equal(docTrigger, mockedDocTrigger);
          })
          .afterEach(() => sinon.restore())
      ));

    it('get doc trigger with given collectionName and region', () =>
      fc.assert(
        fc
          .property(fc.string(), fc.string(), (collectionName, docPath) => {
            // arrange
            const mockedDocTrigger = stubInterface<DocumentBuilder>();

            const functionsFirestore = stubInterface<FunctionsFirestore>();
            functionsFirestore.document.returns(mockedDocTrigger);

            const mockedGetFunctionsFirestore = sinon
              .stub(nonTestable, 'getFunctionsFirestore')
              .returns(functionsFirestore);

            const mockedMakeDocTriggerPath = sinon.stub(_, 'makeDocTriggerPath').returns(docPath);

            // act
            const docTrigger = _.makeDocTrigger(collectionName, {
              regions: ['asia-southeast2'],
            });

            //assert
            assert.isTrue(mockedGetFunctionsFirestore.calledOnceWith(['asia-southeast2']));

            assert.isTrue(functionsFirestore.document.calledOnceWith(docPath));
            assert.isTrue(mockedMakeDocTriggerPath.calledOnceWith(collectionName));
            assert.equal(docTrigger, mockedDocTrigger);
          })
          .afterEach(() => sinon.restore())
      ));
  });

  describe('makeDocTriggerPath', () => {
    it('returns correct path for collection foo', () => {
      const path = _.makeDocTriggerPath('foo');
      assert.equal(path, 'foo/{documentId}');
    });

    it('returns correct path for collection bar', () => {
      const path = _.makeDocTriggerPath('bar');
      assert.equal(path, 'bar/{documentId}');
    });
  });

  describe('makeOnCreateTrigger', () => {
    it('make onCreateTrigger', () =>
      fc.assert(
        fc
          .property(fc.string(), (collectionName) => {
            // arrange
            const mockedTrigger = stubInterface<OnCreateTrigger>();

            const documentBuilder = stubInterface<DocumentBuilder>();
            documentBuilder.onCreate.returns(mockedTrigger);

            const mockedMakeDocTrigger = sinon.stub(_, 'makeDocTrigger').returns(documentBuilder);

            const mockedHandlerResult = stubInterface<Promise<unknown>>();

            const handler = sinon.stub<Parameters<OnCreateTrigger>, ReturnType<OnCreateTrigger>>();
            handler.returns(mockedHandlerResult);

            const triggerSnapshot = stubInterface<QueryDocumentSnapshot>();

            const wrappedSnapshot = stubInterface<DocumentSnapshot>();
            const context = stubInterface<EventContext>();

            const wrapFirebaseSnapshot = sinon
              .stub(util, 'wrapFirebaseSnapshot')
              .returns(wrappedSnapshot);

            // act
            const trigger = makeOnCreateTrigger(collectionName, handler);
            const [triggerHandler] = documentBuilder.onCreate.getCall(0).args;
            const handlerResult = triggerHandler(triggerSnapshot, context);

            // assert
            assert.isTrue(mockedMakeDocTrigger.calledOnceWith(collectionName));
            assert.equal(trigger, mockedTrigger);
            assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(triggerSnapshot));
            assert.isTrue(handler.calledOnceWith(wrappedSnapshot, context));
            assert.equal(handlerResult, mockedHandlerResult);
          })
          .afterEach(() => sinon.restore())
      ));
  });

  describe('makeOnUpdateTrigger', () => {
    it('make onUpdateTrigger', () =>
      fc.assert(
        fc
          .property(fc.string(), (collectionName) => {
            // arrange
            const mockedTrigger = stubInterface<OnUpdateTrigger>();

            const documentBuilder = stubInterface<DocumentBuilder>();
            documentBuilder.onUpdate.returns(mockedTrigger);

            const mockedMakeDocTrigger = sinon.stub(_, 'makeDocTrigger').returns(documentBuilder);

            const mockedHandlerResult = stubInterface<Promise<unknown>>();

            const handler = sinon.stub<Parameters<OnUpdateTrigger>, ReturnType<OnUpdateTrigger>>();
            handler.returns(mockedHandlerResult);

            const triggerSnapshot = stubInterface<Change<QueryDocumentSnapshot>>();

            const wrappedChange = stubInterface<DocumentChangeSnapshot>();
            const context = stubInterface<EventContext>();

            const wrapFirebaseChangeSnapshot = sinon
              .stub(util, 'wrapFirebaseChangeSnapshot')
              .returns(wrappedChange);

            // act
            const trigger = makeOnUpdateTrigger(collectionName, handler);
            const [triggerHandler] = documentBuilder.onUpdate.getCall(0).args;
            const handlerResult = triggerHandler(triggerSnapshot, context);

            // assert
            assert.isTrue(mockedMakeDocTrigger.calledOnceWith(collectionName));
            assert.equal(trigger, mockedTrigger);
            assert.isTrue(wrapFirebaseChangeSnapshot.calledOnceWith(triggerSnapshot));
            assert.isTrue(handler.calledOnceWith(wrappedChange, context));
            assert.equal(handlerResult, mockedHandlerResult);
          })
          .afterEach(() => sinon.restore())
      ));
  });

  describe('makeOnDeleteTrigger', () => {
    it('make onDeleteTrigger', () =>
      fc.assert(
        fc
          .property(fc.string(), (collectionName) => {
            // arrange
            const mockedTrigger = stubInterface<OnDeleteTrigger>();

            const documentBuilder = stubInterface<DocumentBuilder>();
            documentBuilder.onDelete.returns(mockedTrigger);

            const mockedMakeDocTrigger = sinon.stub(_, 'makeDocTrigger').returns(documentBuilder);

            const mockedHandlerResult = stubInterface<Promise<unknown>>();

            const handler = sinon.stub<Parameters<OnDeleteTrigger>, ReturnType<OnDeleteTrigger>>();
            handler.returns(mockedHandlerResult);

            const triggerSnapshot = stubInterface<QueryDocumentSnapshot>();

            const wrappedSnapshot = stubInterface<DocumentSnapshot>();
            const context = stubInterface<EventContext>();

            const wrapFirebaseSnapshot = sinon
              .stub(util, 'wrapFirebaseSnapshot')
              .returns(wrappedSnapshot);

            // act
            const trigger = makeOnDeleteTrigger(collectionName, handler);
            const [triggerHandler] = documentBuilder.onDelete.getCall(0).args;
            const handlerResult = triggerHandler(triggerSnapshot, context);

            // assert
            assert.isTrue(mockedMakeDocTrigger.calledOnceWith(collectionName));
            assert.equal(trigger, mockedTrigger);
            assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(triggerSnapshot));
            assert.isTrue(handler.calledOnceWith(wrappedSnapshot, context));
            assert.equal(handlerResult, mockedHandlerResult);
          })
          .afterEach(() => sinon.restore())
      ));
  });
});
