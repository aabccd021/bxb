import { either, task, taskEither, taskOption } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { expect } from 'unit-test-ts';

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
  readonly upload: () => task.Task<unknown>;
  readonly download: (id: string) => taskOption.TaskOption<Blob>;
};

export type ReadonlyStorageAdmin = Pick<StorageAdmin, 'download'>;

export type WriteonlyStorageAdmin = Omit<StorageAdmin, keyof ReadonlyStorageAdmin>;

export type StorageTriggers = {
  readonly onUploaded?: (id: string) => task.Task<unknown>;
};

export type StorageClientUpload = (p: {
  readonly key: string;
  readonly value: ArrayBuffer;
}) => task.Task<unknown>;

export type ProviderGetDownloadUrlError = {
  readonly type: 'provider';
  readonly value: unknown;
};

export type ObjectDoesNotExistsGetDownloadUrlError = {
  readonly type: 'object_does_not_exists';
};

export type GetDownloadUrlError =
  | ObjectDoesNotExistsGetDownloadUrlError
  | ProviderGetDownloadUrlError;

export type StorageClient = {
  readonly getDownloadURL: (p: { readonly key: string }) => taskEither.TaskEither<unknown, string>;
  readonly upload: StorageClientUpload;
};

export type DBClient = {
  readonly setDoc: (snapshot: DocSnapshot) => task.Task<unknown>;
  readonly getDoc: (key: DocKey) => taskOption.TaskOption<DocData>;
};

export type TableDBAdmin = {
  readonly setDoc: (snapshot: DocSnapshot) => task.Task<unknown>;
  readonly getDoc: (key: DocKey) => taskOption.TaskOption<DocData>;
};

export type Config = {
  readonly storage?: (storage: ReadonlyStorageAdmin) => StorageTriggers;
  readonly db?: (storage: TableDBAdmin) => TableDBTriggers;
};

export type Storage = {
  readonly upload: () => task.Task<unknown>;
  readonly download: (id: string) => taskOption.TaskOption<unknown>;
};

export type SignInP = {
  readonly type: 'email_and_password';
  readonly email: string;
  readonly password: string;
};

export type CreateAndSignInP = {
  readonly type: 'email_and_password';
  readonly email: string;
  readonly password: string;
};

export type ProviderCreateUserAndSignInError = {
  readonly type: 'provider';
  readonly value: unknown;
};

export type UserAlreadyExistsCreateUserAndSignInError = {
  readonly type: 'user_already_exists';
};

export type CreateUserAndSignInError =
  | UserAlreadyExistsCreateUserAndSignInError
  | ProviderCreateUserAndSignInError;

export type ProviderSignInError = {
  readonly type: 'provider';
  readonly value: unknown;
};

export type UserDoesNotExistSignInError = {
  readonly type: 'user_does_not_exist';
};

export type SignInError = UserDoesNotExistSignInError | ProviderSignInError;

export type AuthClient = {
  readonly signIn: (p: SignInP) => taskEither.TaskEither<SignInError, unknown>;
  readonly signOut: task.Task<unknown>;
  readonly createUserAndSignIn: (
    p: CreateAndSignInP
  ) => taskEither.TaskEither<CreateUserAndSignInError, unknown>;
};

export type Client = {
  readonly storage: StorageClient;
  readonly auth: AuthClient;
};

export type Server = {
  readonly client: Client;
};

export type MkServer = task.Task<Server>;

export const serial = <T>(t: readonly T[]) => t;

export const mkTests = (mkServer: MkServer) => ({
  'auth users is independent between tests': {
    'can create user with same email on different tests': [
      expect({
        task: pipe(
          task.Do,
          task.bind('server', (_) => mkServer),
          task.chainFirst(({ server }) =>
            server.client.auth.createUserAndSignIn({
              type: 'email_and_password',
              email: 'kira@sakura.com',
              password: 'masmott',
            })
          ),
          task.chainFirst(({ server }) => server.client.auth.signOut),
          task.chain(({ server }) =>
            server.client.auth.createUserAndSignIn({
              type: 'email_and_password',
              email: 'kira@sakura.com',
              password: 'masmott',
            })
          ),
          taskEither.mapLeft((error) => error.type)
        ),
        toEqual: either.left('user_already_exists' as const),
      }),
      expect({
        task: pipe(
          task.Do,
          task.bind('server', (_) => mkServer),
          task.chain(({ server }) =>
            server.client.auth.createUserAndSignIn({
              type: 'email_and_password',
              email: 'kira@sakura.com',
              password: 'masmott',
            })
          ),
          task.map(either.isRight)
        ),
        toEqual: true,
      }),
    ],
    'can not signIn with account created on another test': [
      expect({
        task: pipe(
          task.Do,
          task.bind('server', (_) => mkServer),
          task.chainFirst(({ server }) =>
            server.client.auth.createUserAndSignIn({
              type: 'email_and_password',
              email: 'nazuna@yofukashi.com',
              password: 'nanaxa',
            })
          ),
          task.chainFirst(({ server }) => server.client.auth.signOut),
          task.chain(({ server }) =>
            server.client.auth.signIn({
              type: 'email_and_password',
              email: 'kira@sakura.com',
              password: 'masmott',
            })
          ),
          task.map(either.isRight)
        ),
        toEqual: true,
      }),
      expect({
        task: pipe(
          task.Do,
          task.bind('server', (_) => mkServer),
          task.chain(({ server }) =>
            server.client.auth.signIn({
              type: 'email_and_password',
              email: 'kira@sakura.com',
              password: 'masmott',
            })
          ),
          taskEither.mapLeft((error) => error.type)
        ),
        toEqual: either.left('user_does_not_exist' as const),
      }),
    ],
  },
  'storage is independent between tests': [
    expect({
      task: pipe(
        task.Do,
        task.bind('server', (_) => mkServer),
        task.chainFirst(({ server }) =>
          server.client.storage.upload({ key: 'kira', value: new ArrayBuffer(46) })
        ),
        task.chain(({ server }) => server.client.storage.getDownloadURL({ key: 'kira' })),
        task.map(either.isRight)
      ),
      toEqual: true,
    }),
    expect({
      task: pipe(
        task.Do,
        task.bind('server', (_) => mkServer),
        task.chain(({ server }) => server.client.storage.getDownloadURL({ key: 'kira' })),
        task.map(either.isLeft)
      ),
      toEqual: true,
    }),
  ],
});
