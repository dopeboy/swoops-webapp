import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const sheet = new ServerStyleSheet();
        const originalRenderPage = ctx.renderPage;

        try {
            ctx.renderPage = () =>
                originalRenderPage({
                    enhanceApp: (App) => (props) => sheet.collectStyles(<App {...props} />),
                });

            const initialProps = await Document.getInitialProps(ctx);
            return {
                ...initialProps,
                styles: (
                    <>
                        {initialProps.styles}
                        {sheet.getStyleElement()}
                    </>
                ),
            };
        } finally {
            sheet.seal();
        }
    }

    render() {
        return (
            <Html>
                <Head>
                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" />
                    <link rel="preload" href="/fonts/Druk-Wide-Web-Bold.woff2" as="font" type="font/woff2" crossOrigin="" />
                    <link rel="preload" href="/fonts/Druk-Wide-Web-Medium.woff2" as="font" type="font/woff2" crossOrigin="" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@800&display=optional" rel="stylesheet" crossOrigin="anonymous" />
                    <title>{process.env.REACT_APP_SITE_TITLE || 'Swoops'}</title>
                </Head>
                <body className="bg-black">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
