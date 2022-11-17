/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */

import { useEffect, useState } from 'react';

import { masmott } from '../masmott';

export default function Home() {
  const [auth, setAuth] = useState<string>();
  useEffect(() => masmott.onAuthStateChanged((a) => setAuth(a)), []);
  return (
    <div>
      <button onClick={() => masmott.signInWithRedirect()}>Sign In With Redirect</button>;
      <button onClick={() => masmott.signOut()}>Sign Out</button>;
      <p id="auth-status">{auth !== undefined ? `email : ${auth}` : 'not signed in'}</p>
    </div>
  );
}
