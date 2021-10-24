import type { AppProps } from "next/app";
import Link from "next/link";
import React from "react";
import { useMasmott } from "../generated";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useMasmott();
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
