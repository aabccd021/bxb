/* eslint-disable functional/no-expression-statement */
/* eslint-disable functional/no-return-void */

import { masmott } from '../../masmott';

export default function Home() {
  return (
    <div>
      <button onClick={masmott.auth.signOut}>Sign In With Redirect</button>;
    </div>
  );
}
