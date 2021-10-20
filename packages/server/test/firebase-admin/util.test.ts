import { assert } from 'chai';
import { App } from 'firebase-admin/app';
import * as firestore from 'firebase-admin/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import { getDocRef } from '../../src/firebase-admin/util';
describe('firebase-admin', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getDocRef', () => {
    it('gets the document', async () => {
      // arrange
      const mockedDocRef = stubInterface<firestore.DocumentReference>();

      const mockedCollectionRef =
        stubInterface<firestore.CollectionReference>();
      mockedCollectionRef.doc.returns(mockedDocRef);

      const mockedFirestore = stubInterface<firestore.Firestore>();
      mockedFirestore.collection.returns(mockedCollectionRef);

      const getFirestore = sinon
        .stub(firestore, 'getFirestore')
        .returns(mockedFirestore);

      const app = stubInterface<App>();
      const app2 = stubInterface<App>();

      // act
      const docRef = getDocRef(app, 'fooCollection', 'barId');

      // assert
      assert.isTrue(getFirestore.calledOnceWith(app));
      assert.isFalse(getFirestore.calledOnceWith(app2));

      assert.isTrue(mockedFirestore.collection.calledOnceWith('fooCollection'));
      assert.isTrue(mockedCollectionRef.doc.calledOnceWith('barId'));
      assert.equal(docRef, mockedDocRef);
    });
  });
});
