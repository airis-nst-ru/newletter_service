"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Upload, Loader2, Check, Copy, MoreVertical, Trash2, ArrowUpRight } from "lucide-react";

interface Props {
  onSelect: (url: string) => void;
}

interface MediaItem {
  secure_url: string;
  public_id: string;
}

export default function MediaManager({ onSelect }: Props) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Show a toast message that auto-dismisses
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // FETCH MEDIA
  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/v1/media");
      const data = await response.json();
      if (data.success) {
        setMedia(data.data);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // UPLOAD MEDIA
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/v1/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload file");
      }

      setMedia((prev) => [
        {
          secure_url: data.data.url,
          public_id: data.data.publicId,
        },
        ...prev,
      ]);
      showToast("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  // DELETE MEDIA
  const handleDelete = async (publicId: string) => {
    if (!confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/media?publicId=${encodeURIComponent(publicId)}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        setMedia((prev) => prev.filter((item) => item.public_id !== publicId));
        showToast("Image deleted successfully");
      } else {
        alert(data.message || "Failed to delete image");
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(`Error deleting image: ${error.message}`);
    }
  };

  // COPY URL TO CLIPBOARD
  const copyUrlToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Public link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  return (
    <div className="w-full relative">
      {/* DROPZONE */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all mb-8 ${
          isDragActive ? "border-white bg-neutral-900" : "border-neutral-800 hover:border-neutral-700"
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-neutral-400" size={24} />
            <p className="text-sm font-semibold text-neutral-300">Uploading image to Cloudinary...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="mb-3 w-6 h-6 text-neutral-400" />
            <p className="text-sm font-bold text-neutral-200">Drag & drop images here</p>
            <p className="text-xs text-neutral-500 mt-1">or click to browse local files</p>
          </div>
        )}
      </div>

      {/* MEDIA GRID OR LOADING / EMPTY STATE */}
      {loading ? (
        /* Loading skeleton grids */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden animate-pulse h-40 flex flex-col justify-between p-1">
              <div className="bg-neutral-850 aspect-video w-full rounded-xl flex-1" />
              <div className="p-3 space-y-2">
                <div className="bg-neutral-850 h-3 rounded w-3/4" />
                <div className="bg-neutral-850 h-2.5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center text-neutral-500 py-12 text-sm font-semibold">
          No media files found in your Cloudinary account
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {media.map((item) => (
            <div
              key={item.public_id}
              className="group bg-neutral-900 border border-neutral-850 hover:border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between transition-all"
            >
              {/* IMAGE THUMBNAIL (Clicking copies the link) */}
              <div
                onClick={() => copyUrlToClipboard(item.secure_url)}
                title="Click to copy public link"
                className="relative aspect-video cursor-pointer overflow-hidden bg-black/25 flex items-center justify-center group-hover:opacity-90 transition-opacity"
              >
                <Image
                  src={item.secure_url}
                  alt="Media Library Asset"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-neutral-950/80 backdrop-blur text-white text-[10px] px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-lg border border-neutral-800">
                    <Copy size={10} />
                    Copy URL
                  </div>
                </div>
              </div>

              {/* CARD INFO & THREE DOTS POPUP MENU */}
              <div className="p-3 flex items-center justify-between gap-2 border-t border-neutral-950 bg-neutral-900/40">
                <div className="truncate flex-1">
                  <p className="text-[10px] font-mono text-neutral-400 truncate" title={item.public_id}>
                    {item.public_id.split("/").pop()}
                  </p>
                </div>

                {/* Dropdown Container */}
                <div className="relative shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdownId(activeDropdownId === item.public_id ? null : item.public_id);
                    }}
                    className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white cursor-pointer transition-colors"
                  >
                    <MoreVertical size={14} />
                  </button>

                  {activeDropdownId === item.public_id && (
                    <>
                      {/* Invisible click handler backdrop to close dropdown */}
                      <div
                        className="fixed inset-0 z-30 cursor-default"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdownId(null);
                        }}
                      />
                      {/* Absolute popup menu */}
                      <div className="absolute right-0 bottom-full mb-2 w-44 bg-neutral-950 border border-neutral-855 rounded-2xl py-1.5 shadow-2xl z-40 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <button
                          onClick={() => {
                            onSelect(item.secure_url);
                            setActiveDropdownId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <ArrowUpRight size={12} />
                          Insert in Section
                        </button>
                        <button
                          onClick={() => {
                            copyUrlToClipboard(item.secure_url);
                            setActiveDropdownId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Copy size={12} />
                          Copy Link
                        </button>
                        <div className="h-[1px] bg-neutral-900 my-1" />
                        <button
                          onClick={() => {
                            handleDelete(item.public_id);
                            setActiveDropdownId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 size={12} />
                          Delete Image
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TOAST NOTIFICATION POPUP */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold px-4.5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="h-4 w-4 bg-green-500/15 rounded-full flex items-center justify-center">
            <Check className="text-green-500" size={10} />
          </div>
          {toast}
        </div>
      )}
    </div>
  );
}