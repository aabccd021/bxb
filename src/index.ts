import { either, task as T, taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { behavior, expect, sequentially } from 'unit-test-ts';

import { CreateUserAndSignInError } from './a';

type ServerG = {
  readonly client: {
    readonly auth: {
      readonly signIn: {
        readonly method: unknown;
      };
    };
  };
};

type AuthClient<G extends ServerG> = {
  readonly signOut: T.Task<unknown>;
  readonly signIn: (
    mehod: G['client']['auth']['signIn']['method']
  ) => TE.TaskEither<CreateUserAndSignInError['Union'], unknown>;
};

export const provider: CreateUserAndSignInError['Provider'] = CreateUserAndSignInError.Provider({
  value: 'g',
});

type Client<G extends ServerG> = {
  readonly auth: AuthClient<G>;
};

type Server<G extends ServerG> = {
  readonly client: Client<G>;
};

type MkServer<G extends ServerG> = T.Task<Server<G>>;

type TestMeta<G extends ServerG> = {
  readonly usernameToSignInMethod: (username: string) => G['client']['auth']['signIn']['method'];
};

export const mkTests = <G extends ServerG>(mkServer: MkServer<G>, meta: TestMeta<G>) => [
  behavior(
    'Server auth is indenendent between tests, different tests can create the same user',
    sequentially([
      expect({
        task: pipe(
          mkServer,
          T.map((server) => server.client.auth),
          T.chainFirst((auth) => pipe('kira', meta.usernameToSignInMethod, auth.signIn)),
          T.chainFirst((auth) => auth.signOut),
          T.chain((auth) => pipe('kira', meta.usernameToSignInMethod, auth.signIn)),
          TE.mapLeft((error) => error.tag)
        ),
        resolvesTo: either.left('UserAlreadyExists' as const),
      }),
      expect({
        task: pipe(
          mkServer,
          T.chain((server) =>
            server.client.auth.createUserAndSignIn({
              method: 'email_and_password',
              email: 'kira@sakura.com',
              password: 'masmott',
            })
          ),
          T.map(either.isRight)
        ),
        resolvesTo: true,
      }),
    ])
  ),
];
