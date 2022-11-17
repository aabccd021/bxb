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

const useHome = () => {
  const [authStatus, setAuth] = useState<Option<string>>(option.none);
  useEffect(() => masmott.onAuthStateChanged((a) => () => setAuth(a))(), [setAuth]);
  const authStatusStr = useMemo(() => mapToAuthStatus(authStatus), [authStatus]);
  return {
    signInWithRedirect: masmott.signInGoogleWithRedirect,
    signOut: masmott.signOut,
    authStatusStr,
  };
};

export default function Home() {
  const { signInWithRedirect, signOut, authStatusStr } = useHome();
  return (
    <div>
      <button onClick={signInWithRedirect}>Sign In With Redirect</button>;
      <button onClick={signOut}>Sign Out</button>;<p id="auth-status">{authStatusStr}</p>
    </div>
  );
}
