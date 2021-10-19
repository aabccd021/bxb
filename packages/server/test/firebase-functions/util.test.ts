import { getDocTrigger } from '../../src/firebase-functions/util';
import sinon, { stubInterface } from 'ts-sinon';
import * as functions from 'firebase-functions';
import { DocumentBuilder } from 'firebase-functions/v1/firestore';
import { assert } from 'chai';

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
  });
});
