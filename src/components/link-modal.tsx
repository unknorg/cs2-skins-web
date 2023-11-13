"use client"

import {useEffect, useState} from "react";
import {getUserToken} from "@/shared/clientutils";


// https://www.reddit.com/r/ProgrammerHumor/comments/zajepm/most_mentally_stable_web_developer/
interface LinkModalProps {
  seqId: number
}

export default function LinkModal({seqId}: LinkModalProps) {
  const [showModal, setShowModal] = useState(false);
  const [token, setToken] = useState<string>();
  useEffect(() => {
    setShowModal(!!seqId);
  }, [seqId])

  useEffect(() => {
    if (showModal && !token) {
      getUserToken().then(setToken);
    }
  }, [showModal, token])

  return (
      <>
        {showModal ? (
            <>
              <div
                  className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
              >
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div
                      className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div
                        className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                      <h4 className="text-xl font-semibold">
                        Link to a server
                      </h4>
                      <button
                          className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-xl leading-none font-semibold outline-none focus:outline-none"
                          onClick={() => setShowModal(false)}
                      >
                    <span
                        className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                      </button>
                    </div>
                    {/*body*/}
                    {
                        token && (
                            <div className="relative p-6 flex-auto">

                              <p className="my-4 text-blueGray-500 leading-relaxed">
                                You can link this account to a game server using the token below.
                              </p>
                              <textarea id="chat" rows={1}
                                        className="block p-2.5 text-sm text-gray-900 bg-white resize-none rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        readOnly={true}>{token}</textarea>
                              <p className="my-4 text-blueGray-500 leading-relaxed">
                                Generally, you will have to type <b>!ws link {token}</b> in chat.
                              </p>
                            </div>) || (
                            <div className="relative p-6 flex-auto">

                              <p className="my-4 text-blueGray-500 leading-relaxed">
                                Fetching your token, please wait
                              </p>
                            </div>
                        )
                    }
                    {/*footer*/}
                    <div
                        className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                      <button
                          className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                          type="button"
                          onClick={() => setShowModal(false)}
                      >
                        Got It!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
            </>
        ) : null}
      </>
  );
}