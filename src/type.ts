import { Task } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';

export type GetDownloadUrlError =
  | {
      readonly code: 'not-found';
    }
  | {
      readonly code: 'unknown';
      readonly value: unknown;
    };

export type DeployConfig = {
  readonly storage?: {
    readonly securityRule?: {
      readonly type?: 'allowAll';
    };
  };
};

export type UploadParam = {
  readonly key: string;
  readonly file: string;
  readonly format: 'base64';
};

export type GetDownloadUrlParam = {
  readonly key: string;
};

export type Stack = {
  readonly admin: {
    readonly deploy: (c: DeployConfig) => Task<void>;
  };
  readonly client: {
    readonly storage: {
      readonly upload: (p: UploadParam) => Task<void>;
      readonly getDownloadUrl: (p: GetDownloadUrlParam) => TaskEither<GetDownloadUrlError, string>;
    };
  };
};

export type MkStack = Task<Stack>;
