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
    it('gets the document', () => {
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

              const mockedGetDocRef = sinon
                .stub(adminUtil, 'getDocRef')
                .returns(mockedDocRef);

              const mockedWrappedSnapshot = stubInterface<DocumentSnapshot>();
              const mockedWrappedSnapshot2 = stubInterface<DocumentSnapshot>();

              const mockedWrapFirebaseSnapshot = sinon
                .stub(util, 'wrapFirebaseSnapshot')
                .returns(mockedWrappedSnapshot);

              const mockedApp = stubInterface<App>();
              const mockedApp2 = stubInterface<App>();

              // act
              const wrappedSnapshot = await getDoc(
                mockedApp,
                collectionName,
                documentId
              );

              // assert
              assert.isTrue(
                mockedGetDocRef.calledOnceWith(
                  mockedApp,
                  collectionName,
                  documentId
                )
              );
              assert.isFalse(
                mockedGetDocRef.calledOnceWith(
                  mockedApp2,
                  collectionName,
                  documentId
                )
              );

              assert.isTrue(mockedDocRef.get.calledOnceWith());

              assert.isTrue(
                mockedWrapFirebaseSnapshot.calledOnceWith(mockedSnapshot)
              );
              assert.isFalse(
                mockedWrapFirebaseSnapshot.calledOnceWith(mockedSnapshot2)
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

              const mockedGetDocRef = sinon
                .stub(adminUtil, 'getDocRef')
                .returns(mockedDocRef);

              const mockedApp = stubInterface<App>();
              const mockedApp2 = stubInterface<App>();

              // act
              const deleteResult = await deleteDoc(
                mockedApp,
                collectionName,
                documentId
              );

              // assert
              assert.isTrue(
                mockedGetDocRef.calledOnceWith(
                  mockedApp,
                  collectionName,
                  documentId
                )
              );
              assert.isFalse(
                mockedGetDocRef.calledOnceWith(
                  mockedApp2,
                  collectionName,
                  documentId
                )
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

              const mockedGetDocRef = sinon
                .stub(adminUtil, 'getDocRef')
                .returns(mockedDocRef);

              const mockedApp = stubInterface<App>();
              const mockedApp2 = stubInterface<App>();

              const mockedDocData = stubInterface<firestore.DocumentData>();
              const mockedDocData2 = stubInterface<firestore.DocumentData>();

              // act
              const createResult = await createDoc(
                mockedApp,
                collectionName,
                documentId,
                mockedDocData
              );

              // assert
              assert.isTrue(
                mockedGetDocRef.calledOnceWith(
                  mockedApp,
                  collectionName,
                  documentId
                )
              );
              assert.isFalse(
                mockedGetDocRef.calledOnceWith(
                  mockedApp2,
                  collectionName,
                  documentId
                )
              );

              assert.isTrue(mockedDocRef.create.calledOnceWith(mockedDocData));
              assert.isFalse(
                mockedDocRef.create.calledOnceWith(mockedDocData2)
              );

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

              const mockedGetDocRef = sinon
                .stub(adminUtil, 'getDocRef')
                .returns(mockedDocRef);

              const mockedApp = stubInterface<App>();
              const mockedApp2 = stubInterface<App>();

              const mockedDocData = stubInterface<firestore.DocumentData>();
              const mockedDocData2 = stubInterface<firestore.DocumentData>();

              // act
              const updateResult = await updateDoc(
                mockedApp,
                collectionName,
                documentId,
                mockedDocData
              );

              // assert
              assert.isTrue(
                mockedGetDocRef.calledOnceWith(
                  mockedApp,
                  collectionName,
                  documentId
                )
              );
              assert.isFalse(
                mockedGetDocRef.calledOnceWith(
                  mockedApp2,
                  collectionName,
                  documentId
                )
              );

              assert.isTrue(
                (mockedDocRef.update as sinon.SinonStub).calledOnceWith(
                  mockedDocData
                )
              );
              assert.isFalse(
                (mockedDocRef.update as sinon.SinonStub).calledOnceWith(
                  mockedDocData2
                )
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
            const mockedQuerySnapshot =
              stubInterface<firestore.QueryDocumentSnapshot>();
            const mockedQuerySnapshot2 =
              stubInterface<firestore.QueryDocumentSnapshot>();

            const mockedQueryResult: firestore.QuerySnapshot = {
              ...stubInterface<firestore.QuerySnapshot>(),
              docs: [mockedQuerySnapshot],
            };

            const mockedCollectionRef =
              stubInterface<firestore.CollectionReference>();
            mockedCollectionRef.get.resolves(mockedQueryResult);

            const mockedFirestore = stubInterface<firestore.Firestore>();
            mockedFirestore.collection.returns(mockedCollectionRef);

            const mockedGetFirestore = sinon
              .stub(firestore, 'getFirestore')
              .returns(mockedFirestore);

            const mockedSnapshot = stubInterface<DocumentSnapshot>();
            const mockedSnapshot2 = stubInterface<DocumentSnapshot>();

            const mockedWrapFirebaseSnapshot = sinon
              .stub(util, 'wrapFirebaseSnapshot')
              .returns(mockedSnapshot);

            const mockedApp = stubInterface<App>();
            const mockedApp2 = stubInterface<App>();

            // act
            const queryResult = await getCollection(mockedApp, collectionName);

            // assert
            assert.isTrue(mockedGetFirestore.calledOnceWith(mockedApp));
            assert.isFalse(mockedGetFirestore.calledOnceWith(mockedApp2));

            assert.isTrue(
              mockedFirestore.collection.calledOnceWith(collectionName)
            );

            assert.isTrue(mockedCollectionRef.get.calledOnceWith());

            assert.isTrue(
              mockedWrapFirebaseSnapshot.calledOnceWith(mockedQuerySnapshot)
            );
            assert.isFalse(
              mockedWrapFirebaseSnapshot.calledOnceWith(mockedQuerySnapshot2)
            );

            assert.equal(queryResult.docs[0], mockedSnapshot);
            assert.notEqual(queryResult.docs[0], mockedSnapshot2);
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
              const mockedQuerySnapshot =
                stubInterface<firestore.QueryDocumentSnapshot>();
              const mockedQuerySnapshot2 =
                stubInterface<firestore.QueryDocumentSnapshot>();

              const mockedQueryResult: firestore.QuerySnapshot = {
                ...stubInterface<firestore.QuerySnapshot>(),
                docs: [mockedQuerySnapshot],
              };

              const queryObj = stubInterface<firestore.Query>();
              queryObj.get.resolves(mockedQueryResult);

              const mockedCollectionRef =
                stubInterface<firestore.CollectionReference>();
              mockedCollectionRef.where.returns(queryObj);

              const mockedFirestore = stubInterface<firestore.Firestore>();
              mockedFirestore.collection.returns(mockedCollectionRef);

              const mockedGetFirestore = sinon
                .stub(firestore, 'getFirestore')
                .returns(mockedFirestore);

              const mockedSnapshot = stubInterface<DocumentSnapshot>();
              const mockedSnapshot2 = stubInterface<DocumentSnapshot>();

              const mockedWrapFirebaseSnapshot = sinon
                .stub(util, 'wrapFirebaseSnapshot')
                .returns(mockedSnapshot);

              const mockedApp = stubInterface<App>();
              const mockedApp2 = stubInterface<App>();

              // act
              const queryResult = await getCollection(
                mockedApp,
                collectionName,
                (collection) => collection.where(fieldKey, op, fieldValue)
              );

              // assert
              assert.isTrue(mockedGetFirestore.calledOnceWith(mockedApp));
              assert.isFalse(mockedGetFirestore.calledOnceWith(mockedApp2));

              assert.isTrue(
                mockedFirestore.collection.calledOnceWith(collectionName)
              );

              assert.isTrue(mockedCollectionRef.get.calledOnceWith());

              assert.isTrue(
                mockedWrapFirebaseSnapshot.calledOnceWith(mockedQuerySnapshot)
              );
              assert.isFalse(
                mockedWrapFirebaseSnapshot.calledOnceWith(mockedQuerySnapshot2)
              );

              assert.equal(queryResult.docs[0], mockedSnapshot);
              assert.notEqual(queryResult.docs[0], mockedSnapshot2);
              assert.isTrue(
                mockedCollectionRef.where.calledOnceWith(
                  fieldKey,
                  '!=',
                  fieldValue
                )
              );
            }
          )
          .afterEach(() => sinon.restore())
      );
    });
  });
});
