import {
  apply,
  either,
  io,
  ioEither,
  option,
  readonlyNonEmptyArray,
  readonlyRecord,
  string,
  taskEither,
} from 'fp-ts';
import type { Either } from 'fp-ts/Either';
import { flow, pipe } from 'fp-ts/function';
import type { Option } from 'fp-ts/Option';
import { match } from 'ts-pattern';
import isValidDataUrl from 'valid-data-url';

import type { Stack as S } from '../../../type';
import type { Stack } from '../../type';
import type { DB } from '../../util';
import { stringifyDocKey } from '../../util';
import { getDb, getItem, setItem } from '../../util';
import { authLocalStorageKey } from '../util';
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

const getEqualValue = ({
  value,
  param,
  authState,
  db,
}: {
  readonly param: S.client.storage.UploadDataUrl.Param;
  readonly value: S.ci.DeployStorage.AuthUid | S.ci.DeployStorage.DocumentField;
  readonly authState: Option<string>;
  readonly db: Either<unknown, Option<DB>>;
}): Option<string> =>
  match(value)
    .with({ type: 'AuthUid' }, () => authState)
    .with({ type: 'DocumentField' }, (documentField) =>
      pipe(
        option.fromEither(db),
        option.flatten,
        option.chain(
          readonlyRecord.lookup(
            stringifyDocKey({
              collection: documentField.document.collection.value,
              id: match(documentField.document.id)
                .with({ type: 'ObjectId' }, () => param.key)
                .exhaustive(),
            })
          )
        ),
        option.chain(readonlyRecord.lookup(documentField.fieldName.value)),
        option.chain(option.fromPredicate(string.isString))
      )
    )
    .exhaustive();

const isValid =
  ({
    param,
    authState,
    db,
  }: {
    readonly param: S.client.storage.UploadDataUrl.Param;
    readonly authState: Option<string>;
    readonly db: Either<unknown, Option<DB>>;
  }) =>
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
              .with({ type: 'Equal' }, (equalRule) =>
                pipe(
                  {
                    lhs: getEqualValue({ param, authState, db, value: equalRule.compare.lhs }),
                    rhs: getEqualValue({ param, authState, db, value: equalRule.compare.lhs }),
                  },
                  apply.sequenceS(option.Apply),
                  option.map(({ lhs, rhs }) => lhs === rhs),
                  option.getOrElse(() => false)
                )
              )
              .with({ type: 'True' }, () => true)
              .exhaustive()
          ),
          readonlyNonEmptyArray.reduce(true, (a, b) => a && b)
        )
      ),
      option.getOrElse(() => false)
    );

const validate = ({
  param,
  deployConfig,
  authState,
  db,
}: {
  readonly param: S.client.storage.UploadDataUrl.Param;
  readonly deployConfig: Option<S.ci.DeployStorage.Param>;
  readonly authState: Option<string>;
  readonly db: Either<unknown, Option<DB>>;
}) =>
  pipe(
    param.dataUrl,
    either.fromPredicate(isValidDataUrl, () => ({ code: 'InvalidDataUrlFormat' as const })),
    either.chainW(() =>
      pipe(
        deployConfig,
        either.fromOption(() => ({
          code: 'ProviderError' as const,
          provider: 'mock',
          value: 'db deploy config not found',
        })),
        either.chainW(
          either.fromPredicate(isValid({ param, authState, db }), () => ({
            code: 'Forbidden' as const,
          }))
        )
      )
    )
  );

export const uploadDataUrl: Type = (env) => (param) =>
  pipe(
    {
      deployConfig: env.storageDeployConfig.read,
      authState: getItem(env.getWindow, authLocalStorageKey),
      db: getDb(env.getWindow),
    },
    apply.sequenceS(io.Apply),
    io.map(({ deployConfig, db, authState }) => validate({ deployConfig, param, authState, db })),
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
