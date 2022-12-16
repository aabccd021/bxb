import { capability } from '../src/test';
import { runSuiteConcurrent } from './util';

capability.allSuites.forEach((suite) => runSuiteConcurrent({ suite }));
