import React from "react";
import { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";

const FileExplorerApp = ({ Component, pageProps }: AppProps): JSX.Element => (
  <>
    <style jsx global>{`
      body {
        margin-top: 100px;
      }
    `}</style>
    <Component {...pageProps} />
  </>
);

export default FileExplorerApp;
