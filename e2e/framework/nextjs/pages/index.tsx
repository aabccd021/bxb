/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */

import { option } from 'fp-ts';
import { Option } from 'fp-ts/Option';
import { useEffect, useMemo, useState } from 'react';

import { masmott } from '../masmott';

const mapToAuthStatus = option.match(
  () => 'not signed in',
  (s) => `email : ${s}`
);

const useAuthState = () => {
  const [authState, setAuthState] = useState<Option<string>>(option.none);
  useEffect(
    () => masmott.auth.onAuthStateChanged((newAuthState) => () => setAuthState(newAuthState))(),
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
      <button onClick={masmott.auth.signInGoogleWithRedirect}>Sign In With Redirect</button>
      <button onClick={masmott.auth.signOut}>Sign Out</button>
      <p id="auth-status">{authStateStr}</p>
    </div>
  );
}
