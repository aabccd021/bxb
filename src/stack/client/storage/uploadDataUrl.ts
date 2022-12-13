import {
  either,
  io,
  ioEither,
  option,
  readonlyNonEmptyArray,
  readonlyRecord,
  string,
  taskEither,
} from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { match } from 'ts-pattern';
import isValidDataUrl from 'valid-data-url';

import type { Stack as S } from '../../../type';
import type { Stack } from '../../type';
import { setItem } from '../../util';
import { storageKey } from './util';
type Type = Stack['client']['storage']['uploadDataUrl'];

const getLessThanNumber = ({
  value,
  param,
}: {
  readonly param: S.client.storage.UploadDataUrl.Param;
  readonly value: S.ci.DeployStorage.NumberContant | S.ci.DeployStorage.ObjectSize;
}): number =>
  match(value)
    .with({ type: 'ObjectSize' }, () =>
      pipe(param.dataUrl, string.split(','), ([prefix, nullableData]) =>
        pipe(
          option.fromNullable(nullableData),
          option.map((data) =>
            string.includes(';base64')(prefix) ? Buffer.from(data, 'base64') : data
          ),
          option.map((s) => s.length),
          option.getOrElse(() => 0)
        )
      )
    )
    .with({ type: 'NumberConstant' as const }, (numberConstant) => numberConstant.value)
    .exhaustive();

const validate =
  (param: S.client.storage.UploadDataUrl.Param) =>
  (deployConfig: S.ci.DeployStorage.Param): boolean =>
    pipe(
      option.fromNullable(deployConfig.securityRule?.create),
      option.map(
        flow(
          readonlyNonEmptyArray.map((rule) =>
            match(rule)
              .with(
                { type: 'LessThan' },
                (lessThanRule) =>
                  getLessThanNumber({ param, value: lessThanRule.compare.lhs }) <
                  getLessThanNumber({ param, value: lessThanRule.compare.rhs })
              )
              .with({ type: 'Equal' }, () => false)
              .with({ type: 'True' }, () => true)
              .exhaustive()
          ),
          readonlyNonEmptyArray.reduce(true, (a, b) => a && b)
        )
      ),
      option.getOrElse(() => false)
    );

export const uploadDataUrl: Type = (env) => (param) =>
  pipe(
    either.fromPredicate(isValidDataUrl, () => ({ code: 'InvalidDataUrlFormat' as const }))(
      param.dataUrl
    ),
    ioEither.fromEither,
    ioEither.chainW(() =>
      pipe(
        env.storageDeployConfig.read,
        io.map(
          either.fromOption(() => ({
            code: 'ProviderError' as const,
            provider: 'mock',
            value: 'db deploy config not found',
          }))
        )
      )
    ),
    ioEither.chainEitherKW(
      either.fromPredicate(validate(param), () => ({ code: 'Forbidden' as const }))
    ),
    ioEither.chainIOK(() => setItem(env.getWindow, `${storageKey}/${param.key}`, param.dataUrl)),
    taskEither.fromIOEither,
    taskEither.chainIOK(() => env.functions.read),
    taskEither.chainW(
      flow(
        option.map(({ functions }) => functions),
        option.getOrElseW(() => ({})),
        readonlyRecord.filterMap((fn) =>
          fn.trigger === 'onObjectCreated'
            ? option.some(fn.handler({ object: { key: param.key } }))
            : option.none
        ),
        readonlyRecord.sequence(taskEither.ApplicativeSeq),
        taskEither.bimap(
          (value) => ({ code: 'ProviderError' as const, value }),
          () => undefined
        )
      )
    ),
    taskEither.mapLeft((err) => ({
      ...err,
      capability: 'client.storage.uploadDataUrl',
    }))
  );
