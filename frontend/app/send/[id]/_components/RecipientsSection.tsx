"use client";

import { useState } from "react";

const LS_KNOWN_EMAILS = "sender_known_emails";
const LS_EMAIL_GROUPS = "sender_email_groups";

interface Props {
  recipients: string;
  parsedEmails: string[];
  knownEmails: string[];
  emailGroups: Record<string, string[]>;
  canSend: boolean;
  testSending: boolean;
  isSending: boolean;
  userEmail?: string;
  onRecipientsChange: (val: string) => void;
  onKnownEmailsChange: (emails: string[]) => void;
  onEmailGroupsChange: (groups: Record<string, string[]>) => void;
  onTestSend: () => void;
}

export function RecipientsSection({
  recipients,
  parsedEmails,
  knownEmails,
  emailGroups,
  canSend,
  testSending,
  isSending,
  userEmail,
  onRecipientsChange,
  onKnownEmailsChange,
  onEmailGroupsChange,
  onTestSend,
}: Props) {
  const [groupName, setGroupName]         = useState("");
  const [showGroupInput, setShowGroupInput] = useState(false);

  const handleSendToMyself = () => {
    if (!userEmail) return;
    const existing = recipients.trim()
      ? recipients.trim().split(/[\n,]+/).map((e) => e.trim()).filter(Boolean)
      : [];
    if (!existing.includes(userEmail)) {
      onRecipientsChange([...existing, userEmail].join("\n"));
    }
  };

  const addKnownEmail = (email: string) => {
    const existing = recipients.trim()
      ? recipients.trim().split(/[\n,]+/).map((e) => e.trim()).filter(Boolean)
      : [];
    if (!existing.includes(email)) {
      onRecipientsChange([...existing, email].join("\n"));
    }
  };

  const removeKnownEmail = (email: string) => {
    const updated = knownEmails.filter((e) => e !== email);
    onKnownEmailsChange(updated);
    localStorage.setItem(LS_KNOWN_EMAILS, JSON.stringify(updated));
  };

  const loadGroup = (name: string) => {
    const emails = emailGroups[name];
    if (emails) onRecipientsChange(emails.join("\n"));
  };

  const deleteGroup = (name: string) => {
    const updated = { ...emailGroups };
    delete updated[name];
    onEmailGroupsChange(updated);
    localStorage.setItem(LS_EMAIL_GROUPS, JSON.stringify(updated));
  };

  const saveGroup = () => {
    const name = groupName.trim();
    if (!name || parsedEmails.length === 0) return;
    const updated = { ...emailGroups, [name]: parsedEmails };
    onEmailGroupsChange(updated);
    localStorage.setItem(LS_EMAIL_GROUPS, JSON.stringify(updated));
    setGroupName("");
    setShowGroupInput(false);
  };

  return (
    <section className="border border-neutral-800 rounded-2xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Recipients</h2>
          <p className="text-sm text-neutral-500 mt-1">
            Enter email addresses separated by commas or new lines.
          </p>
        </div>
        <button
          id="send-to-myself-btn"
          onClick={handleSendToMyself}
          className="shrink-0 text-sm px-3 py-2 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          + Send to myself
        </button>
      </div>

      {/* Known email chips */}
      {knownEmails.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">Previously used — click to add:</p>
          <div className="flex flex-wrap gap-2">
            {knownEmails.map((email) => (
              <span
                key={email}
                className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 rounded-full text-xs"
              >
                <button
                  onClick={() => addKnownEmail(email)}
                  className="pl-3 pr-1 py-1 hover:text-white text-neutral-300 transition-colors cursor-pointer"
                >
                  {email}
                </button>
                <button
                  onClick={() => removeKnownEmail(email)}
                  className="pr-2 py-1 text-neutral-600 hover:text-red-400 transition-colors cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Saved groups */}
      {Object.keys(emailGroups).length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-neutral-500">Saved groups — click to load:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(emailGroups).map(([name, emails]) => (
              <span
                key={name}
                className="flex items-center gap-1 bg-neutral-900 border border-neutral-700 rounded-full text-xs"
              >
                <button
                  onClick={() => loadGroup(name)}
                  className="pl-3 pr-1 py-1 hover:text-white text-neutral-300 transition-colors cursor-pointer"
                  title={`${emails.length} email${emails.length !== 1 ? "s" : ""}`}
                >
                  📋 {name} <span className="text-neutral-600">({emails.length})</span>
                </button>
                <button
                  onClick={() => deleteGroup(name)}
                  className="pr-2 py-1 text-neutral-600 hover:text-red-400 transition-colors cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        id="recipients-textarea"
        rows={5}
        placeholder={"alice@example.com\nbob@example.com"}
        value={recipients}
        onChange={(e) => onRecipientsChange(e.target.value)}
        className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-3 outline-none focus:border-neutral-500 transition-colors text-sm resize-none font-mono"
      />

      {/* Count + actions */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-neutral-500">
          {parsedEmails.length > 0
            ? `${parsedEmails.length} recipient${parsedEmails.length !== 1 ? "s" : ""}`
            : "No recipients yet"}
        </p>

        <div className="flex items-center gap-2">
          {/* Save as group */}
          {parsedEmails.length > 0 && (
            showGroupInput ? (
              <div className="flex gap-2">
                <input
                  id="group-name-input"
                  type="text"
                  placeholder="Group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveGroup()}
                  className="bg-black border border-neutral-700 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-neutral-500 w-36"
                  autoFocus
                />
                <button
                  onClick={saveGroup}
                  disabled={!groupName.trim()}
                  className="text-xs px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer disabled:opacity-40"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowGroupInput(false); setGroupName(""); }}
                  className="text-xs px-2 py-1.5 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                id="save-group-btn"
                onClick={() => setShowGroupInput(true)}
                className="text-xs px-3 py-1.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Save as group
              </button>
            )
          )}

          {/* Test Send */}
          <button
            id="test-send-btn"
            disabled={!canSend || testSending || isSending}
            onClick={onTestSend}
            className={`text-xs px-4 py-1.5 rounded-xl font-medium transition-all ${
              canSend && !testSending && !isSending
                ? "border border-neutral-600 hover:bg-neutral-800 cursor-pointer"
                : "border border-neutral-800 text-neutral-600 cursor-not-allowed"
            }`}
          >
            {testSending ? "Sending..." : "Test Send"}
          </button>
        </div>
      </div>
    </section>
  );
}
