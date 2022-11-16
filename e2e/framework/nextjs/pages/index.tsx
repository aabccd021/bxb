/* eslint-disable functional/no-return-void */

import { useEffect, useState } from 'react';

import { masmott } from '../masmott';

export default function Home() {
  const [auth, setAuth] = useState<string>();
  useEffect(() => masmott.onAuthStateChanged((a) => setAuth(a)), []);
  return (
    <div>
      <button onClick={() => masmott.signIn()}>Sign In</button>;
      <p>{auth !== undefined ? `email : ${auth}` : 'not signed in'}</p>
    </div>
  );
}
