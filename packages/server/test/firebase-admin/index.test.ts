import { assert } from 'chai';
import * as fc from 'fast-check';
import * as firestore from 'firebase-admin/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import {
  createDoc,
  deleteDoc,
  getCollection,
  getDoc,
  updateDoc,
} from '../../src/firebase-admin';
import * as adminUtil from '../../src/firebase-admin/util';
import { App, DocumentSnapshot, WHERE_FILTER_OP } from '../../src/type';
import * as util from '../../src/util';

describe('firebase-admin', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getDoc', () => {
    it('gets the document', async () => {
      fc.assert(
        fc
          .asyncProperty(
            fc.string(),
            fc.string(),
            async (collectionName, documentId) => {
              // arrange
              const mockedSnapshot =
                stubInterface<firestore.DocumentSnapshot>();
              const mockedSnapshot2 =
                stubInterface<firestore.DocumentSnapshot>();

              const mockedDocRef = stubInterface<firestore.DocumentReference>();
              mockedDocRef.get.resolves(mockedSnapshot);

              const getDocRef = sinon
                .stub(adminUtil, 'getDocRef')
                .returns(mockedDocRef);

              const mockedWrappedSnapshot = stubInterface<DocumentSnapshot>();
              const mockedWrappedSnapshot2 = stubInterface<DocumentSnapshot>();

              const wrapFirebaseSnapshot = sinon
                .stub(util, 'wrapFirebaseSnapshot')
                .returns(mockedWrappedSnapshot);

              const app = stubInterface<App>();
              const app2 = stubInterface<App>();

              // act
              const wrappedSnapshot = await getDoc(
                app,
                collectionName,
                documentId
              );

              // assert
              assert.isTrue(
                getDocRef.calledOnceWith(app, collectionName, documentId)
              );
              assert.isFalse(
                getDocRef.calledOnceWith(app2, collectionName, documentId)
              );

              assert.isTrue(mockedDocRef.get.calledOnceWith());

              assert.isTrue(
                wrapFirebaseSnapshot.calledOnceWith(mockedSnapshot)
              );
              assert.isFalse(
                wrapFirebaseSnapshot.calledOnceWith(mockedSnapshot2)
              );

              assert.equal(wrappedSnapshot, mockedWrappedSnapshot);
              assert.notEqual(wrappedSnapshot, mockedWrappedSnapshot2);
            }
          )
          .afterEach(() => sinon.restore())
      );
    });
  });

  describe('deleteDoc', () => {
    it('deletes the document', async () => {
      fc.assert(
        fc
          .asyncProperty(
            fc.string(),
            fc.string(),
            async (collectionName, documentId) => {
              // arrange
              const mockedResult = stubInterface<firestore.WriteResult>();
              const mockedResult2 = stubInterface<firestore.WriteResult>();

              const mockedDocRef = stubInterface<firestore.DocumentReference>();
              mockedDocRef.delete.resolves(mockedResult);

              const getDocRef = sinon
                .stub(adminUtil, 'getDocRef')
                .returns(mockedDocRef);

              const app = stubInterface<App>();
              const app2 = stubInterface<App>();

              // act
              const deleteResult = await deleteDoc(
                app,
                collectionName,
                documentId
              );

              // assert
              assert.isTrue(
                getDocRef.calledOnceWith(app, collectionName, documentId)
              );
              assert.isFalse(
                getDocRef.calledOnceWith(app2, collectionName, documentId)
              );

              assert.isTrue(mockedDocRef.delete.calledOnceWith());

              assert.equal(deleteResult, mockedResult);
              assert.notEqual(deleteResult, mockedResult2);
            }
          )
          .afterEach(() => sinon.restore())
      );
    });
  });

  describe('createDoc', () => {
    it('creates  document', async () => {
      fc.assert(
        fc
          .asyncProperty(
            fc.string(),
            fc.string(),
            async (collectionName, documentId) => {
              // arrange
              // arrange
              const mockedCreateResult = stubInterface<firestore.WriteResult>();
              const mockedCreateResult2 =
                stubInterface<firestore.WriteResult>();

              const mockedDocRef = stubInterface<firestore.DocumentReference>();
              mockedDocRef.create.resolves(mockedCreateResult);

              const getDocRef = sinon
                .stub(adminUtil, 'getDocRef')
                .returns(mockedDocRef);

              const app = stubInterface<App>();
              const app2 = stubInterface<App>();

              const data = stubInterface<firestore.DocumentData>();
              const data2 = stubInterface<firestore.DocumentData>();

              // act
              const createResult = await createDoc(
                app,
                collectionName,
                documentId,
                data
              );

              // assert
              assert.isTrue(
                getDocRef.calledOnceWith(app, collectionName, documentId)
              );
              assert.isFalse(
                getDocRef.calledOnceWith(app2, collectionName, documentId)
              );

              assert.isTrue(mockedDocRef.create.calledOnceWith(data));
              assert.isFalse(mockedDocRef.create.calledOnceWith(data2));

              assert.equal(createResult, mockedCreateResult);
              assert.notEqual(createResult, mockedCreateResult2);
            }
          )
          .afterEach(() => sinon.restore())
      );
    });
  });

  describe('updateDoc', () => {
    it('updates the  document', async () => {
      fc.assert(
        fc
          .asyncProperty(
            fc.string(),
            fc.string(),
            async (collectionName, documentId) => {
              // arrange
              // arrange
              const mockedUpdateResult = stubInterface<firestore.WriteResult>();
              const mockedUpdateResult2 =
                stubInterface<firestore.WriteResult>();

              const mockedDocRef = stubInterface<firestore.DocumentReference>();
              mockedDocRef.update.resolves(mockedUpdateResult);

              const getDocRef = sinon
                .stub(adminUtil, 'getDocRef')
                .returns(mockedDocRef);

              const app = stubInterface<App>();
              const app2 = stubInterface<App>();

              const data = stubInterface<firestore.DocumentData>();
              const data2 = stubInterface<firestore.DocumentData>();

              // act
              const updateResult = await updateDoc(
                app,
                collectionName,
                documentId,
                data
              );

              // assert
              assert.isTrue(
                getDocRef.calledOnceWith(app, collectionName, documentId)
              );
              assert.isFalse(
                getDocRef.calledOnceWith(app2, collectionName, documentId)
              );

              assert.isTrue(
                (mockedDocRef.update as sinon.SinonStub).calledOnceWith(data)
              );
              assert.isFalse(
                (mockedDocRef.update as sinon.SinonStub).calledOnceWith(data2)
              );

              assert.equal(updateResult, mockedUpdateResult);
              assert.notEqual(updateResult, mockedUpdateResult2);
            }
          )
          .afterEach(() => sinon.restore())
      );
    });
  });

  describe('getCollection', () => {
    it('returns collection', async () => {
      fc.assert(
        fc
          .asyncProperty(fc.string(), async (collectionName) => {
            // arrange
            const querySnapshot =
              stubInterface<firestore.QueryDocumentSnapshot>();
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
            const queryResult = await getCollection(app, collectionName);

            // assert
            assert.isTrue(getFirestore.calledOnceWith(app));
            assert.isTrue(
              firestoreInstance.collection.calledOnceWith(collectionName)
            );
            assert.isTrue(collection.get.calledOnceWith());
            assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(querySnapshot));
            const expectedQueryResult = {
              docs: [snapshot],
            };
            assert.deepStrictEqual(queryResult, expectedQueryResult);
          })
          .afterEach(() => sinon.restore())
      );
    });

    it('returns collection with query', async () => {
      fc.assert(
        fc
          .asyncProperty(
            fc.string(),
            fc.constantFrom(...WHERE_FILTER_OP),
            fc.string(),
            fc.string(),
            async (collectionName, op, fieldKey, fieldValue) => {
              // arrange
              const querySnapshot =
                stubInterface<firestore.QueryDocumentSnapshot>();
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
                collectionName,
                (collection) => collection.where(fieldKey, op, fieldValue)
              );

              // assert
              assert.isTrue(getFirestore.calledOnceWith(app));
              assert.isTrue(
                firestoreInstance.collection.calledOnceWith(collectionName)
              );
              assert.isTrue(
                collection.where.calledOnceWith(fieldKey, '!=', fieldValue)
              );
              assert.isTrue(queryObj.get.calledOnceWith());
              assert.isTrue(wrapFirebaseSnapshot.calledOnceWith(querySnapshot));
              const expectedQueryResult = {
                docs: [snapshot],
              };
              assert.deepStrictEqual(queryResult, expectedQueryResult);
            }
          )
          .afterEach(() => sinon.restore())
      );
    });
  });
});
