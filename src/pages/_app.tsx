import React from "react";
import { AppProps } from "next/app";
import Head from "next/head";

const FileExplorerApp = ({ Component, pageProps }: AppProps): JSX.Element => (
  <>
    <Head>
      <link
        rel="stylesheet"
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css"
        integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
        crossOrigin="anonymous"
      />

      <link rel="stylesheet" href="/style.css" />
    </Head>
    <Component {...pageProps} />
  </>
);

export default FileExplorerApp;
