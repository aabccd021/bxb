import { Dict } from ".";
import * as Doc from "./doc";
import * as DocCreation from "./doc-creation";

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

export type CreateDoc<CDD extends DocCreationData = DocCreationData> = (
  data: CDD
) => void;

export type Retry = () => void;

export type DocWithId<DD extends DocData = DocData> = {
  readonly id: string;
  readonly data: DD;
};

export type MutateSetDoc = (
  key: DocKey,
  data?: DocSnapshot,
  shouldRevalidate?: boolean
) => Promise<void>;

export type DeleteView = (key: ViewKey) => void;

export type MutateUpdateView = (
  key: ViewKey,
  data?: Doc.Type | ((doc: Doc.Type) => Doc.Type),
  shouldRevalidate?: boolean
) => Promise<void>;

export type UpdateCountViews = (data: DocData) => void;

export type ViewUpdate = (data: DocData) => DocData;

export type UpdateView = (key: ViewKey, mutate: ViewUpdate) => void;

export type ISRPageProps = {
  readonly fallback: Dict<DocSnapshot>;
};

export type ViewPath = readonly [string] | readonly [string, string];
