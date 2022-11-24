/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */

import { option, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { Option } from 'fp-ts/Option';
import { useEffect, useMemo, useState } from 'react';

import { getDownloadUrl } from '../getDownloadUrl';
import { masmott } from '../masmott';

export const res = pipe(
  getDownloadUrl({ key: 'a' }),
  taskEither.map((a) => a.providerContext),
  taskEither.map(option.map((a) => (a.provider === 'foo' ? a.context.bar : a.context.aab)))
);

const mapToAuthStatus = option.match(
  () => 'not signed in',
  (s) => `email : ${s}`
);

const useAuthState = () => {
  const [authState, setAuthState] = useState<Option<string>>(option.none);
  useEffect(
    () =>
      masmott.auth.onAuthStateChanged({
        callback: (newAuthState) => () => setAuthState(newAuthState),
      })(),
    [setAuthState]
  );
  return authState;
};

const useHome = () => {
  const authState = useAuthState();
  const authStateStr = useMemo(() => mapToAuthStatus(authState), [authState]);
  return {
    authStateStr,
  };
};

export default function Home() {
  const { authStateStr } = useHome();
  return (
    <div>
      <button onClick={masmott.auth.signInWithGoogleRedirect}>Sign In With Redirect</button>
      <button onClick={masmott.auth.signOut}>Sign Out</button>
      <p id="auth-status">{authStateStr}</p>
    </div>
  );
}
