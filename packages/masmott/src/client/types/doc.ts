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

export type LoadedExists<DD extends DocData> = {
  readonly data: DD;
  readonly exists: true;
  readonly revalidate: () => void;
  readonly state: 'loaded';
};

export type Loaded<DD extends DocData> = LoadedExists<DD> | LoadedNotExists;

export type Type<DD extends DocData = DocData> =
  | Error
  | Fetching
  | LoadedNotExists
  | LoadedExists<DD>;
