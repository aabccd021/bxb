import type {} from '@morphic-ts/summoners/lib/tagged-union';
import type { IO } from 'fp-ts/IO';
import type { Option } from 'fp-ts/Option';
import type { TaskEither } from 'fp-ts/TaskEither';

import type * as DeployDb from './ci/deployDb';
import type * as GetDoc from './client/getDoc';
import type * as UpsertDoc from './client/upsertDoc';

export { DeployDb, GetDoc, UpsertDoc };

export type ProviderError = {
  readonly code: 'ProviderError';
  readonly value: unknown;
};

export type CreateUserAndSignInWithEmailAndPasswordError =
  | ProviderError
  | { readonly code: 'EmailAlreadyInUse' };

export type UploadDataUrlError = ProviderError | { readonly code: 'InvalidDataUrlFormat' };

export type GetDownloadUrlError = ProviderError | { readonly code: 'FileNotFound' };

export type SignInWithGoogleRedirectError = ProviderError;

export type SignOutError = ProviderError;

export type StorageDeployConfig = {
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

export type DocData = Record<string, unknown>;

export type GetDownloadUrlParam = {
  readonly key: string;
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
    readonly signInWithGoogleRedirect: TaskEither<SignInWithGoogleRedirectError, void>;
    readonly createUserAndSignInWithEmailAndPassword: (
      p: CreateUserAndSignInWithEmailAndPasswordParam
    ) => TaskEither<CreateUserAndSignInWithEmailAndPasswordError, void>;
    readonly onAuthStateChanged: (p: OnAuthStateChangedParam) => IO<Unsubscribe>;
    readonly signOut: TaskEither<SignOutError, void>;
  };
  readonly db: {
    readonly upsertDoc: UpsertDoc.Fn;
    readonly getDoc: GetDoc.Fn;
  };
  readonly storage: {
    readonly uploadDataUrl: (p: UploadDataUrlParam) => TaskEither<UploadDataUrlError, void>;
    readonly getDownloadUrl: (p: GetDownloadUrlParam) => TaskEither<GetDownloadUrlError, string>;
  };
};

export type Client<ClientEnv> = ApplyClientEnv<ClientEnv, NoEnvClient>;

export type NoEnvCI = {
  readonly deployStorage: (
    c: StorageDeployConfig
  ) => TaskEither<{ readonly code: string }, unknown>;
  readonly deployDb: DeployDb.Fn;
};

export type CI<ClientEnv> = ApplyClientEnvScope<ClientEnv, NoEnvCI>;

export type Stack<ClientEnv> = {
  readonly ci: CI<ClientEnv>;
  readonly client: Client<ClientEnv>;
};

export type NoEnvStack = {
  readonly ci: NoEnvCI;
  readonly client: NoEnvClient;
};
