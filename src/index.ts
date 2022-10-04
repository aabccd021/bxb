import { ConstructorWithExtra, Impl, impl, Variant } from '@practical-fp/union-types';
import { either, task as T, taskEither as TE } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { behavior, expect, sequentially } from 'unit-test-ts';

const CreateUserAndSignIn = {
  Error: impl<
    | Variant<'Provider', { readonly value: string }>
    | Variant<'UserAlreadyExists', { readonly wahaha: string }>
  >(),
  Method: impl<
    | Variant<'EmailAndPassword', { readonly email: string; readonly password: string }>
    | Variant<'Google'>
  >(),
};

type TypeOf<A> = A extends Record<string, ConstructorWithExtra<string, unknown>>
  ? { readonly [Z in keyof A]: TypeOf<A[Z]> }
  : A extends ConstructorWithExtra<string, infer P>
  ? P
  : A extends Impl<infer P>
  ? P
  : never;

type CreateUserAndSignInError = TypeOf<typeof CreateUserAndSignIn.Error>;

type Prov = CreateUserAndSignInError['Provider'];

type AuthClient = {
  readonly signOut: T.Task<unknown>;
  readonly createUserAndSignIn: (
    mehod: TypeOf<typeof CreateUserAndSignIn.Method>
  ) => TE.TaskEither<TypeOf<typeof CreateUserAndSignIn.Error>, unknown>;
};

type Client = {
  readonly auth: AuthClient;
};

type Server = {
  readonly client: Client;
};

type MkServer = T.Task<Server>;

export const mkTests = (mkServer: MkServer) => [
  behavior(
    'Server auth is indenendent between tests, different tests can create the same user',
    sequentially([
      expect({
        task: pipe(
          mkServer,
          T.map((server) => server.client.auth),
          T.chainFirst((auth) =>
            auth.createUserAndSignIn(
              CreateUserAndSignIn.Method.EmailAndPassword({
                email: 'a',
                password: 'k',
              })
            )
          ),
          T.chainFirst((auth) => auth.signOut),
          T.chain((auth) =>
            auth.createUserAndSignIn({
              method: 'email_and_password',
              email: 'kira@sakura.com',
              password: 'masmott',
            })
          ),
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
