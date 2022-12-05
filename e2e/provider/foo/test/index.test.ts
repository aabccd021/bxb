import { taskEither } from 'fp-ts';
import { runTests } from 'masmott/dist/cjs/test';

import { stack } from '../src';
import type { StackType } from '../src/env';

runTests<StackType>(
  stack,
  taskEither.right({ ci: undefined, client: undefined, server: undefined })
);
