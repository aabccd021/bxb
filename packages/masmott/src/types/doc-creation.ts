// eslint-disable-next-line import/no-cycle
import { CreateDoc, DocCreationData, DocCreationWithId } from '.';

export type Created<DCD extends DocCreationData = DocCreationData> = {
  readonly state: 'created';
  readonly createdDoc: DocCreationWithId<DCD>;
  readonly reset: () => void;
};

export type Creating<DCD extends DocCreationData = DocCreationData> = {
  readonly state: 'creating';
  readonly createdDoc: DocCreationWithId<DCD>;
};

export type Error = {
  readonly state: 'error';
  readonly reason: unknown;
  readonly retry: () => void;
  readonly reset: () => void;
};

export type Initial = { readonly state: 'initial' };

export type NotCreated<CDD extends DocCreationData = DocCreationData> = {
  readonly state: 'notCreated';
  readonly createDoc: CreateDoc<CDD>;
};

export type Type<DCD extends DocCreationData = DocCreationData> =
  | Initial
  | NotCreated<DCD>
  | Error
  | Creating<DCD>
  | Created<DCD>;
