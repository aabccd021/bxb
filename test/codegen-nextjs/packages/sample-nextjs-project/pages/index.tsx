import { option } from 'fp-ts';
import { useEffect, useMemo, useState } from 'react';

import { pipe } from 'fp-ts/lib/function';
import { AuthState } from 'masmott';
import { masmott } from '../masmott';


const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>(option.none);
  useEffect(
    () => masmott.auth.onAuthStateChanged((newAuthState) => () => setAuthState(newAuthState))(),
    [setAuthState]
  );
  return authState;
};

const useHome = () => {
  const authState = useAuthState();
  const authStateStr = useMemo(() => pipe(authState, option.match(() => 'not signed in', (s) => `email : ${s.uid}`)), [authState]);
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
