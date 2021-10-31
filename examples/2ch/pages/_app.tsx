/* istanbul ignore file */
import type { AppProps } from 'next/app';
import Link from 'next/link';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <nav>
        <Link href={`/thread/new`}>
          <a>Create New Thread</a>
        </Link>
      </nav>
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;
