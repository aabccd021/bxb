import { assert } from 'chai';
import { App } from 'firebase-admin/app';
import * as firestore from 'firebase-admin/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import { DocumentData } from '../../src';
import {
  createDoc,
  deleteDoc,
  getCollection,
  getDoc,
  updateDoc,
  wrapFirebaseSnapshot,
} from '../../src/wrapper/firebase-admin';

afterEach(() => {
  sinon.restore();
});

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

    const app = stubInterface<App>();

    // act
    const wrappedSnapshot = await getDoc(app, 'fooCollection', 'barId');

    // assert
    assert.isTrue(getFirestore.calledOnceWith(app));
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
    assert.isTrue(firestoreInstance.doc.calledOnceWith('fooCollection/barId'));
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

    const data = stubInterface<DocumentData>();

    // act
    const createResult = await createDoc(app, 'fooCollection', 'barId', data);

    // assert
    assert.isTrue(getFirestore.calledOnceWith(app));
    assert.isTrue(firestoreInstance.doc.calledOnceWith('fooCollection/barId'));
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

    const data = stubInterface<DocumentData>();

    // act
    const updateResult = await updateDoc(app, 'fooCollection', 'barId', data);

    // assert
    assert.isTrue(getFirestore.calledOnceWith(app));
    assert.isTrue(firestoreInstance.doc.calledOnceWith('fooCollection/barId'));
    // assert.isTrue(doc.update.calledOnceWith(data));
    assert.deepStrictEqual(updateResult, mockedUpdateResult);
  });
});

describe('getCollection', () => {
  it('returns collection', async () => {
    // arrange
    // const mockedQueryResult = stubInterface<firestore.QuerySnapshot>();
    const snapshot: firestore.QueryDocumentSnapshot = {
      ...stubInterface<firestore.QueryDocumentSnapshot>(),
      id: 'hogeId',
      data: () => ({
        lorem: 'ipsum',
      }),
    };
    const mockedDocs = [snapshot];

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

    const app = stubInterface<App>();

    // act
    const queryResult = await getCollection(app, 'fooCollection');

    // assert
    assert.isTrue(getFirestore.calledOnceWith(app));
    assert.isTrue(firestoreInstance.collection.calledOnceWith('fooCollection'));
    assert.isTrue(collection.get.calledOnceWith());
    const expectedQueryResult = {
      docs: [
        {
          id: 'hogeId',
          data: {
            lorem: 'ipsum',
          },
        },
      ],
    };
    assert.deepStrictEqual(queryResult, expectedQueryResult);
  });

  it('returns collection with query', async () => {
    // arrange
    const snapshot: firestore.QueryDocumentSnapshot = {
      ...stubInterface<firestore.QueryDocumentSnapshot>(),
      id: 'hogeId',
      data: () => ({
        lorem: 'ipsum',
      }),
    };
    const mockedDocs = [snapshot];

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

    const app = stubInterface<App>();

    // act
    const queryResult = await getCollection(
      app,
      'fooCollection',
      (collection) => collection.where('foo', '!=', 'bar')
    );

    // assert
    assert.isTrue(getFirestore.calledOnceWith(app));
    assert.isTrue(firestoreInstance.collection.calledOnceWith('fooCollection'));
    assert.isTrue(collection.where.calledOnceWith('foo', '!=', 'bar'));
    assert.isTrue(queryObj.get.calledOnceWith());
    const expectedQueryResult = {
      docs: [
        {
          id: 'hogeId',
          data: {
            lorem: 'ipsum',
          },
        },
      ],
    };
    assert.deepStrictEqual(queryResult, expectedQueryResult);
  });
});

describe('wrapFirebaseSnapshot', () => {
  it('returns empty object if data is undefined', () => {
    // arrange
    const snapshot: firestore.DocumentSnapshot = {
      ...stubInterface<firestore.DocumentSnapshot>(),
      id: 'hogeId',
      data: () => undefined,
    };

    // act
    const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);

    // assert
    const expectedSnapshot = {
      id: 'hogeId',
      data: {},
    };
    assert.deepStrictEqual(wrappedSnapshot, expectedSnapshot);
  });
});
