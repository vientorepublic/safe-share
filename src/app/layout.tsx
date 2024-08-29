import BrowserDetection from "./layouts/browser_detection.layout";
import TheFooter from "./components/footer.component";
import TheHeader from "./components/header.component";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { ReCaptchaProvider } from "next-recaptcha-v3";
import { NextIntlClientProvider } from "next-intl";
import { cookies, headers } from "next/headers";
import { getMessages } from "next-intl/server";
import { getPreferredLanguage } from "@/i18n";
import { fallback, locales } from "./locales";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import type { Metadata } from "next";
import "@/app/static/css/main.css";
import "@/app/globals.css";
config.autoAddCss = false;

export const metadata: Metadata = {
  metadataBase: new URL("https://safe-share.cc"),
  title: "Safe Share",
  description: "Share your files more securely",
  openGraph: {
    type: "website",
    title: "Safe Share",
    description: "Share your files more securely",
  },
  twitter: {
    title: "Safe Share",
    description: "Share your files more securely",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let locale: string;
  const cookie = cookies();
  const headersList = headers();
  const acceptLanguage = headersList.get("accept-language");
  const detectedLanguage = acceptLanguage ? getPreferredLanguage(acceptLanguage) : fallback;
  locale = (locales.find((e) => e.code === detectedLanguage) && detectedLanguage) || fallback;
  const languageCookie = cookie.get("language");
  if (languageCookie) {
    const value = languageCookie.value;
    locale = (locales.find((e) => e.code === value) && value) || fallback;
  }
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className="dark:bg-gray-900 bg-gray-100 text-gray-700 dark:text-white">
        <NextTopLoader showSpinner height={2} />
        <NextIntlClientProvider messages={messages}>
          <ReCaptchaProvider reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_PUBLIC_KEY}>
            <BrowserDetection>
              <Toaster />
              <TheHeader />
              {children}
              <TheFooter />
            </BrowserDetection>
          </ReCaptchaProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
