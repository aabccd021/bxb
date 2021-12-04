import { pipe } from 'fp-ts/lib/function';
import { deleteDocWithId } from '../firebase-admin/effect';
import { makeDeleteTrigger } from '../firebase-functions/pure';
import { OnDeleteHandler, OnDeleteTrigger } from '../types';
import { makeViewCollectionPath } from '../util';

/**
 *
 */
const makeOnViewSrcDeletedHandler =
  (collection: string) =>
  (view: string): OnDeleteHandler =>
  (_context) =>
  (srcDoc) => {
    const toViewCollectionPath = makeViewCollectionPath(view);
    return pipe(collection, toViewCollectionPath, deleteDocWithId(srcDoc.id));
  };

/**
 * Make a trigger to run on source document delete. The trigger will delete all
 * view documents with the same id as deleted source document.
 */
export const makeOnViewSrcDeletedTrigger = (
  collection: string,
  view: string
): OnDeleteTrigger => {
  const handler = makeOnViewSrcDeletedHandler(collection)(view);
  const toTrigger = makeDeleteTrigger(collection);
  return pipe(handler, toTrigger);
};
