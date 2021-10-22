import type { AppProps } from 'next/app';
import { useEffect } from 'react';

function init(): void {
  // const app = initializeApp({ projectId: 'demo-sakurazaka-blog' });
  // const firestore = getFirestore(app);
  // connectFirestoreEmulator(firestore, 'localhost', 8080);
}

function z(): string {
  return 'xx';
}

export function useMasmott(): void {
  const a = z();
  useEffect(() => {
    init();
    console.log(a);
  }, []);
}


function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
