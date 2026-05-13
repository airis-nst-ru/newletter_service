import { LogoutButton } from "@/components/auth/logout-button";
import { BrandIdentity } from "@/components/brand/brand-identity";
import { LinkButton } from "@/components/ui/link-button";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export function ProtectedHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-[rgba(176,106,179,0.2)] py-4">
      <BrandIdentity compact />
      <div className="flex items-center gap-3">
        <LinkButton href={AUTH_ROUTES.editor}>Create Newsletter</LinkButton>
        <LogoutButton />
      </div>
    </header>
  );
}
