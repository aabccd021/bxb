/* eslint-disable functional/no-conditional-statement */
/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */

import { option } from 'fp-ts';
import { Option } from 'fp-ts/Option';
import { useEffect, useState } from 'react';

import { masmott } from '../masmott';

export default function Home() {
  const [auth, setAuth] = useState<Option<string>>(option.none);
  useEffect(masmott.onAuthStateChanged((a) => () => setAuth(a)), []);
  return (
    <div>
      <button onClick={() => masmott.signInGoogleWithRedirect()}>Sign In With Redirect</button>;
      <button onClick={() => masmott.signOut()}>Sign Out</button>;
      <p id="auth-status">
        {option.match(
          () => 'not signed in',
          (s) => `email : ${s}`
        )(auth)}
      </p>
    </div>
  );
}
