import { summonFor, UM } from '@morphic-ts/batteries/lib/summoner-ESBST';
import { AType } from '@morphic-ts/summoners/lib';
import type {} from '@morphic-ts/summoners/lib/tagged-union';
import { IO } from 'fp-ts/IO';
import { Option } from 'fp-ts/Option';
import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import { Task } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';
import { makeUnion, TypeOf } from 'make-union-morphic-ts';

const { summon } = summonFor({});

export const DB = summon((F) => F.strMap(F.strMap(F.unknown())));

export type DB = AType<typeof DB>;

export type Condition =
  | {
      readonly type: 'and' | 'or';
      readonly left: Condition;
      readonly right: Condition;
    }
  | { readonly type: 'true' }
  | { readonly type: 'false' };

export const Condition: UM<{}, Condition> = summon((F) =>
  F.recursive(
    (GTree) =>
      F.taggedUnion(
        'type',
        {
          and: F.interface({ type: F.stringLiteral('and'), left: GTree, right: GTree }, 'and'),
          or: F.interface({ type: F.stringLiteral('or'), left: GTree, right: GTree }, 'or'),
          tre: F.interface({ type: F.stringLiteral('true') }, 'true'),
          false: F.interface({ type: F.stringLiteral('false') }, 'false'),
        },
        'Condition'
      ),
    'ConditionRec'
  )
);

export const UploadDataUrlError = makeUnion(summon)('code')({
  InvalidDataUrlFormat: summon((F) =>
    F.interface({ code: F.stringLiteral('InvalidDataUrlFormat') }, 'InvalidDataUrlFormat')
  ),
  Unknown: summon((F) =>
    F.interface({ code: F.stringLiteral('Unknown'), value: F.unknown() }, 'Unknown')
  ),
});

export type UploadDataUrlError = TypeOf<typeof UploadDataUrlError>;

export const GetDownloadUrlError = makeUnion(summon)('code')({
  FileNotFound: summon((F) =>
    F.interface({ code: F.stringLiteral('FileNotFound') }, 'FileNotFound')
  ),
  Unknown: summon((F) =>
    F.interface({ code: F.stringLiteral('Unknown'), value: F.unknown() }, 'Unknown')
  ),
});

export type GetDownloadUrlError = TypeOf<typeof GetDownloadUrlError>;

export const GetDocError = makeUnion(summon)('code')({
  DocNotFound: summon((F) => F.interface({ code: F.stringLiteral('DocNotFound') }, 'DocNotFound')),
  Unknown: summon((F) =>
    F.interface({ code: F.stringLiteral('Unknown'), value: F.unknown() }, 'Unknown')
  ),
});

export type GetDocError = TypeOf<typeof GetDocError>;

export type StorageDeployConfig = {
  readonly securityRule?: {
    readonly type?: 'allowAll';
  };
};

export type DbDeployConfig = {
  readonly securityRule?: {
    readonly type?: 'allowAll';
  };
};

export type UploadParam = {
  readonly key: string;
  readonly file: string;
};

export type DocKey = {
  readonly collection: string;
  readonly id: string;
};

export type DocData = ReadonlyRecord<string, unknown>;

export type SetDocParam = {
  readonly key: DocKey;
  readonly data: DocData;
};

export type GetDownloadUrlParam = {
  readonly key: string;
};

export type GetDocParam = {
  readonly key: DocKey;
};

export type OnAuthStateChangedCallback = (user: Option<string>) => IO<void>;

export type OnAuthStateChangedParam = {
  readonly callback: OnAuthStateChangedCallback;
};

export type Window = typeof window;

export type BrowserEnv = { readonly window: IO<Window> };

export type Env<T> = {
  readonly browser: BrowserEnv;
  readonly client: T;
};

export type CreateUserAndSignInWithEmailAndPasswordParam = {
  readonly email: string;
  readonly password: string;
};

export type Unsubscribe = IO<void>;

export type ClientScope<T, K extends Record<string, unknown>> = {
  readonly [KK in keyof K]: (env: Env<T>) => K[KK];
};

export type ClientT<T, K extends Record<string, Record<string, unknown>>> = {
  readonly [KK in keyof K]: ClientScope<T, K[KK]>;
};

export type BaseTE = TaskEither<{ readonly code: string }, unknown>;

export type ProviderError = { readonly code: 'ProviderError' };

export type Client<T> = ClientT<
  T,
  {
    readonly auth: {
      readonly signInWithGoogleRedirect: IO<unknown>;
      readonly createUserAndSignInWithEmailAndPassword: (
        p: CreateUserAndSignInWithEmailAndPasswordParam
      ) => IO<unknown>;
      readonly onAuthStateChanged: (p: OnAuthStateChangedParam) => IO<Unsubscribe>;
      readonly signOut: IO<unknown>;
    };
    readonly db: {
      readonly setDoc: (p: SetDocParam) => TaskEither<{ readonly code: string }, unknown>;
      readonly getDoc: (p: GetDocParam) => TaskEither<{ readonly code: string }, unknown>;
    };
    readonly storage: {
      readonly uploadDataUrl: (p: UploadParam) => BaseTE;
      readonly getDownloadUrl: (
        p: GetDownloadUrlParam
      ) => TaskEither<
        GetDownloadUrlError['Union'] | { readonly code: 'ProviderError'; readonly value: unknown },
        { readonly value: string; readonly context?: { readonly provider: string } }
      >;
    };
  }
>;

export type Stack<T> = {
  readonly ci: {
    readonly deployStorage: (c: StorageDeployConfig) => Task<unknown>;
    readonly deployDb: (c: DbDeployConfig) => Task<unknown>;
  };
  readonly client: Client<T>;
};

export type MkStack<ClientEnv> = IO<Stack<ClientEnv>>;
