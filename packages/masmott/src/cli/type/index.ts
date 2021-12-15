import { Dict } from '@core/type';
import { Either } from 'fp-ts/Either';
import * as t from 'io-ts';

export const GenerateCmdArgs = t.tuple([t.literal('generate')]);
export type GenerateCmdArgs = t.TypeOf<typeof GenerateCmdArgs>;

// eslint-disable-next-line no-use-before-define
export type WriteFileDict = Dict<WriteFileEntry>;

export type EitherWriteFileEntry = {
  readonly _type: 'either';
  readonly content: Either<unknown, string>;
};

export type StringWriteFileEntry = {
  readonly _type: 'string';
  readonly content: string;
};

export type NestedWriteFileEntry = {
  readonly _type: 'nested';
  readonly content: WriteFileDict;
};

export type WriteFileEntry =
  | StringWriteFileEntry
  | EitherWriteFileEntry
  | NestedWriteFileEntry;

export type LogErrorAction = {
  readonly _type: 'logError';
  readonly errorDetail: unknown;
};

export type WriteFileAction = {
  readonly _type: 'writeFile';
  readonly content: string;
  readonly dir: string;
  readonly name: string;
};

export type GenerateCmdAction = WriteFileAction | LogErrorAction;
