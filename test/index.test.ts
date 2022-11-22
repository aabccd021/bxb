import { Window } from 'happy-dom';

import { independencyTests } from '../src';
import { mkStackFromDom } from '../src/mock';

const mkStack = mkStackFromDom(() => new Window() as any);

independencyTests(mkStack);
