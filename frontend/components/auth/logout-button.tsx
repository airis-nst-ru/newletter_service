"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/auth/client";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { getErrorMessage } from "@/lib/http/api-error";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    setIsSubmitting(true);

    try {
      await logout();
      router.replace(AUTH_ROUTES.login);
      router.refresh();
    } catch (logoutError) {
      setError(getErrorMessage(logoutError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        variant="secondary"
        onClick={handleLogout}
        disabled={isSubmitting}
        className="min-w-24"
      >
        {isSubmitting ? "Logging out..." : "Logout"}
      </Button>
      {error ? (
        <p role="alert" className="max-w-56 text-right text-xs text-red-100">
          {error}
        </p>
      ) : null}
    </div>
  );
}
