/* eslint-disable functional/no-return-void */
import { DocData } from '.';

export type Error = {
  readonly reason: unknown;
  readonly revalidate: () => void;
  readonly state: 'error';
};

export type Fetching = { readonly state: 'fetching' };

export type LoadedNotExists = {
  readonly exists: false;
  readonly revalidate: () => void;
  readonly state: 'loaded';
};

export type LoadedExists = {
  readonly data: DocData;
  readonly exists: true;
  readonly revalidate: () => void;
  readonly state: 'loaded';
};

export type Loaded = LoadedExists | LoadedNotExists;

export type Type = Error | Fetching | LoadedNotExists | LoadedExists;
