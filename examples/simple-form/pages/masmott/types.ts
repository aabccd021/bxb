import { CollectionSpec } from "masmott-server";

export type Dict<T> = {
  readonly [key: string]: T;
};

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

export type Doc<DD extends DocData = DocData> =
  | { readonly state: "fetching" }
  | {
      readonly state: "error";
      readonly reason: unknown;
      readonly revalidate: () => void;
    }
  | {
      readonly state: "loaded";
      readonly exists: true;
      readonly data: DD;
      readonly revalidate: () => void;
    }
  | {
      readonly state: "loaded";
      readonly exists: false;
      readonly revalidate: () => void;
    };

export type DocCreation_NotCreated<
  CDD extends DocCreationData = DocCreationData
> = {
  readonly state: "notCreated";
  readonly createDoc: (data: CDD) => void;
};

export type DocCreation<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
> =
  | { readonly state: "initial" }
  | DocCreation_NotCreated<CDD>
  | {
      readonly state: "error";
      readonly reason: unknown;
      readonly retry: () => void;
      readonly reset: () => void;
    }
  | {
      readonly state: "creating";
      readonly id: string;
      readonly data: DD;
    }
  | {
      readonly state: "created";
      readonly createdDoc: {
        readonly id: string;
        readonly data: DD;
      };
      readonly reset: () => void;
    };

export type MutateSetDoc = (
  key: DocKey,
  data?: DocSnapshot,
  shouldRevalidate?: boolean
) => Promise<void>;

export type DeleteView = (key: ViewKey) => void;

export type MutateUpdateView = (
  key: ViewKey,
  data?: Doc | ((doc: Doc) => Doc),
  shouldRevalidate?: boolean
) => Promise<void>;

export type UpdateCountViews = (p: {
  readonly updatedCollectionName: string;
  readonly spec: Dict<CollectionSpec>;
  readonly incrementValue: 1 | -1;
  readonly data: DocData;
}) => void;

export type UpdateView = (
  key: ViewKey,
  mutate: (data: DocData) => DocData
) => void;
