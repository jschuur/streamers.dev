import Document, { Html, Head, Main, NextScript } from 'next/document';

import { isDev } from '../lib/util';
export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=UA-G-FWHTNZTQYS"`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());

                  gtag('config', 'G-FWHTNZTQYS');
          `,
            }}
          />
        </Head>
        <body className={`bg-blue-50 dark:bg-gray-800 ${isDev() && 'debug-screens'}`}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
