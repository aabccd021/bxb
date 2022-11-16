/* eslint-disable functional/no-return-void */

import { masmott } from '../masmott';

export default function Home() {
  return <button onClick={() => masmott.signIn()}>Sign In</button>;
}
