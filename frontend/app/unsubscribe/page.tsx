import { Metadata } from "next";
import UnsubscribeClient from "./UnsubscribeClient";
import { decodeEmailToken } from "@/services/mail.service";

export const metadata: Metadata = {
  title: "Unsubscribe — AIRIS Chronicle",
  description: "Manage your AIRIS Chronicle newsletter subscription.",
};

interface Props {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const params = await searchParams;
  const error = params.error;

  let email = "";
  try {
    if (params.token) {
      email = decodeEmailToken(params.token);
    }
  } catch {
    email = "";
  }

  return <UnsubscribeClient email={email} initialError={error} />;
}

