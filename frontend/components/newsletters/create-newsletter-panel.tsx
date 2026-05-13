import { LinkButton } from "@/components/ui/link-button";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export function CreateNewsletterPanel() {
  return (
    <section className="rounded-[20px] border border-[rgba(176,106,179,0.25)] bg-[rgba(255,255,255,0.04)] p-8 backdrop-blur-xl">
      <p className="text-sm font-medium text-[#d4a5d6]">Create Newsletter</p>
      <h2 className="mt-2 text-2xl font-bold text-[#f0f0f0]">
        Start a new newsletter
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a0a0a0]">
        Open the editor to draft newsletter content, configure delivery details,
        and prepare it for publishing.
      </p>
      <LinkButton href={AUTH_ROUTES.editor} className="mt-6">
        Open Editor
      </LinkButton>
    </section>
  );
}
