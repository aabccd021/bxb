import { TaskEither } from 'fp-ts/TaskEither';

import { mkStack } from '../src/mock';
import { tests } from '../src/test';

tests(mkStack, {});

type Right<TE> = TE extends TaskEither<any, infer R> ? R : never;

export type A = ReturnType<typeof mkStack>['client']['storage']['getDownloadUrl'];

export type AR = Right<ReturnType<ReturnType<A>>>;
