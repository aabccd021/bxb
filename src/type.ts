import { summonFor, UM } from '@morphic-ts/batteries/es6/summoner-ESBST';
import type {} from '@morphic-ts/summoners/lib/tagged-union';
import { IO } from 'fp-ts/IO';
import { IOOption } from 'fp-ts/IOOption';
import { Option } from 'fp-ts/Option';
import { ReadonlyRecord } from 'fp-ts/ReadonlyRecord';
import { Task } from 'fp-ts/Task';
import { TaskEither } from 'fp-ts/TaskEither';
import { makeUnion, TypeOf } from 'make-union-morphic-ts';

const { summon } = summonFor({});

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

export type Unsubscribe = IO<void>;

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
  readonly format: 'base64';
};

export type DocKey = {
  readonly collection: string;
  readonly id: string;
};

export type DocData = ReadonlyRecord<string, unknown>;

export type CreateDocParam = {
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

export type Stack = {
  readonly deployStorage: (c: StorageDeployConfig) => Task<unknown>;
  readonly deployDb: (c: DbDeployConfig) => Task<unknown>;
  readonly clientStorageUpload: (p: UploadParam) => Task<unknown>;
  readonly clientStorageGetDownloadUrl: (
    p: GetDownloadUrlParam
  ) => TaskEither<GetDownloadUrlError['Union'], string>;
  readonly clientDbSetDoc: (p: CreateDocParam) => Task<unknown>;
  readonly clientDbGetDoc: (p: GetDocParam) => TaskEither<GetDocError['Union'], DocData>;
  readonly signInGoogleWithRedirect: IO<void>;
  readonly onAuthStateChanged: (callback: OnAuthStateChangedCallback) => IO<Unsubscribe>;
  readonly signOut: IO<void>;
};

export type MkStack = IO<Stack>;

export type FPLocalStorage = {
  readonly getItem: (key: string) => IOOption<string>;
  readonly removeItem: (key: string) => IO<void>;
};
