import { expect } from 'chai';
import { App } from 'firebase-admin/app';
import * as firestore from 'firebase-admin/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import { getDoc } from '../../src/wrapper/firebase-admin';

const snapshot = stubInterface<firestore.DocumentSnapshot>();

const doc = stubInterface<firestore.DocumentReference>();
doc.get.resolves(snapshot);

const firestoreInstance = stubInterface<firestore.Firestore>();
firestoreInstance.doc.returns(doc);

const getFirestore = sinon
  .stub(firestore, 'getFirestore')
  .returns(firestoreInstance);

describe('count view', () => {
  it('on counted document created', () => {
    const app1: App = { name: '', options: {} };
    getDoc(app1, 'fooCollection', 'barId');
    expect(getFirestore.calledOnceWith(app1)).to.be.true;
    expect(firestoreInstance.doc.calledOnceWith('fooCollection/barId')).to.be
      .true;
    expect(doc.get.calledOnceWith()).to.be.true;
  });
});
