import { Task } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';

type GetDownloadUrlError = {
  readonly code: 'not-found';
};

type DeployConfig = {
  readonly storage?: {
    readonly securityRule?: {
      readonly type?: 'allowAll';
    };
  };
};

type Stack = {
  readonly admin: {
    readonly deploy: (c: DeployConfig) => Task<void>;
  };
  readonly client: {
    readonly storage: {
      readonly upload: (p: {
        readonly key: string;
        readonly file: string;
        readonly format: 'base64';
      }) => Task<void>;
      readonly getDownloadUrl: (key: string) => TaskEither<GetDownloadUrlError, string>;
    };
  };
};

export type MkStack = Task<Stack>;
