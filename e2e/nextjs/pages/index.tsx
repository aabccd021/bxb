/* eslint-disable functional/no-return-void */
import { signIn } from 'masmott/dist/es6/mock';

export default function Home() {
  return <button onClick={() => signIn()}>Sign In</button>;
}
