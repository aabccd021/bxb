import {
  apply,
  boolean,
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
import type { Task } from 'fp-ts/Task';
import { match } from 'ts-pattern';
import isValidDataUrl from 'valid-data-url';

import type { Stack as S } from '../../../type';
import type { Stack } from '../../type';
import type { DB } from '../../util';
import { getDb, getItem, setItem, stringifyDocKey } from '../../util';
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
            pipe(
              prefix,
              string.includes(';base64'),
              boolean.matchW(
                () => data,
                () => Buffer.from(data, 'base64')
              ),
              (s) => s.length
            )
          ),
          option.getOrElse(() => 0)
        )
      )
    )
    .with({ type: 'NumberConstant' }, (numberConstant) => numberConstant.value)
    .exhaustive();

const getEqualValue = ({
  value,
  param,
  authState,
  db: dbEither,
}: {
  readonly param: S.client.storage.UploadDataUrl.Param;
  readonly value: S.ci.DeployStorage.AuthUid | S.ci.DeployStorage.DocumentField;
  readonly authState: Option<string>;
  readonly db: Either<unknown, Option<DB>>;
}): Either<unknown, string> =>
  match(value)
    .with({ type: 'AuthUid' }, () =>
      pipe(
        authState,
        either.fromOption(() => 'authstate not found')
      )
    )
    .with({ type: 'DocumentField' }, (documentField) =>
      pipe(
        dbEither,
        either.chainW(either.fromOption(() => 'db not found')),
        either.chainW(
          flow(
            readonlyRecord.lookup(
              stringifyDocKey({
                collection: documentField.document.collection.value,
                id: match(documentField.document.id)
                  .with({ type: 'ObjectId' }, () => param.key)
                  .exhaustive(),
              })
            ),
            either.fromOption(() => 'doc not found')
          )
        ),
        either.chainW(
          flow(
            readonlyRecord.lookup(documentField.fieldName.value),
            either.fromOption(() => 'fieldName not found')
          )
        ),
        either.chainW(either.fromPredicate(string.isString, () => 'field is not a string'))
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
  (rule: S.ci.DeployStorage.CreateRule): Either<unknown, undefined> =>
    match(rule)
      .with({ type: 'LessThan' }, (lessThanRule) =>
        pipe(
          {
            lhs: getLessThanNumber({ param, value: lessThanRule.compare.lhs }),
            rhs: getLessThanNumber({ param, value: lessThanRule.compare.rhs }),
          },
          ({ lhs, rhs }) =>
            lhs < rhs ? either.right(undefined) : either.left({ code: 'does not satisfy', rule })
        )
      )
      .with({ type: 'Equal' }, (equalRule) =>
        pipe(
          {
            lhs: getEqualValue({ param, authState, db, value: equalRule.compare.lhs }),
            rhs: getEqualValue({ param, authState, db, value: equalRule.compare.rhs }),
          },
          apply.sequenceS(either.Applicative),
          either.chainW(({ lhs, rhs }) =>
            lhs === rhs ? either.right(undefined) : either.left({ code: 'does not satisfy', rule })
          )
        )
      )
      .with({ type: 'True' }, () => either.right(undefined))
      .exhaustive();

const validate = ({
  param,
  deployConfig: deployConfigOption,
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
        deployConfigOption,
        either.fromOption(() => ({
          code: 'Provider' as const,
          provider: 'mock',
          value: 'db deploy config not found',
        })),
        either.chainW((deployConfig) =>
          pipe(
            deployConfig.securityRule,
            either.fromNullable(() => 'storageDeployConfig.securityRule not found'),
            either.map((securityRule) => securityRule.create),
            either.chainW(
              either.fromNullable(() => 'storageDeployConfig.securityRule.create not found')
            ),
            either.chainW(
              readonlyNonEmptyArray.traverse(either.Applicative)(isValid({ param, authState, db }))
            ),
            either.mapLeft(() => ({ code: 'Forbidden' as const }))
          )
        )
      )
    )
  );

// eslint-disable-next-line @typescript-eslint/require-await
const runAsync = (t: Task<unknown>) => async () => {
  // eslint-disable-next-line max-len
  // eslint-disable-next-line functional/no-expression-statement, @typescript-eslint/no-floating-promises
  t();
};

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
    taskEither.chainFirstTaskK(
      flow(
        option.map(({ functions }) => functions),
        option.getOrElseW(() => ({})),
        readonlyRecord.filterMap((fn) =>
          fn.trigger === 'onObjectCreated'
            ? option.some(fn.handler({ object: { key: param.key } }))
            : option.none
        ),
        readonlyRecord.sequence(taskEither.ApplicativeSeq),
        runAsync
      )
    ),
    taskEither.bimap(
      (err) => ({ ...err, capability: 'client.storage.uploadDataUrl' }),
      () => undefined
    )
  );
