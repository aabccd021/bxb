import { setDoc } from 'masmott';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';

const Home: NextPage = () => {
  const [state, setState] = useState('default');
  useEffect(() => {
    setDoc({ projectId: 'demo-diary' }, 'post', 'a', { title: 'a', text: 'b' })
      .then(() => setState('set'))
      .catch((e: Error) => setState(e.message));
  }, []);
  return <div>{state}</div>;
};

export default Home;
