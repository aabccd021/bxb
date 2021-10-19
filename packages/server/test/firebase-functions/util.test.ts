import { assert } from 'chai';
import * as nonTestable from '../../src/firebase-functions/non-testable';
import { DocumentBuilder } from 'firebase-functions/v1/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import { getDocTrigger } from '../../src/firebase-functions/util';
import { FunctionsFirestore } from '../../src/type';

describe('firebase-functions', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getDocTrigger', () => {
    it('get doc trigger with given collectionName', () => {
      // arrange
      const mockedDocTrigger = stubInterface<DocumentBuilder>();

      const functionsFirestore = stubInterface<FunctionsFirestore>();
      functionsFirestore.document.returns(mockedDocTrigger);

      const getFunctionsFirestore = sinon
        .stub(nonTestable, 'getFunctionsFirestore')
        .returns(functionsFirestore);

      // act
      const docTrigger = getDocTrigger('fooCollection');

      //assert
      assert.isTrue(getFunctionsFirestore.calledOnceWith());
      assert.isTrue(
        functionsFirestore.document.calledOnceWith('fooCollection/{documentId}')
      );
      assert.equal(docTrigger, mockedDocTrigger);
    });

    it('get doc trigger with given collectionName and region', () => {
      // arrange
      const mockedDocTrigger = stubInterface<DocumentBuilder>();

      const functionsFirestore = stubInterface<FunctionsFirestore>();
      functionsFirestore.document.returns(mockedDocTrigger);

      const getFunctionsFirestore = sinon
        .stub(nonTestable, 'getFunctionsFirestore')
        .returns(functionsFirestore);

      // act
      const docTrigger = getDocTrigger('fooCollection', {
        regions: ['asia-southeast2'],
      });

      //assert
      assert.isTrue(getFunctionsFirestore.calledOnceWith(['asia-southeast2']));
      assert.isTrue(
        functionsFirestore.document.calledOnceWith('fooCollection/{documentId}')
      );
      assert.equal(docTrigger, mockedDocTrigger);
    });
  });
});
