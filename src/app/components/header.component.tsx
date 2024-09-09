import Logo from "@/app/static/images/logo.webp";
import Image from "next/image";
import Link from "next/link";

export default function HeaderComponent() {
  return (
    <nav className="bg-gray-100 dark:bg-gray-800 fixed w-full z-20 top-0 start-0 dark:border-gray-600 shadow-md">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link href="/" className="flex items-center rtl:space-x-reverse">
          <Image src={Logo} width={35} height={35} alt="" priority />
          <span className="text-2xl font-bold brand-gradient mt-1">Safe Share</span>
        </Link>
      </div>
    </nav>
  );
}
