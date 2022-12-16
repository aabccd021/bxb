import { option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';

import { getFunctionsDeployParam } from '../../helper';
import type { Stack } from '../type';

type Type = Stack['ci']['deployFunctions'];

export const deployFunctions: Type = (env) => (params) =>
  pipe(
    getFunctionsDeployParam(params),
    taskEither.chainIOK((a) => env.functions.write(option.some(a))),
    taskEither.mapLeft((err) => ({ ...err, capability: 'ci.deployFunctions' }))
  );
