import { independence } from '../src/test';
import { runSuite } from './util';

independence.allSuites.forEach((suite) => runSuite({ suite }));
