// eslint-disable-next-line import/no-cycle
import { DocCreationData } from '.';

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

export type LoadedExists<DD extends DocCreationData = DocCreationData> = {
  readonly state: 'loaded';
  readonly exists: true;
  readonly data: DD;
  readonly revalidate: () => void;
};

export type Loaded<DD extends DocCreationData = DocCreationData> = LoadedExists<DD> | LoadedNotExists;

export type Type<DD extends DocCreationData = DocCreationData> =
  | Error
  | Fetching
  | LoadedNotExists
  | LoadedExists<DD>;
