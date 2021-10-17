export type Field = string | number;

export type DocKey = [string, string];

export type ViewKey = [string, string, string];

export type DocCreationData = {
  [key: string]: Field;
};

export type DocData = {
  [key: string]: Field;
};

export type Doc<DD extends DocData = DocData> =
  | { state: 'fetching' }
  | {
      state: 'error';
      reason: unknown;
      revalidate: () => void;
    }
  | {
      state: 'loaded';
      exists: true;
      data: DD;
      revalidate: () => void;
    }
  | {
      state: 'loaded';
      exists: false;
      revalidate: () => void;
    };

export type DocCreation<
  DD extends DocData = DocData,
  CDD extends DocCreationData = DocCreationData
> =
  | { state: 'initial' }
  | {
      state: 'notCreated';
      createDoc: (data: CDD) => void;
    }
  | {
      state: 'error';
      reason: unknown;
      retry: () => void;
      reset: () => void;
    }
  | {
      state: 'creating';
      id: string;
      data: DD;
    }
  | {
      state: 'created';
      id: string;
      data: DD;
      reset: () => void;
    };
