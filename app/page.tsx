import Image from "next/image";
import QRGenerator from "./components/QRGenerator";
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center px-10 py-20 sm:px-20 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-3 mb-12">
          <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
            M
          </div>
          <span className="text-3xl font-semibold text-red-600 tracking-tight">
            Musealum
          </span>
        </div>

        <div className="flex flex-col items-center text-center gap-6 sm:items-start sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-black dark:text-zinc-50">
            Discover Culture.  
            <span className="text-red-600"> Anytime. Anywhere.</span>
          </h1>

          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Musealum brings museum collections to your fingertips. Explore artifacts, exhibitions, and timelines through an interactive digital experience.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row mt-6">
            <a
              href="explore"
              className="flex h-12 items-center justify-center rounded-full bg-red-600 px-8 text-white font-medium shadow hover:bg-red-700 transition-colors"
            >
              Explore Now
            </a>

            <a
              href="register"
              className="flex h-12 items-center justify-center rounded-full border border-red-600 px-8 text-red-600 font-medium hover:bg-red-600 hover:text-white transition-colors"
            >
              Register
            </a>
          </div>
        </div>

        <div className="mt-20 text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Musealum — All rights reserved.
        </div>
      </main>
    </div>
  );
}
