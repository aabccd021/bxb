import { flattenTests } from '../util';
import * as client from './client';
import * as server from './server';

export const tests = flattenTests({ client, server });
