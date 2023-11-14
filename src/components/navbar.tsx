"use client";

import {Session} from "next-auth";
import Link from "next/link";
import {useState} from "react";
import LinkModal from "@/components/link-modal";

interface NavbarProps {
  session: Session | null;
}

export default function Navbar({session}: NavbarProps) {
  const [modalSeqId, setModalSeqId] = useState(0)

  if (!session?.user) {
    return (<div>Unauthenticated</div>)
  }

  return (
      <>
        <LinkModal seqId={modalSeqId}/>
        <nav className="bg-white border-gray-200 dark:bg-gray-900">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
            <a href="https://flowbite.com/" className="flex items-center">
              <img
                  src="https://flowbite.com/docs/images/logo.svg"
                  className="h-8 mr-3"
                  alt="Flowbite Logo"
              />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
        Flowbite
      </span>
            </a>
            <div className="flex items-center md:order-2">
              <span>Welcome <b>{session.user.name}</b></span>
              <Link href="/api/auth/signout">
                <button type="button"
                        className="text-white ml-3 my-auto bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Logout
                </button>
              </Link>
            </div>
            <div
                className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
                id="navbar-user"
            >
              <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                <li>
                  <Link
                      href="/"
                      className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Weapons
                  </Link>
                </li>
                <li>
                  <a
                      href="#"
                      className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                      onClick={() => alert("Knife customization coming soon.")}
                  >
                    Knifes
                  </a>
                </li>
                <li>
                  <a
                      href="#"
                      className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                      onClick={() => alert("Gloves customization coming soon.")}
                  >
                    Gloves
                  </a>
                </li>
                <li>
                  <a
                      href="#"
                      className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                      onClick={() => setModalSeqId(modalSeqId + 1)}
                  >
                    Link to Server
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </>
  )
}