import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';
import type { AType } from '@morphic-ts/summoners/lib';
import {
  apply,
  either,
  io,
  ioEither,
  ioOption,
  ioRef,
  option,
  readonlyRecord,
  taskEither,
} from 'fp-ts';
import { flow, pipe } from 'fp-ts/function';
import type { IO } from 'fp-ts/IO';
import type { IORef } from 'fp-ts/IORef';
import type { Option } from 'fp-ts/Option';
import type { Refinement } from 'fp-ts/Refinement';
import type { DeepPick } from 'ts-essentials';
import isValidDataUrl from 'valid-data-url';

import type { Client, OnAuthStateChangedParam, Stack } from './type';
import { CreateUserAndSignInWithEmailAndPasswordError } from './type';
import { GetDownloadUrlError, UploadDataUrlError } from './type';

const { summon } = summonFor({});

export type Window = DeepPick<
  typeof window,
  {
    readonly location: {
      readonly origin: never;
      readonly href: never;
    };
    readonly localStorage: never;
  }
>;

const DB = summon((F) => F.strMap(F.strMap(F.unknown())));

type DB = AType<typeof DB>;

const authLocalStorageKey = 'auth';
const dbLocalStorageKey = 'db';
const storageKey = 'storage';

const getLocationOrigin = (getWindow: IO<Window>) =>
  pipe(
    getWindow,
    io.map((win) => win.location.origin)
  );

const getLocationHref = (getWindow: IO<Window>) =>
  pipe(
    getWindow,
    io.map((win) => win.location.href)
  );

const setLocationHref = (getWindow: IO<Window>, newHref: string) =>
  pipe(
    getWindow,
    // eslint-disable-next-line functional/no-return-void
    io.map((win) => {
      // eslint-disable-next-line functional/immutable-data, functional/no-expression-statement
      win.location.href = newHref;
    })
  );

const mkRedirectUrl = ({ origin, href }: { readonly origin: string; readonly href: string }) => {
  const searchParamsStr = new URLSearchParams({ redirectUrl: href }).toString();
  return `${origin}/__masmott__/signInWithRedirect?${searchParamsStr}`;
};

const setItem = (getWindow: IO<Window>, key: string, value: string) =>
  pipe(
    getWindow,
    // eslint-disable-next-line functional/no-return-void
    io.map((win) => win.localStorage.setItem(key, value))
  );

const removeItem = (getWindow: IO<Window>, key: string) =>
  pipe(
    getWindow,
    // eslint-disable-next-line functional/no-return-void
    io.map((win) => win.localStorage.removeItem(key))
  );

const getItem = (getWindow: IO<Window>, key: string) =>
  pipe(
    getWindow,
    io.map((win) => win.localStorage.getItem(key)),
    io.map(option.fromNullable)
  );

const getObjectItem = <T, K>(
  getWindow: IO<Window>,
  key: string,
  refinement: Refinement<unknown, T>,
  onFalse: (data: unknown) => K
) =>
  pipe(
    getItem(getWindow, key),
    ioOption.map(JSON.parse),
    ioOption.map(either.fromPredicate(refinement, onFalse)),
    io.map(option.match(() => either.right(option.none), either.map(option.some)))
  );

const setObjectItem = <T>(getWindow: IO<Window>, key: string, data: T) =>
  pipe(data, JSON.stringify, (typeSafeData) => setItem(getWindow, key, typeSafeData));

const getDb = (getWindow: IO<Window>) =>
  getObjectItem(getWindow, dbLocalStorageKey, DB.type.is, (data) => ({
    code: 'ProviderError' as const,
    provider: 'mock',
    value: { message: 'invalid db data loaded', data },
  }));

export type MockClientEnv = {
  readonly onAuthStateChangedCallback: IORef<Option<OnAuthStateChangedParam>>;
  readonly getWindow: IO<Window>;
};

export const mkClientEnvFromWindow = (getGetWindow: IO<IO<Window>>) =>
  apply.sequenceS(io.Apply)({
    onAuthStateChangedCallback: ioRef.newIORef<Option<OnAuthStateChangedParam>>(option.none),
    getWindow: getGetWindow,
  });

export const mkClientEnv = mkClientEnvFromWindow(() => () => window);

const client: Client<MockClientEnv> = {
  storage: {
    uploadDataUrl: (env) => (param) =>
      pipe(
        param.dataUrl,
        either.fromPredicate(isValidDataUrl, () =>
          UploadDataUrlError.Union.of.InvalidDataUrlFormat({})
        ),
        ioEither.fromEither,
        ioEither.chainIOK((data) => setItem(env.getWindow, `${storageKey}/${param.key}`, data)),
        taskEither.fromIOEither
      ),
    getDownloadUrl: (env) => (param) =>
      pipe(
        getItem(env.getWindow, `${storageKey}/${param.key}`),
        io.map(either.fromOption(() => GetDownloadUrlError.Union.of.FileNotFound({}))),
        taskEither.fromIOEither
      ),
  },
  db: {
    upsertDoc: (env) => (param) =>
      pipe(
        getDb(env.getWindow),
        ioEither.map(
          flow(
            option.getOrElse(() => ({})),
            readonlyRecord.upsertAt(`${param.key.collection}/${param.key.id}`, param.data)
          )
        ),
        ioEither.chainIOK((data) => setObjectItem(env.getWindow, dbLocalStorageKey, data)),
        taskEither.fromIOEither
      ),
    getDoc: (env) => (param) =>
      pipe(
        getDb(env.getWindow),
        ioEither.map(
          option.chain(readonlyRecord.lookup(`${param.key.collection}/${param.key.id}`))
        ),
        taskEither.fromIOEither
      ),
  },
  auth: {
    signInWithGoogleRedirect: (env) =>
      pipe(
        apply.sequenceS(io.Apply)({
          origin: getLocationOrigin(env.getWindow),
          href: getLocationHref(env.getWindow),
        }),
        io.map(mkRedirectUrl),
        io.chain((url) => setLocationHref(env.getWindow, url)),
        taskEither.fromIO
      ),
    createUserAndSignInWithEmailAndPassword: (env) => (param) =>
      pipe(
        getItem(env.getWindow, authLocalStorageKey),
        ioOption.match(
          () => either.right(undefined),
          () =>
            either.left(CreateUserAndSignInWithEmailAndPasswordError.Union.of.EmailAlreadyInUse({}))
        ),
        ioEither.chainIOK(() =>
          pipe(
            env.onAuthStateChangedCallback.read,
            ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.some(param.email))),
            io.chain(() => setItem(env.getWindow, authLocalStorageKey, param.email))
          )
        ),
        taskEither.fromIOEither
      ),
    onAuthStateChanged: (env) => (onChangedCallback) =>
      pipe(
        getItem(env.getWindow, authLocalStorageKey),
        io.chain((lsAuth) => onChangedCallback(lsAuth)),
        io.chain(() => env.onAuthStateChangedCallback.write(option.some(onChangedCallback))),
        io.map(() => env.onAuthStateChangedCallback.write(option.none))
      ),
    signOut: (env) =>
      pipe(
        env.onAuthStateChangedCallback.read,
        ioOption.chainIOK((onChangedCallback) => onChangedCallback(option.none)),
        io.chain(() => removeItem(env.getWindow, authLocalStorageKey)),
        taskEither.fromIO
      ),
  },
};

export const stack: Stack<MockClientEnv> = {
  ci: {
    deployStorage: () => taskEither.of(undefined),
    deployDb: () => taskEither.of(undefined),
  },
  client,
};
