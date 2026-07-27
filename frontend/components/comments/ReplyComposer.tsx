"use client";

import React, { useState, useRef } from "react";
import { Mic, Send, Loader2 } from "lucide-react";

type ReplyComposerProps = {
  onSend: (payload: { type: 'text' | 'voice'; text?: string; voiceUrl?: string }) => Promise<void>;
  uploading?: boolean;
};

export default function ReplyComposer({ onSend, uploading }: ReplyComposerProps) {
  const [text, setText] = useState("");
  const [recording, setRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Recording not supported in this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // convert blob to base64 data URL
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          // parent will handle upload and create reply
          setSubmitting(true);
          try {
            await onSend({ type: 'voice', voiceUrl: base64 });
          } finally {
            setSubmitting(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      alert("Unable to access microphone");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleSendText = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onSend({ type: 'text', text: text.trim() });
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = uploading || submitting;

  return (
    <div className="flex items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isLoading ? (uploading ? "Uploading voice comment..." : "Sending...") : "Write a reply or record voice..."}
        disabled={isLoading}
        className={`flex-1 bg-neutral-900 border border-neutral-50 rounded-xl px-3 py-2 text-sm outline-none text-white transition-opacity ${
          isLoading ? "opacity-50" : ""
        }`}
      />
      <button
        type="button"
        onClick={() => {
          if (recording) stopRecording(); else startRecording();
        }}
        disabled={isLoading}
        className={`px-3 py-2 rounded-xl transition-all ${
          recording ? 'bg-red-600 animate-pulse' : isLoading ? 'bg-neutral-900 text-neutral-600' : 'bg-neutral-800'
        } text-white flex items-center justify-center`}
        title={recording ? 'Stop recording' : isLoading ? 'Loading...' : 'Record voice'}
      >
        {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Mic size={16} />}
      </button>
      <button
        type="button"
        onClick={handleSendText}
        disabled={isLoading || !text.trim()}
        className={`px-3 py-2 rounded-xl text-black transition-all ${
          isLoading || !text.trim() ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' : 'bg-white hover:bg-neutral-200'
        }`}
      >
        {isLoading && !uploading ? <Loader2 className="animate-spin text-black" size={14} /> : <Send size={14} />}
      </button>
    </div>
  );
}
