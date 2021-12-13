import { Dict } from '@src/core/type';
import * as t from 'io-ts';

export const GenerateCmdArgs = t.tuple([t.literal('generate')]);
export type GenerateCmdArgs = t.TypeOf<typeof GenerateCmdArgs>;

export type WriteFileDict = Dict<string | WriteFileDict>;

export type WriteFileAction = {
  readonly content: string;
  readonly dir: string;
  readonly name: string;
};
