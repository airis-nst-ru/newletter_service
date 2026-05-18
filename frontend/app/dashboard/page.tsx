"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import { useAuth } from "@/app/context/AuthContext";
import type { Newsletter } from "@/types/Newsletter";
import { validateAuth } from "@/utils/validateAuth.utils";


export default function AIRISDashboard() {
  const router = useRouter();

  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [creating, setCreating] = useState(false);
  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterDueDate, setNewsletterDueDate] = useState("");
  const [supportingNewsSection, setSupportingNewsSection] = useState(false);

  const { setLogoutState, setLoginState } = useAuth()

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

            supportingNewsSection,
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
          return (
            !newsletter.sent &&
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

  const totalNewsletters =
    newsletters.length;

  const sentNewsletters =
    newsletters.filter(
      (newsletter) => newsletter.sent
    ).length;

  const pendingNewsletters =
    newsletters.filter(
      (newsletter) => !newsletter.sent
    ).length;


  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              AIRIS Chronicle
            </h1>
            <p className="text-neutral-400 mt-2">
              Newsletter Management Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="border border-neutral-700 px-5 py-3 rounded-2xl font-semibold hover:bg-neutral-900 transition-all duration-200 cursor-pointer" onClick={handleLogout}>
              Logout
            </button>

            <button
              onClick={() =>
                setShowCreateModal(true)
              }
              className="bg-white text-black px-5 py-3 rounded-2xl font-semibold hover:scale-105 transition-all duration-200 cursor-pointer"
            >
              + Create Newsletter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-950">
            <p className="text-neutral-400 text-sm mb-2">
              Total Newsletters
            </p>
            <h2 className="text-4xl font-bold">
              {totalNewsletters}
            </h2>
          </div>

          <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-950">
            <p className="text-neutral-400 text-sm mb-2">
              Sent
            </p>
            <h2 className="text-4xl font-bold">
              {sentNewsletters}
            </h2>
          </div>

          <div className="border border-neutral-800 rounded-3xl p-6 bg-neutral-950">
            <p className="text-neutral-400 text-sm mb-2">
              Pending
            </p>
            <h2 className="text-4xl font-bold">
              {pendingNewsletters}
            </h2>
          </div>
        </div>

        <div className="border border-neutral-800 rounded-3xl bg-neutral-950 overflow-hidden">
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

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 text-sm text-left">
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Due Date</th>
                  <th className="px-6 py-4 font-medium">Author</th>
                  <th className="px-6 py-4 font-medium">Support News</th>
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

                      <td className="px-6 py-5 text-neutral-300">
                        {new Date(
                          newsletter.dueDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-5 text-neutral-300">
                        {newsletter.createdBy
                          ?.username}
                      </td>

                      <td className="px-6 py-5">
                        {newsletter.supportingNewsSection ? (
                          <span className="text-green-400">
                            Enabled
                          </span>
                        ) : (
                          <span className="text-neutral-500">
                            Disabled
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        {newsletter.sent ? (
                          <span className="bg-green-500/15 text-green-400 px-3 py-1 rounded-full text-sm">
                            Sent
                          </span>
                        ) : (
                          <span className="bg-yellow-500/15 text-yellow-400 px-3 py-1 rounded-full text-sm">
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer">
                            Edit
                          </button>

                          <button className="px-4 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer">
                            Preview
                          </button>

                          {!newsletter.sent && (
                            <button
                              onClick={() =>
                                handleMarkAsSent(
                                  newsletter.id
                                )
                              }
                              className="px-4 py-2 rounded-xl bg-white text-black font-medium hover:scale-105 transition-all cursor-pointer"
                            >
                              Mark as Sent
                            </button>
                          )
                          }

                          <button
                            onClick={() =>
                              handleDelete(
                                newsletter.id
                              )
                            }
                            className="px-4 py-2 rounded-xl border border-red-500 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

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

                    onChange={(date: any) => {
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
                      Supporting News Section
                    </p>

                    <p className="text-sm text-neutral-500 mt-1">
                      Enable additional supporting news blocks.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setSupportingNewsSection(
                        !supportingNewsSection
                      )
                    }
                    className={`w-14 h-8 rounded-full transition-all relative ${supportingNewsSection
                      ? "bg-white"
                      : "bg-neutral-700"
                      }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 rounded-full transition-all ${supportingNewsSection
                        ? "bg-black left-7"
                        : "bg-white left-1"
                        }`}
                    />
                  </button>
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
