import { NewsletterList } from "@/components/newsletters/newsletter-list";
import type { Newsletter } from "@/lib/newsletters/types";

type NewsletterPanelProps = {
  newsletters: Newsletter[];
};

export function NewsletterPanel({ newsletters }: NewsletterPanelProps) {
  return (
    <section className="rounded-[20px] border border-[rgba(176,106,179,0.25)] bg-[rgba(255,255,255,0.04)] p-8 backdrop-blur-xl">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#d4a5d6]">Newsletters</p>
          <h2 className="mt-2 text-2xl font-bold text-[#f0f0f0]">
            All Newsletters
          </h2>
        </div>
        <p className="text-sm text-[#a0a0a0]">
          {newsletters.length} total
        </p>
      </div>

      <NewsletterList newsletters={newsletters} />
    </section>
  );
}
