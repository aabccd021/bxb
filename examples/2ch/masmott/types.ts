import { Dict } from 'masmott-functions';
import { Cache } from 'swr';
import * as Doc from './doc';
import * as DocCreation from './doc-creation';

export { Doc, DocCreation };

export type Field = string | number;

export type DocKey<C extends string = string> = readonly [C, string];

export type ViewKey = readonly [string, string, string];

export type DocCreationData = {
  readonly [key: string]: Field;
};

export type DocData = {
  readonly [key: string]: Field;
};

export type DocSnapshot =
  | {
      readonly exists: true;
      readonly data: DocData;
    }
  | {
      readonly exists: false;
    };

export type CreateDoc<CDD extends DocCreationData = DocCreationData> = (data: CDD) => void;

export type Retry = () => void;

export type DocWithId<DD extends DocData = DocData> = {
  readonly id: string;
  readonly data: DD;
};

export type DocSnapshotMutatorCallback = (snapshot: DocSnapshot) => DocSnapshot;

export type MutateDoc = (
  key: DocKey,
  data?: DocSnapshot | DocSnapshotMutatorCallback,
  options?: {
    readonly view?: string | undefined;
  }
) => Promise<void>;

export type DocCache = Cache<DocSnapshot>;

export type DocSWRConfig = {
  readonly docCache: DocCache;
  readonly mutateDoc: MutateDoc;
};

export type UpdateCountViews = (data: DocData) => void;

export type ISRPageProps = {
  readonly fallback: Dict<DocSnapshot>;
};

export type ISRPage<DD extends DocData> = (props: {
  readonly snapshot?: { readonly id: string; readonly doc: Doc.Type<DD> };
}) => JSX.Element;

export type ViewPath = readonly [string] | readonly [string, string];
