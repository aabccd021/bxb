import { flattenTests } from '../../util';
import * as auth from './auth';
import * as db from './db';
import * as storage from './storage';

export const tests = flattenTests({ auth, db, storage });
