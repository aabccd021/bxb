import { assert } from 'chai';
import * as firestore from 'firebase-admin/firestore';
import sinon, { stubInterface } from 'ts-sinon';
import { wrapFirebaseSnapshot } from '../src/util';

describe('util', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('wrapFirebaseSnapshot', () => {
    it('returns snapshot as is', () => {
      // arrange
      const snapshot: firestore.DocumentSnapshot = {
        ...stubInterface<firestore.DocumentSnapshot>(),
        id: 'hogeId',
        data: () => ({
          lorem: 'ipsum',
        }),
      };

      // act
      const wrappedSnapshot = wrapFirebaseSnapshot(snapshot);

      // assert
      const expectedSnapshot = {
        id: 'hogeId',
        data: {
          lorem: 'ipsum',
        },
      };
      assert.deepStrictEqual(wrappedSnapshot, expectedSnapshot);
    });

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
});
