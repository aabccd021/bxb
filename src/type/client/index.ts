import * as auth from './auth';
import * as db from './db';
import * as storage from './storage';
export type Type = {
  readonly auth: auth.Scope;
  readonly db: db.Scope;
  readonly storage: storage.Scope;
};
export { auth, db, storage };
