import type { Newsletter } from "@/lib/newsletters/types";

type NewsletterListProps = {
  newsletters: Newsletter[];
};

function formatDate(value: string | null): string {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function NewsletterList({ newsletters }: NewsletterListProps) {
  if (newsletters.length === 0) {
    return (
      <div className="rounded-md border border-[rgba(176,106,179,0.2)] bg-[rgba(255,255,255,0.03)] px-4 py-5 text-sm text-[#a0a0a0]">
        No newsletters found.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {newsletters.map((newsletter) => (
        <article
          key={newsletter.id}
          className="rounded-md border border-[rgba(176,106,179,0.2)] bg-[rgba(255,255,255,0.03)] p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#f0f0f0]">
                {newsletter.content?.title || "Untitled newsletter"}
              </h3>
              <p className="mt-1 text-sm text-[#a0a0a0]">
                Created by {newsletter.createdBy.username}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-md border border-[rgba(176,106,179,0.25)] px-3 py-1 text-xs font-medium text-[#d4a5d6]">
              {newsletter.sent ? "Sent" : "Draft"}
            </span>
          </div>

          <dl className="mt-4 grid gap-3 text-sm text-[#a0a0a0] sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase text-[#d4a5d6]">Due</dt>
              <dd className="mt-1">{formatDate(newsletter.dueDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-[#d4a5d6]">Sent</dt>
              <dd className="mt-1">{formatDate(newsletter.sentDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase text-[#d4a5d6]">News Section</dt>
              <dd className="mt-1">
                {newsletter.supportingNewsSection ? "Enabled" : "Disabled"}
              </dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}
