import { taskEither } from 'fp-ts';
import { runTests } from 'masmott/dist/cjs/test';

import { stack } from '../src';
import type { StackT } from '../src/env';

runTests<StackT>(stack, taskEither.right({ ci: undefined, client: undefined, server: undefined }));
