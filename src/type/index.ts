import type {} from '@morphic-ts/summoners/lib/tagged-union';
import type { TaskEither } from 'fp-ts/TaskEither';

import type * as stack from './stack';

export { stack as StackType };

export type ProviderError = {
  readonly code: 'ProviderError';
  readonly value: unknown;
};

export type UploadDataUrlError = ProviderError | { readonly code: 'InvalidDataUrlFormat' };

export type GetDownloadUrlError = ProviderError | { readonly code: 'FileNotFound' };

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

export type ApplyClientEnvScope<ClientEnv, J extends Record<string, unknown>> = {
  readonly [JJ in keyof J]: (env: ClientEnv) => J[JJ];
};

export type ApplyClientEnv<ClientEnv, K extends Record<string, Record<string, unknown>>> = {
  readonly [KK in keyof K]: ApplyClientEnvScope<ClientEnv, K[KK]>;
};

export type NoEnvClient = {
  readonly auth: stack.client.auth.Scope;
  readonly db: {
    readonly upsertDoc: stack.client.db.UpsertDoc.Fn;
    readonly getDoc: stack.client.db.GetDoc.Fn;
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
  readonly deployDb: stack.ci.DeployDb.Fn;
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
