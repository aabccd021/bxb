import { either, io, ioEither, ioOption, option, readonlyRecord, string, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import { match } from 'ts-pattern';

import type { AuthState, DocData, Stack as StackType } from '../../../type';
import type { Stack } from '../../type';
import {
  dbLocalStorageKey,
  getDb,
  getItem,
  notifySubscriber,
  setObjectItem,
  stringifyDocKey,
} from '../../util';
import { authLocalStorageKey } from '../util';

type Type = Stack['client']['db']['upsertDoc'];

const compare = (
  docData: DocData,
  authState: AuthState,
  _authUid: StackType.ci.DeployDb.AuthUid,
  documentField: StackType.ci.DeployDb.DocumentField
) =>
  pipe(
    authState,
    option.map(({ uid }) => docData[documentField.fieldName] === uid),
    option.getOrElse(() => false)
  );

const validateEqual =
  (docData: DocData, authState: AuthState) =>
  ({ compare: comparationPair }: StackType.ci.DeployDb.Equal): boolean =>
    match(comparationPair)
      .with([{ type: 'AuthUid' }, { type: 'DocumentField' }], ([lhs, rhs]) =>
        compare(docData, authState, lhs, rhs)
      )
      .with([{ type: 'DocumentField' }, { type: 'AuthUid' }], ([lhs, rhs]) =>
        compare(docData, authState, rhs, lhs)
      )
      .exhaustive();

const validateCreateAccessRule =
  (docData: DocData, authState: AuthState) =>
  (rule: StackType.ci.DeployDb.CreateRule): boolean =>
    match(rule)
      .with({ type: 'True' }, () => true)
      .with({ type: 'Equal' }, validateEqual(docData, authState))
      .exhaustive();

const validateUpdateAccessRule =
  (_docData: DocData, _authState: AuthState) =>
  (rule: StackType.ci.DeployDb.UpdateRule): boolean =>
    match(rule)
      .with({ type: 'True' }, () => true)
      .exhaustive();

export const upsertDoc: Type = (env) => (param) =>
  pipe(
    ioEither.Do,
    ioEither.bindW('config', () =>
      pipe(
        env.dbDeployConfig.read,
        io.map(
          either.fromOption(() => ({
            code: 'Provider' as const,
            provider: 'mock',
            value: 'db deploy config not found',
          }))
        )
      )
    ),
    ioEither.bindW('authState', () =>
      pipe(
        getItem(env.getWindow, authLocalStorageKey),
        ioOption.map((uid) => ({ uid })),
        ioEither.fromIO
      )
    ),
    ioEither.bindW('resourceDoc', () =>
      pipe(
        getDb(env.getWindow),
        ioEither.map(option.chain(readonlyRecord.lookup(stringifyDocKey(param.key))))
      )
    ),
    ioEither.chainEitherKW(
      either.fromPredicate(
        ({ config, authState, resourceDoc }) =>
          (option.isSome(resourceDoc)
            ? pipe(
                option.fromNullable(config.collections[param.key.collection]?.securityRule?.update),
                option.map(validateUpdateAccessRule(param.data, authState)),
                option.getOrElse(() => false)
              )
            : pipe(
                option.fromNullable(config.collections[param.key.collection]?.securityRule?.create),
                option.map(validateCreateAccessRule(param.data, authState)),
                option.getOrElse(() => false)
              )) &&
          pipe(
            param.data,
            readonlyRecord.mapWithIndex(
              (fieldName, fieldValue) =>
                config.collections[param.key.collection]?.schema[fieldName]?.type ===
                  'StringField' && typeof fieldValue === 'string'
            ),
            readonlyRecord.reduce(string.Ord)(true, (a, b) => a && b)
          ),
        () => ({ code: 'Forbidden' as const })
      )
    ),
    ioEither.chainW(() => getDb(env.getWindow)),
    ioEither.map(
      flow(
        option.getOrElse(() => ({})),
        readonlyRecord.upsertAt(stringifyDocKey(param.key), param.data)
      )
    ),
    ioEither.chainIOK((dbData) => setObjectItem(env.getWindow, dbLocalStorageKey, dbData)),
    ioEither.chainIOK(() =>
      notifySubscriber({ env, key: param.key, docState: either.right(option.some(param.data)) })
    ),
    ioEither.map(() => undefined),
    taskEither.fromIOEither,
    taskEither.mapLeft((err) => ({ ...err, capability: 'client.db.upsertDoc' }))
  );
