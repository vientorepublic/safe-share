import Logo from "@/app/static/images/logo.webp";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function FooterComponent() {
  const t = useTranslations();
  return (
    <footer>
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-10 md:mb-0">
            <div className="flex items-center">
              <Image src={Logo} width={35} height={35} alt="" priority />
              <span className="text-2xl font-bold brand-gradient mt-1">Safe Share</span>
            </div>
            <p className="text-gray-500 text-sm mt-1 ml-2">Anonymous file sharing with end-to-end encryption</p>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            {new Date().getFullYear()} Safe Share, Illustrations by{" "}
            <a href="https://undraw.co/" className="text-blue-500" target="_blank">
              unDraw
            </a>
          </p>
          <p className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            {process.env.NEXT_PUBLIC_CURRENT_GIT_BRANCH} ({process.env.NEXT_PUBLIC_CURRENT_GIT_SHA})
          </p>
        </div>
      </div>
    </footer>
  );
}
