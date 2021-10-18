import { expect } from 'chai';
import { App } from 'firebase-admin/app';
import * as firestore from 'firebase-admin/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import { getDoc } from '../../src/wrapper/firebase-admin';

describe('count view', () => {
  it('on counted document created', async () => {
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

    const app1: App = { name: '', options: {} };

    const wrappedSnapshot = await getDoc(app1, 'fooCollection', 'barId');

    expect(getFirestore.calledOnceWith(app1)).to.be.true;
    expect(firestoreInstance.doc.calledOnceWith('fooCollection/barId')).to.be
      .true;
    expect(doc.get.calledOnceWith()).to.be.true;
    expect(wrappedSnapshot).to.deep.equal({
      data: {
        lorem: 'ipsum',
      },
      id: 'hogeId',
    });
  });
});
