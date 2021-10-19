import { assert } from 'chai';
import * as firestore from 'firebase-admin/firestore';
import * as util from '../../src/util';
import sinon, { stubInterface } from 'ts-sinon';
import {
  getDoc,
  deleteDoc,
  createDoc,
  updateDoc,
  getCollection,
} from '../../src/firebase-admin';
import { App, DocumentSnapshot } from '../../src/type';

describe('firebase-admin', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getDoc', () => {
    it('gets the document', async () => {
      // arrange
      const firestoreSnapshot = stubInterface<firestore.DocumentSnapshot>();

      const doc = stubInterface<firestore.DocumentReference>();
      doc.get.resolves(firestoreSnapshot);

      const firestoreInstance = stubInterface<firestore.Firestore>();
      firestoreInstance.doc.returns(doc);

      const getFirestore = sinon
        .stub(firestore, 'getFirestore')
        .returns(firestoreInstance);

      const snapshot = stubInterface<DocumentSnapshot>();

      const wrapFirebaseSnapshot = sinon
        .stub(util, 'wrapFirebaseSnapshot')
        .returns(snapshot);

      const app = stubInterface<App>();

      // act
      const wrappedSnapshot = await getDoc(app, 'fooCollection', 'barId');

      // assert
      assert.isTrue(getFirestore.calledOnceWith(app));
      assert.isTrue(
        firestoreInstance.doc.calledOnceWith('fooCollection/barId')
      );
      assert.isTrue(doc.get.calledOnceWith());
      assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(firestoreSnapshot));
      assert.equal(wrappedSnapshot, snapshot);
    });
  });

  describe('deleteDoc', () => {
    it('deletes the document', async () => {
      // arrange
      const mockedDeleteResult = stubInterface<firestore.WriteResult>();

      const doc = stubInterface<firestore.DocumentReference>();
      doc.delete.resolves(mockedDeleteResult);

      const firestoreInstance = stubInterface<firestore.Firestore>();
      firestoreInstance.doc.returns(doc);

      const getFirestore = sinon
        .stub(firestore, 'getFirestore')
        .returns(firestoreInstance);

      const app = stubInterface<App>();

      // act
      const deleteResult = await deleteDoc(app, 'fooCollection', 'barId');

      // assert
      assert.isTrue(getFirestore.calledOnceWith(app));
      assert.isTrue(
        firestoreInstance.doc.calledOnceWith('fooCollection/barId')
      );
      assert.isTrue(doc.delete.calledOnceWith());
      assert.deepStrictEqual(deleteResult, mockedDeleteResult);
    });
  });

  describe('createDoc', () => {
    it('creates  document', async () => {
      // arrange
      const mockedCreateResult = stubInterface<firestore.WriteResult>();

      const doc = stubInterface<firestore.DocumentReference>();
      doc.create.resolves(mockedCreateResult);

      const firestoreInstance = stubInterface<firestore.Firestore>();
      firestoreInstance.doc.returns(doc);

      const getFirestore = sinon
        .stub(firestore, 'getFirestore')
        .returns(firestoreInstance);

      const app = stubInterface<App>();

      const data = stubInterface<firestore.DocumentData>();

      // act
      const createResult = await createDoc(app, 'fooCollection', 'barId', data);

      // assert
      assert.isTrue(getFirestore.calledOnceWith(app));
      assert.isTrue(
        firestoreInstance.doc.calledOnceWith('fooCollection/barId')
      );
      assert.isTrue(doc.create.calledOnceWith(data));
      assert.deepStrictEqual(createResult, mockedCreateResult);
    });
  });

  describe('updateDoc', () => {
    it('updates the  document', async () => {
      // arrange
      const mockedUpdateResult = stubInterface<firestore.WriteResult>();

      const doc = stubInterface<firestore.DocumentReference>();
      doc.update.resolves(mockedUpdateResult);

      const firestoreInstance = stubInterface<firestore.Firestore>();
      firestoreInstance.doc.returns(doc);

      const getFirestore = sinon
        .stub(firestore, 'getFirestore')
        .returns(firestoreInstance);

      const app = stubInterface<App>();

      const data = stubInterface<firestore.DocumentData>();

      // act
      const updateResult = await updateDoc(app, 'fooCollection', 'barId', data);

      // assert
      assert.isTrue(getFirestore.calledOnceWith(app));
      assert.isTrue(
        firestoreInstance.doc.calledOnceWith('fooCollection/barId')
      );
      // TODO:
      // assert.isTrue(doc.update.calledOnceWith(data));
      assert.deepStrictEqual(updateResult, mockedUpdateResult);
    });
  });

  describe('getCollection', () => {
    it('returns collection', async () => {
      // arrange
      const querySnapshot = stubInterface<firestore.QueryDocumentSnapshot>();
      const mockedDocs = [querySnapshot];

      const mockedQueryResult: firestore.QuerySnapshot = {
        ...stubInterface<firestore.QuerySnapshot>(),
        docs: mockedDocs,
      };

      const collection = stubInterface<firestore.CollectionReference>();
      collection.get.resolves(mockedQueryResult);

      const firestoreInstance = stubInterface<firestore.Firestore>();
      firestoreInstance.collection.returns(collection);

      const getFirestore = sinon
        .stub(firestore, 'getFirestore')
        .returns(firestoreInstance);

      const snapshot = stubInterface<DocumentSnapshot>();

      const wrapFirebaseSnapshot = sinon
        .stub(util, 'wrapFirebaseSnapshot')
        .returns(snapshot);

      const app = stubInterface<App>();

      // act
      const queryResult = await getCollection(app, 'fooCollection');

      // assert
      assert.isTrue(getFirestore.calledOnceWith(app));
      assert.isTrue(
        firestoreInstance.collection.calledOnceWith('fooCollection')
      );
      assert.isTrue(collection.get.calledOnceWith());
      assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(querySnapshot));
      const expectedQueryResult = {
        docs: [snapshot],
      };
      assert.deepStrictEqual(queryResult, expectedQueryResult);
    });

    it('returns collection with query', async () => {
      // arrange
      const querySnapshot = stubInterface<firestore.QueryDocumentSnapshot>();
      const mockedDocs = [querySnapshot];

      const mockedQueryResult: firestore.QuerySnapshot = {
        ...stubInterface<firestore.QuerySnapshot>(),
        docs: mockedDocs,
      };

      const queryObj = stubInterface<firestore.Query>();
      queryObj.get.resolves(mockedQueryResult);

      const collection = stubInterface<firestore.CollectionReference>();
      collection.where.returns(queryObj);

      const firestoreInstance = stubInterface<firestore.Firestore>();
      firestoreInstance.collection.returns(collection);

      const getFirestore = sinon
        .stub(firestore, 'getFirestore')
        .returns(firestoreInstance);

      const snapshot = stubInterface<DocumentSnapshot>();

      const wrapFirebaseSnapshot = sinon
        .stub(util, 'wrapFirebaseSnapshot')
        .returns(snapshot);

      const app = stubInterface<App>();

      // act
      const queryResult = await getCollection(
        app,
        'fooCollection',
        (collection) => collection.where('foo', '!=', 'bar')
      );

      // assert
      assert.isTrue(getFirestore.calledOnceWith(app));
      assert.isTrue(
        firestoreInstance.collection.calledOnceWith('fooCollection')
      );
      assert.isTrue(collection.where.calledOnceWith('foo', '!=', 'bar'));
      assert.isTrue(queryObj.get.calledOnceWith());
      assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(querySnapshot));
      const expectedQueryResult = {
        docs: [snapshot],
      };
      assert.deepStrictEqual(queryResult, expectedQueryResult);
    });
  });
});
