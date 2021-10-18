import { assert } from 'chai';
import { App } from 'firebase-admin/app';
import * as firestore from 'firebase-admin/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import { getDoc } from '../../src/wrapper/firebase-admin';

describe('getDoc', () => {
  it('gets the document', async () => {
    // arrange
    const snapshot: firestore.DocumentSnapshot = {
      ...stubInterface<firestore.DocumentSnapshot>(),
      id: 'hogeId',
      data: () => ({
        lorem: 'ipsum',
      }),
    };

    const doc = stubInterface<firestore.DocumentReference>();
    doc.get.resolves(snapshot);

    const firestoreInstance = stubInterface<firestore.Firestore>();
    firestoreInstance.doc.returns(doc);

    const getFirestore = sinon
      .stub(firestore, 'getFirestore')
      .returns(firestoreInstance);

    const app1 = stubInterface<App>();

    // act
    const wrappedSnapshot = await getDoc(app1, 'fooCollection', 'barId');

    // assert
    assert.isTrue(getFirestore.calledOnceWith(app1));
    assert.isTrue(firestoreInstance.doc.calledOnceWith('fooCollection/barId'));
    assert.isTrue(doc.get.calledOnceWith());

    const expectedSnapshot = {
      data: {
        lorem: 'ipsum',
      },
      id: 'hogeId',
    };
    assert.deepStrictEqual(wrappedSnapshot, expectedSnapshot);
  });
});
