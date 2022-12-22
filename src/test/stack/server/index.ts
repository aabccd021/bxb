import { flattenTests } from '../../util';
import * as db from './db';

export const tests = flattenTests({ db });
