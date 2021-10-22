import type { AppProps } from 'next/app';

import { useMasmott } from '../hooks/init';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useMasmott();
  return <Component {...pageProps} />;
}
export default MyApp;
