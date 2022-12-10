import { functions } from '../src/test';
import { runSuiteConcurrent } from './util';

functions.allSuites.forEach((suite) => runSuiteConcurrent({ suite }));
