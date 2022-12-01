import { summonFor } from '@morphic-ts/batteries/lib/summoner-ESBST';
import type { AType } from '@morphic-ts/summoners/lib';
import type {} from '@morphic-ts/summoners/lib/tagged-union';
import type { IO } from 'fp-ts/IO';
import type { Option } from 'fp-ts/Option';
import type { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import type { TaskEither } from 'fp-ts/TaskEither';
import type { TypeOf } from 'make-union-morphic-ts';
import { makeUnion } from 'make-union-morphic-ts';

const { summon } = summonFor({});

export const ProviderError = summon((F) =>
  F.interface({ code: F.stringLiteral('ProviderError'), value: F.unknown() }, 'ProviderError')
);

export type ProviderError = AType<typeof ProviderError>;

export const CreateUserAndSignInWithEmailAndPasswordError = makeUnion(summon)('code')({
  EmailAlreadyInUse: summon((F) =>
    F.interface({ code: F.stringLiteral('EmailAlreadyInUse') }, 'EmailAlreadyInUse')
  ),
  ProviderError,
});

export type CreateUserAndSignInWithEmailAndPasswordError = TypeOf<
  typeof CreateUserAndSignInWithEmailAndPasswordError
>;

export const UploadDataUrlError = makeUnion(summon)('code')({
  InvalidDataUrlFormat: summon((F) =>
    F.interface({ code: F.stringLiteral('InvalidDataUrlFormat') }, 'InvalidDataUrlFormat')
  ),
  ProviderError,
});

export type UploadDataUrlError = TypeOf<typeof UploadDataUrlError>;

export const GetDownloadUrlError = makeUnion(summon)('code')({
  FileNotFound: summon((F) =>
    F.interface({ code: F.stringLiteral('FileNotFound') }, 'FileNotFound')
  ),
  ProviderError,
});

export type GetDownloadUrlError = TypeOf<typeof GetDownloadUrlError>;

export const GetDocError = makeUnion(summon)('code')({
  ProviderError,
});

export type GetDocError = TypeOf<typeof GetDocError>;

export const SignInWithGoogleRedirectError = makeUnion(summon)('code')({
  ProviderError,
});

export type SignInWithGoogleRedirectError = TypeOf<typeof SignInWithGoogleRedirectError>;

export const SignOutError = makeUnion(summon)('code')({
  ProviderError,
});

export type SignOutError = TypeOf<typeof SignOutError>;

export type StorageDeployConfig = {
  readonly securityRule?: {
    readonly type?: 'allowAll';
  };
};

export type DbSecurityRule = {

}

export type DbDeployConfig = {
  readonly securityRule?: {
    readonly type?: 'allowAll';
  };
};

export type UploadDataUrlParam = {
  readonly key: string;
  readonly dataUrl: string;
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

export type OnAuthStateChangedParam = (user: Option<string>) => IO<void>;

export type CreateUserAndSignInWithEmailAndPasswordParam = {
  readonly email: string;
  readonly password: string;
};

export type Unsubscribe = IO<void>;

export type ApplyClientEnvScope<ClientEnv, J extends Record<string, unknown>> = {
  readonly [JJ in keyof J]: (env: ClientEnv) => J[JJ];
};

export type ApplyClientEnv<ClientEnv, K extends Record<string, Record<string, unknown>>> = {
  readonly [KK in keyof K]: ApplyClientEnvScope<ClientEnv, K[KK]>;
};

export type NoEnvClient = {
  readonly auth: {
    readonly signInWithGoogleRedirect: TaskEither<SignInWithGoogleRedirectError['Union'], void>;
    readonly createUserAndSignInWithEmailAndPassword: (
      p: CreateUserAndSignInWithEmailAndPasswordParam
    ) => TaskEither<CreateUserAndSignInWithEmailAndPasswordError['Union'], void>;
    readonly onAuthStateChanged: (p: OnAuthStateChangedParam) => IO<Unsubscribe>;
    readonly signOut: TaskEither<SignOutError['Union'], void>;
  };
  readonly db: {
    readonly upsertDoc: (p: SetDocParam) => TaskEither<{ readonly code: string }, void>;
    readonly getDoc: (p: GetDocParam) => TaskEither<GetDocError['Union'], Option<DocData>>;
  };
  readonly storage: {
    readonly uploadDataUrl: (
      p: UploadDataUrlParam
    ) => TaskEither<UploadDataUrlError['Union'], void>;
    readonly getDownloadUrl: (
      p: GetDownloadUrlParam
    ) => TaskEither<GetDownloadUrlError['Union'], string>;
  };
};

export type Client<ClientEnv> = ApplyClientEnv<ClientEnv, NoEnvClient>;

export type CI = {
  readonly deployStorage: (
    c: StorageDeployConfig
  ) => TaskEither<{ readonly code: string }, unknown>;
  readonly deployDb: (c: DbDeployConfig) => TaskEither<{ readonly code: string }, unknown>;
};

export type Stack<ClientEnv> = {
  readonly ci: CI;
  readonly client: Client<ClientEnv>;
};

export type NoEnvStack = {
  readonly ci: CI;
  readonly client: NoEnvClient;
};
