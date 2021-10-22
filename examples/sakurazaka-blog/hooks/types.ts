export type Field = string | number;

export type DocKey = readonly [string, string];

export type ViewKey = readonly [string, string, string];

export type DocCreationData = {
  readonly [key: string]: Field;
};

export type DocData = {
  readonly [key: string]: Field;
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

export type DocCreation<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
> =
  | { readonly state: "initial" }
  | {
      readonly state: "notCreated";
      readonly createDoc: (data: CDD) => void;
    }
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
      readonly id: string;
      readonly data: DD;
      readonly reset: () => void;
    };
