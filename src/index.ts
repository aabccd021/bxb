import * as IO from 'fp-ts/IO';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import * as t from 'io-ts';

const BlobFromUnknown = new t.Type<Blob, unknown, unknown>(
  'BlobFromUnknown',
  (u): u is Blob => u instanceof Blob,
  (u, c) => (u instanceof Blob ? t.success(u) : t.failure(u, c)),
  (a) => a
);

export const FileSnapshot = t.type({
  id: t.string,
  blob: BlobFromUnknown,
});

export type FileSnapshot = t.TypeOf<typeof FileSnapshot>;

export type TableDBTriggers = unknown;

export const DocKey = t.type({
  table: t.string,
  id: t.string,
});

export type DocKey = t.TypeOf<typeof DocKey>;

export const DocData = t.UnknownRecord;

export type DocData = t.TypeOf<typeof DocData>;

export const DocSnapshot = t.type({
  key: DocKey,
  data: DocData,
});

export type DocSnapshot = t.TypeOf<typeof DocSnapshot>;

export type StorageAdmin = {
  readonly upload: (p: FileSnapshot) => T.Task<unknown>;
  readonly download: (id: string) => T.Task<O.Option<Blob>>;
};

export type ReadonlyStorageAdmin = Pick<StorageAdmin, 'download'>;

export type WriteonlyStorageAdmin = Omit<StorageAdmin, keyof ReadonlyStorageAdmin>;

export type StorageTriggers = {
  readonly onUploaded?: (id: string) => T.Task<unknown>;
};

export type StorageClient = {
  readonly upload: (p: FileSnapshot) => T.Task<unknown>;
  readonly download: (id: string) => T.Task<O.Option<Blob>>;
};

export type DBClient = {
  readonly setDoc: (snapshot: DocSnapshot) => T.Task<unknown>;
  readonly getDoc: (key: DocKey) => T.Task<O.Option<DocData>>;
};

export type TableDBAdmin = {
  readonly setDoc: (snapshot: DocSnapshot) => T.Task<unknown>;
  readonly getDoc: (key: DocKey) => T.Task<O.Option<DocData>>;
};

export type Client = {
  readonly storage: StorageClient;
  readonly db: DBClient;
};

export type MakeTriggers = {
  readonly storage?: (storage: ReadonlyStorageAdmin) => StorageTriggers;
  readonly db?: (storage: TableDBAdmin) => TableDBTriggers;
};

export type MakeClientWithTrigger = (makeTriggers: MakeTriggers) => IO.IO<Client>;

export type Storage = {
  readonly upload: (p: FileSnapshot) => T.Task<unknown>;
  readonly download: (id: string) => T.Task<O.Option<Blob>>;
};
