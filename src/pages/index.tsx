import { signIn, useSession } from "next-auth/react";
import Head from "next/head";
import { Toaster } from "react-hot-toast";
import { BiLoaderAlt } from "react-icons/bi";
import { FaDiscord } from "react-icons/fa";
import { IoInfinite } from "react-icons/io5";
import { MdOutlineWarningAmber } from "react-icons/md";
import Priorities from "~/components/Home/Priorities";
import Tasks from "~/components/Home/Tasks";
import Navbar from "~/components/Navbar";

export default function Home() {
  const { status: loginStatus } = useSession();

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-gray-100">
      <Head>
        <title>Task Manager</title>
        <meta
          name="description"
          content="Task Manager is an application designed to assist you in managing your tasks."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          error: {
            icon: <MdOutlineWarningAmber size={32} className="text-red-500" />,
            style: {
              background: "rgb(39 39 42)",
              color: "rgb(229 231 235)",
            },
          },
        }}
      />
      <div className="container mx-auto bg-zinc-900 p-4 ">
        <div className="flex w-full items-center justify-center">
          <IoInfinite size={96} />
        </div>
        <h1 className="text-center text-4xl font-bold">
          Welcome to{" "}
          <span className="inline-block bg-gradient-to-r from-purple-600 via-pink-500 via-60% to-pink-700 bg-clip-text text-transparent">
            Task Manager
          </span>
        </h1>
        <p className="text-center text-lg">This is an application designed to assist you in managing your tasks.</p>
        {loginStatus === "authenticated" && (
          <>
            <Tasks />
            <Priorities />
          </>
        )}
        {loginStatus === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-2 p-6">
            <BiLoaderAlt size={48} className="animate-spin" />
            <span className="text-2xl">Loading...</span>
          </div>
        )}
        {loginStatus === "unauthenticated" && (
          <div className="flex flex-col items-center justify-center p-6">
            <button
              className="flex items-center space-x-2 rounded-md border border-white/10 bg-zinc-800 px-4 py-2 text-white"
              onClick={() => void signIn("discord")}
            >
              <FaDiscord size={24} />
              <span>Login with Discord</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
