import { summonFor } from '@morphic-ts/batteries/es6/summoner-ESBST';
import type {} from '@morphic-ts/summoners/lib/tagged-union';
import { Task } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';
import { makeUnion, TypeOf } from 'make-union-morphic-ts';

const { summon } = summonFor({});

export const GetDownloadUrlError = makeUnion(summon)('code')({
  NotFound: summon((F) => F.interface({ code: F.stringLiteral('NotFound') }, 'NotFound')),
  Unknown: summon((F) =>
    F.interface({ code: F.stringLiteral('Unknown'), value: F.unknown() }, 'Unknown')
  ),
});

export type GetDownloadUrlError = TypeOf<typeof GetDownloadUrlError>;

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
    readonly deploy: (c: DeployConfig) => Task<unknown>;
  };
  readonly client: {
    readonly storage: {
      readonly upload: (p: UploadParam) => Task<unknown>;
      readonly getDownloadUrl: (
        p: GetDownloadUrlParam
      ) => TaskEither<GetDownloadUrlError['Union'], string>;
    };
  };
};

export type MkStack = Task<Stack>;
