import { bxb } from '../modules/bxb';

export default function Home() {
  return (
    <div>
      <button onClick={bxb.db.getDoc({key: {collection: 'a', id: 'b'}})}>Get Doc</button>
      <button onClick={bxb.db.upsertDoc({key: {collection: 'a', id: 'b'}, data: {}})}>Get Doc</button>
    </div>
  );
}
