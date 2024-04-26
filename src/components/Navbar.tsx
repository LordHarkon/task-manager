import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { Fragment } from "react";
import { FaChevronDown, FaTasks } from "react-icons/fa";
import { GiExitDoor } from "react-icons/gi";
import { IoInfinite } from "react-icons/io5";
import { MdOutlineSettings, MdOutlineSpaceDashboard } from "react-icons/md";

function Navbar() {
  const { data: sessionData } = useSession();

  return (
    <div className="flex h-16 w-full items-center justify-between bg-zinc-900 px-4">
      <div className="flex items-center space-x-1">
        <IoInfinite size={28} />
        <span className="inline-block bg-gradient-to-r from-purple-600 via-pink-500 via-60% to-pink-700 bg-clip-text text-2xl font-bold text-transparent">
          Task Manager
        </span>
      </div>

      <div
        className={clsx("flex items-center space-x-2", {
          hidden: !!sessionData,
        })}
      >
        <span className="cursor-pointer" onClick={() => void signIn()}>
          Login
        </span>
      </div>
      <div
        className={clsx("", {
          hidden: !sessionData,
        })}
      >
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex w-full items-center justify-center space-x-1 rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
              <Image
                src={
                  sessionData?.user.image ?? "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                }
                alt="Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span>{sessionData?.user.name}</span>
              <FaChevronDown className="-mr-1 ml-2 h-5 w-5 text-violet-200 hover:text-violet-100" aria-hidden="true" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-zinc-700 rounded-md bg-zinc-900 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="px-1 py-1 ">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={clsx("group flex w-full items-center rounded-md px-2 py-2 text-sm", {
                        "bg-violet-500 text-white": active,
                        "text-gray-200": !active,
                      })}
                    >
                      <MdOutlineSpaceDashboard className="mr-2 h-5 w-5" aria-hidden="true" />
                      Dashboard
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={clsx("group flex w-full items-center rounded-md px-2 py-2 text-sm", {
                        "bg-violet-500 text-white": active,
                        "text-gray-200": !active,
                      })}
                    >
                      <MdOutlineSettings className="mr-2 h-5 w-5" aria-hidden="true" />
                      Settings
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={clsx("group flex w-full items-center rounded-md px-2 py-2 text-sm", {
                        "bg-violet-500 text-white": active,
                        "text-gray-200": !active,
                      })}
                    >
                      <FaTasks className="mr-2 h-5 w-5" aria-hidden="true" />
                      Tasks
                    </button>
                  )}
                </Menu.Item>
              </div>
              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={clsx("group flex w-full items-center rounded-md px-2 py-2 text-sm", {
                        "bg-violet-500 text-white": active,
                        "text-gray-200": !active,
                      })}
                      onClick={() => void signOut()}
                    >
                      <GiExitDoor className="mr-2 h-5 w-5" aria-hidden="true" />
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}

export default Navbar;
