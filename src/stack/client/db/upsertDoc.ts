import { either, io, ioEither, ioOption, option, readonlyRecord, string, taskEither } from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';

import type { AuthState, DocData, Stack as StackType } from '../../../type';
import type { Stack } from '../../type';
import { dbLocalStorageKey, getDb, getItem, setObjectItem } from '../../util';
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

const validateEqual = (
  docData: DocData,
  authState: AuthState,
  { compare: [lhs, rhs] }: StackType.ci.DeployDb.Equal
): boolean =>
  (lhs.type === 'AuthUid' &&
    rhs.type === 'DocumentField' &&
    compare(docData, authState, lhs, rhs)) ||
  (rhs.type === 'AuthUid' && lhs.type === 'DocumentField' && compare(docData, authState, rhs, lhs));

const validateSecurityRule =
  (docData: DocData, authState: AuthState) =>
  (rule: StackType.ci.DeployDb.CreateRule): boolean =>
    rule.type === 'True' || validateEqual(docData, authState, rule);

export const upsertDoc: Type = (env) => (param) =>
  pipe(
    ioEither.Do,
    ioEither.bindW('config', () =>
      pipe(
        env.dbDeployConfig.read,
        io.map(
          either.fromOption(() => ({
            code: 'ProviderError' as const,
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
    ioEither.chainEitherKW(
      either.fromPredicate(
        ({ config, authState }) =>
          pipe(
            option.fromNullable(config[param.key.collection]?.securityRule?.create),
            option.map(validateSecurityRule(param.data, authState)),
            option.getOrElse(() => false)
          ) &&
          pipe(
            param.data,
            readonlyRecord.mapWithIndex(
              (fieldName, fieldValue) =>
                config[param.key.collection]?.schema[fieldName]?.type === 'StringField' &&
                typeof fieldValue === 'string'
            ),
            readonlyRecord.reduce(string.Ord)(true, (a, b) => a && b)
          ),
        () => ({ code: 'ForbiddenError' as const })
      )
    ),
    ioEither.chainW(() => getDb(env.getWindow)),
    ioEither.map(
      flow(
        option.getOrElse(() => ({})),
        readonlyRecord.upsertAt(`${param.key.collection}/${param.key.id}`, param.data)
      )
    ),
    ioEither.chainIOK((data) => setObjectItem(env.getWindow, dbLocalStorageKey, data)),
    taskEither.fromIOEither
  );
