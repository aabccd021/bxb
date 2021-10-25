import { DocData } from './types';

export type Error = {
  readonly state: 'error';
  readonly reason: unknown;
  readonly revalidate: () => void;
};

export type Fetching = { readonly state: 'fetching' };

export type LoadedNotExists = {
  readonly state: 'loaded';
  readonly exists: false;
  readonly revalidate: () => void;
};

export type LoadedExists<DD extends DocData = DocData> = {
  readonly state: 'loaded';
  readonly exists: true;
  readonly data: DD;
  readonly revalidate: () => void;
};

export type Type<DD extends DocData = DocData> =
  | Error
  | Fetching
  | LoadedNotExists
  | LoadedExists<DD>;
