import { expect } from 'chai';
import { App } from 'firebase-admin/app';
import * as firestore from 'firebase-admin/firestore';
import sinon from 'ts-sinon';
import { getDoc } from '../../src/wrapper/firebase-admin';

const getFirestore = sinon.stub(firestore, 'getFirestore').returns({

});

describe('count view', () => {
  it('on counted document created', () => {
    const app1: App = { name: '', options: {} };
    const app2: App = { name: 'b', options: {} };
    getDoc(app1, 'a', 'b');
    expect(getFirestore.calledOnceWith(app1)).to.be.true;
    expect(getFirestore.calledOnceWith(app2)).to.be.false;
  });
});
