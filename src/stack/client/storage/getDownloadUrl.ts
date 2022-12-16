import { apply, either, io, option, readonlyNonEmptyArray, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { match } from 'ts-pattern';

import type { Stack } from '../../type';
import { getItem } from '../../util';
import { storageKey } from './util';
type Type = Stack['client']['storage']['getDownloadUrl'];

import type { Stack as S } from '../../../type';

const isValid = (deployConfig: S.ci.DeployStorage.Param): boolean =>
  pipe(
    option.fromNullable(deployConfig.securityRule?.get),
    option.map(
      flow(
        readonlyNonEmptyArray.map((rule) =>
          match(rule)
            .with({ type: 'True' }, () => true)
            .exhaustive()
        ),
        readonlyNonEmptyArray.reduce(true, (a, b) => a && b)
      )
    ),
    option.getOrElse(() => false)
  );

export const getDownloadUrl: Type = (env) => (param) =>
  pipe(
    {
      object: getItem(env.getWindow, `${storageKey}/${param.key}`),
      deployConfig: env.storageDeployConfig.read,
    },
    apply.sequenceS(io.Apply),
    io.map(({ object, deployConfig }) =>
      pipe(
        deployConfig,
        either.fromOption(() => ({
          code: 'Provider' as const,
          provider: 'mock',
          value: 'db deploy config not found',
        })),
        either.chainW(either.fromPredicate(isValid, () => ({ code: 'Forbidden' as const }))),
        either.chainW(() => either.fromOption(() => ({ code: 'FileNotFound' as const }))(object))
      )
    ),
    taskEither.fromIOEither,
    taskEither.mapLeft((err) => ({ ...err, capability: 'client.storage.getDownloadUrl' }))
  );
