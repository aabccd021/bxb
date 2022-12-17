import { bxb } from '../bxb';

export default function Home() {
  return (
    <div>
      <button onClick={bxb.db.getDoc}>Get Doc</button>
    </div>
  );
}
