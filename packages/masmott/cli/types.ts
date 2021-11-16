import { Dict } from '../src/types';

export type WriteFileDict = Dict<string | WriteFileDict>;

export type WriteFileAction = {
  readonly dir: string;
  readonly name: string;
  readonly content: string;
};
