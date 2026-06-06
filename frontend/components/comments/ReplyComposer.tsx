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
          await onSend({ type: 'voice', voiceUrl: base64 });
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
    await onSend({ type: 'text', text: text.trim() });
    setText("");
  };

  return (
    <div className="flex items-center gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={uploading ? "Uploading voice comment..." : "Write a reply or record voice..."}
        disabled={uploading}
        className={`flex-1 bg-neutral-900 border border-neutral-50 rounded-xl px-3 py-2 text-sm outline-none text-white transition-opacity ${
          uploading ? "opacity-50" : ""
        }`}
      />
      <button
        type="button"
        onClick={() => {
          if (recording) stopRecording(); else startRecording();
        }}
        disabled={uploading}
        className={`px-3 py-2 rounded-xl transition-all ${
          recording ? 'bg-red-600 animate-pulse' : uploading ? 'bg-neutral-900 text-neutral-600' : 'bg-neutral-800'
        } text-white flex items-center justify-center`}
        title={recording ? 'Stop recording' : uploading ? 'Uploading...' : 'Record voice'}
      >
        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Mic size={16} />}
      </button>
      <button
        type="button"
        onClick={handleSendText}
        disabled={uploading || !text.trim()}
        className={`px-3 py-2 rounded-xl text-black transition-all ${
          uploading || !text.trim() ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed' : 'bg-white hover:bg-neutral-200'
        }`}
      >
        <Send size={14} />
      </button>
    </div>
  );
}
