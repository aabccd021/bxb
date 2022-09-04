import { option, task } from 'fp-ts';

export type FileSnapshot = {
  readonly id: string;
  readonly blob: Blob;
};

export type TableDBTriggers = unknown;

export type DocKey = {
  readonly table: string;
  readonly id: string;
};

export type DocData = Record<string, unknown>;

export type DocSnapshot = {
  readonly key: DocKey;
  readonly data: DocData;
};

export type StorageAdmin = {
  readonly upload: (p: FileSnapshot) => task.Task<unknown>;
  readonly download: (id: string) => task.Task<option.Option<Blob>>;
};

export type ReadonlyStorageAdmin = Pick<StorageAdmin, 'download'>;

export type WriteonlyStorageAdmin = Omit<StorageAdmin, keyof ReadonlyStorageAdmin>;

export type StorageTriggers = {
  readonly onUploaded?: (id: string) => task.Task<unknown>;
};

export type StorageClient = {
  readonly upload: (p: FileSnapshot) => task.Task<unknown>;
  readonly download: (id: string) => task.Task<option.Option<Blob>>;
};

export type DBClient = {
  readonly setDoc: (snapshot: DocSnapshot) => task.Task<unknown>;
  readonly getDoc: (key: DocKey) => task.Task<option.Option<DocData>>;
};

export type TableDBAdmin = {
  readonly setDoc: (snapshot: DocSnapshot) => task.Task<unknown>;
  readonly getDoc: (key: DocKey) => task.Task<option.Option<DocData>>;
};

export type Client = {
  readonly storage: StorageClient;
  readonly db: DBClient;
};

export type Config = {
  readonly storage?: (storage: ReadonlyStorageAdmin) => StorageTriggers;
  readonly db?: (storage: TableDBAdmin) => TableDBTriggers;
};

export type MakeClient = (config: Config) => task.Task<Client>;

export type Storage = {
  readonly upload: (p: FileSnapshot) => task.Task<unknown>;
  readonly download: (id: string) => task.Task<option.Option<Blob>>;
};
