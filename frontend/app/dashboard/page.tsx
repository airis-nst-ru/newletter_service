"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import { useAuth } from "@/app/context/AuthContext";
import type { Newsletter } from "@/types/Newsletter";
import { validateAuth } from "@/utils/validateAuth.utils";
import { capitalize } from "@/utils/helpers/string.helpers";
import { useTitle } from "@/app/context/TitleContext";

// icons import
import { SlOptionsVertical } from "react-icons/sl";




export default function AIRISDashboard() {
  const router = useRouter();
  const setTitle = useTitle().setPageTitle;

  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [creating, setCreating] = useState(false);
  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterDueDate, setNewsletterDueDate] = useState("");
  const [hasSupportingNews, setHasSupportingNews] = useState(false);
  const [editionNumber, setEditionNumber] = useState("");

  const { setLogoutState, setLoginState, user } = useAuth()

  useEffect(() => {
    const name = capitalize(user?.username || "")
    setTitle(`${name}'s Dashboard`);
  }, [setTitle, user])

  const handleCreateNewsletter = async () => {
    try {
      setCreating(true);

      const response = await fetch(
        "/api/v1/newsletters",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            dueDate:
              newsletterDueDate,

            title:
              newsletterTitle,

            content:
              "<div></div>",

            hasSupportingNews,
            editionNumber: Number(editionNumber),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to create newsletter"
        );
      }

      const newsletterId =
        data.data.id;

      setShowCreateModal(false);

      router.push(
        `/editor/${newsletterId}`
      );
    } catch (error) {
      console.log(error);
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      // TODO: create a logout service
      const response = await fetch("/api/v1/auth/logout", {
        method: "POST",
      }
      );
      const data = await response.json();
      if (!response.ok) {
        console.log(data.message);
        return;
      }
      setLogoutState()
      router.push("/auth/login");
    } catch (error) {
      console.log(error);
    }
  }

  const fetchNewsletters = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/v1/newsletters",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to fetch newsletters"
        );
      }

      setNewsletters(data.data || []);
      // router.push("/auth/login")
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsletters()
      .then(() => console.log("Newsletters fetched successfully"))
      .catch((error) => {
        console.log("Error fetching newsletters:", error);
      });
  }, []);

  // check if user is authenticated
  useEffect(() => {
    validateAuth()
      .then((res) => {
        if (!res) {
          router.push("/auth/login")
          return
        }
        setLoginState(res)
      })
      .catch(() => {
        setLogoutState()
        router.push("/auth/login")
      })
  }, [])

  const handleMarkAsSent = async (
    id: string
  ) => {
    try {
      const response = await fetch(
        `/api/v1/newsletters/${id}/send`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to mark as sent"
        );
      }

      await fetchNewsletters();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    try {
      const response = await fetch(
        `/api/v1/newsletters/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to delete newsletter"
        );
      }

      await fetchNewsletters();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredNewsletters = useMemo(() => {
    return newsletters.filter(
      (newsletter) => {
        const matchesSearch =
          newsletter.content?.title
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) || false;

        if (filter === "Sent") {
          return (
            newsletter.sent &&
            matchesSearch
          );
        }

        if (filter === "Pending") {
          // show newsletters which are explicitly sent for approval
          return (
            newsletter.status === "Seeking_Approval" &&
            matchesSearch
          );
        }

        return matchesSearch;
      }
    );
  }, [
    newsletters,
    search,
    filter,
  ]);



  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* navbar */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              AIRIS Chronicle
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="border border-neutral-700 px-5 py-3 rounded-2xl font-semibold hover:bg-neutral-900 transition-all duration-200 cursor-pointer" onClick={handleLogout}>
              Logout
            </button>

            {user?.accountType === "Editor" && <button
              onClick={() =>
                setShowCreateModal(true)
              }
              className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              + Create Newsletter
            </button>}
          </div>
        </div>

        {/* greeting */}
        <div className="mb-6">
          <p className="text-lg font-medium text-neutral-400">Hey {capitalize(user?.username || '')}, welcome to your dashboard!</p>
        </div>

        {/* newsletters table */}
        <div className="border border-neutral-800 rounded-3xl bg-neutral-950 overflow-hidden">
          {/* Top Heading and Search and Filter Options */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800">
            <h2 className="text-2xl font-semibold">
              Newsletters
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search newsletters..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="bg-black border border-neutral-700 rounded-xl px-4 py-2 outline-none w-64"
              />

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
                className="bg-black border border-neutral-700 rounded-xl px-4 py-2 outline-none"
              >
                <option>All</option>
                <option>Sent</option>
                <option>Pending</option>
              </select>
            </div>
          </div>

          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-sm text-left">
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Edition Number</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium">Author</th>
                  <th className="px-6 py-4 font-medium">Has Supporting News</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-neutral-400"
                    >
                      Loading newsletters...
                    </td>
                  </tr>
                ) : filteredNewsletters.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-neutral-400"
                    >
                      No newsletters found.
                    </td>
                  </tr>
                ) : (
                  filteredNewsletters.map((newsletter) => (
                    <tr
                      key={newsletter.id}
                      className="border-b border-neutral-900 hover:bg-neutral-900/60 transition-colors"
                    >
                      <td className="px-6 py-5 font-medium">
                        {newsletter.content?.title ||
                          "Untitled Newsletter"}
                      </td>

                      <td className="px-6 py-5 font-medium">
                        {newsletter.editionNumber ? `#${newsletter.editionNumber}` : "N/A"}
                      </td>

                      <td className="px-6 py-5 text-neutral-300">
                        {new Date(
                          newsletter.dueDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-5 text-neutral-300">
                        {capitalize(newsletter.createdBy
                          ?.username)}
                      </td>

                      <td className="px-6 py-5">
                        {newsletter.hasSupportingNews ? (
                          <span className="text-green-400">
                            Yes
                          </span>
                        ) : (
                          <span className="text-neutral-500">
                            No
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {newsletter.sent ? (
                          <span className="bg-green-500/15 text-green-400 px-3 py-1 rounded-full text-sm">
                            Sent
                          </span>
                        ) : newsletter.status === "Seeking_Approval" ? (
                          <span className="bg-yellow-500/15 text-yellow-400 px-3 py-1 rounded-full text-sm">
                            Pending Approval
                          </span>
                        ) : newsletter.status === "Approved" ? (
                          <span className="bg-purple-500/15 text-purple-400 px-3 py-1 rounded-full text-sm">
                            Approved
                          </span>
                        ) : (
                          <span className="bg-yellow-500/15 text-yellow-400 px-3 py-1 rounded-full text-sm">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {user?.accountType === "Approver" && (
                            newsletter.status === "Seeking_Approval" ? (
                              <button
                                onClick={() => router.push(`/approver/${newsletter.id}`)}
                                className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer text-sm"
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                onClick={() => router.push(`/approver/${newsletter.id}`)}
                                className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer text-sm text-neutral-400 hover:text-white"
                              >
                                View
                              </button>
                            )
                          )}

                          {user?.accountType === "Editor" && (
                            <button
                              onClick={() => router.push(`/editor/${newsletter.id}`)}
                              className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer text-sm"
                            >
                              Edit
                            </button>
                          )}

                          {user?.accountType === "Sender" && (
                            <button
                              onClick={() => router.push(`/editor/${newsletter.id}`)}
                              className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer text-sm"
                            >
                              Send
                            </button>
                          )}

                          <div>
                            <SlOptionsVertical
                              className="cursor-pointer hover:text-neutral-300 transition-colors"
                              onMouseDown={(e) => e.stopPropagation()}
                              onClick={(e) => {
                                const rect = (e.currentTarget as Element).getBoundingClientRect();
                                if (openMenuId === newsletter.id) {
                                  setOpenMenuId(null);
                                  setMenuPosition(null);
                                } else {
                                  setOpenMenuId(newsletter.id);
                                  setMenuPosition({ top: rect.bottom + 6, left: rect.right - 176 });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {openMenuId && menuPosition && (
        <div
          ref={menuRef}
          style={{ top: menuPosition.top, left: menuPosition.left }}
          className="fixed z-9999 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl overflow-hidden w-44"
        >
          <button
            onClick={() => {
              setOpenMenuId(null);
              router.push(`/preview/${openMenuId}`);
            }}
            className="w-full text-left px-4 py-3 text-sm hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Preview
          </button>

          {!newsletters.find((n) => n.id === openMenuId)?.sent && (
            <button
              onClick={() => {
                const id = openMenuId;
                setOpenMenuId(null);
                handleMarkAsSent(id);
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Mark as Sent
            </button>
          )}

          <button
            onClick={() => {
              const id = openMenuId;
              setOpenMenuId(null);
              handleDelete(id);
            }}
            className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}

      {
        showCreateModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">

            <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-8 w-full max-w-lg">

              <h2 className="text-3xl font-bold mb-2">
                Create Newsletter
              </h2>

              <p className="text-neutral-400 mb-8">
                Configure newsletter details.
              </p>

              <div className="space-y-6">

                {/* TITLE */}
                <div>
                  <label className="block mb-2 text-sm text-neutral-400">
                    Newsletter Title
                  </label>

                  <input
                    type="text"
                    placeholder="Enter newsletter title"
                    value={newsletterTitle}
                    onChange={(e) =>
                      setNewsletterTitle(
                        e.target.value
                      )
                    }
                    className="w-full bg-black border border-neutral-700 rounded-2xl px-4 py-3 outline-none"
                  />

                  {newsletterTitle.trim().length > 0 &&
                    newsletterTitle.trim().length < 3 && (
                      <p className="text-red-400 text-sm mt-2">
                        Title must be at least 3 characters.
                      </p>
                    )}
                </div>

                {/* DATE PICKER */}
                <div>
                  <label className="block mb-2 text-sm text-neutral-400">
                    Due Date
                  </label>

                  <DatePicker
                    selected={
                      newsletterDueDate
                        ? new Date(
                          newsletterDueDate
                        )
                        : null
                    }

                    onChange={(date: Date | null) => {
                      if (date) {
                        setNewsletterDueDate(
                          date.toISOString()
                        );
                      }
                    }}

                    showTimeSelect
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"

                    minDate={new Date()}

                    placeholderText="Select due date"

                    className="w-full bg-black border border-neutral-700 rounded-2xl px-4 py-3 outline-none text-white"

                    calendarClassName="bg-neutral-900 border border-neutral-700 text-white rounded-2xl"

                    popperClassName="z-50"
                  />

                  {!newsletterDueDate && (
                    <p className="text-neutral-500 text-sm mt-2">
                      Select when this newsletter should be due.
                    </p>
                  )}

                  {newsletterDueDate &&
                    new Date(
                      newsletterDueDate
                    ).getTime() -
                    Date.now() <
                    5 * 60 * 1000 && (
                      <p className="text-yellow-400 text-sm mt-2">
                        Please select a time at least 5 minutes ahead.
                      </p>
                    )}
                </div>

                {/* SUPPORTING NEWS */}
                <div className="border border-neutral-800 rounded-2xl p-5 flex items-center justify-between">

                  <div>
                    <p className="font-semibold">
                      Will have Supporting News?
                    </p>

                    <p className="text-sm text-neutral-500 mt-1">
                      Enable additional supporting news blocks.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setHasSupportingNews(
                        !hasSupportingNews
                      )
                    }
                    className={`w-14 h-8 rounded-full transition-all relative ${hasSupportingNews
                      ? "bg-white"
                      : "bg-neutral-700"
                      }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 rounded-full transition-all ${hasSupportingNews
                        ? "bg-black left-7"
                        : "bg-white left-1"
                        }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block mb-2 text-sm text-neutral-400">
                    Edition Number (optional)
                  </label>

                  <input
                    type="number"
                    placeholder="Enter edition number"
                    value={editionNumber}
                    onChange={(e) =>
                      setEditionNumber(e.target.value)
                    }
                    className="w-full bg-black border border-neutral-700 rounded-2xl px-4 py-3 outline-none"
                  />
                </div>

                {/* ACTIONS */}
                <div className="flex items-center justify-end gap-3 pt-2">

                  <button
                    onClick={() =>
                      setShowCreateModal(false)
                    }
                    className="border border-neutral-700 px-5 py-3 rounded-2xl hover:bg-neutral-900 transition-all"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={
                      creating ||
                      newsletterTitle.trim()
                        .length < 3 ||
                      !newsletterDueDate ||
                      new Date(
                        newsletterDueDate
                      ).getTime() -
                      Date.now() <
                      5 * 60 * 1000
                    }

                    onClick={
                      handleCreateNewsletter
                    }

                    className={`px-5 py-3 rounded-2xl font-semibold transition-all ${creating
                      ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                      : "bg-white text-black hover:scale-105"
                      }`}
                  >
                    {creating
                      ? "Creating..."
                      : "Create Newsletter"}
                  </button>

                </div>

              </div>
            </div>
          </div>
        )
      }

    </div>
  );
}
