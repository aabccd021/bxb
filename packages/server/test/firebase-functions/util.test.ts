import { assert } from 'chai';
import * as functions from 'firebase-functions';
import { DocumentBuilder } from 'firebase-functions/v1/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import { getDocTrigger } from '../../src/firebase-functions/util';

describe('firebase-functions', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getDocTrigger', () => {
    it('get doc trigger with given collectionName', () => {
      // arrange

      const mockedDocumentBuilder = stubInterface<DocumentBuilder>();

      const document = sinon
        .stub(functions.firestore, 'document')
        .returns(mockedDocumentBuilder);

      // act
      const trigger = getDocTrigger('fooCollection');

      //assert
      assert.isTrue(document.calledOnceWith('fooCollection/{documentId}'));
      assert.equal(trigger, mockedDocumentBuilder);
    });

    it('get doc trigger with given collectionName and region', () => {
      // arrange

      // const region = sinon.stub(functions, 'region');
      const document = sinon.stub(functions.firestore, 'document');

      // act
      getDocTrigger('fooCollection', { regions: ['asia-southeast2'] });

      //assert
      // TODO:
      // assert.isTrue(region.called);
      assert.isTrue(document.notCalled);
    });
  });
});
