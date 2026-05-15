"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useDropzone }
from "react-dropzone";

import Image from "next/image";

import {
  Copy,
  Upload,
  Loader2,
  Check,
} from "lucide-react";

interface Props {
  onSelect: (
    url: string
  ) => void;
}

interface MediaItem {
  secure_url: string;
  public_id: string;
}

export default function MediaManager({
  onSelect,
}: Props) {
  const [uploading, setUploading] =
    useState(false);

  const [media, setMedia] =
    useState<MediaItem[]>([]);

  const [copied, setCopied] =
    useState("");

  // FETCH MEDIA
  const fetchMedia =
    async () => {
      try {
        const response =
          await fetch(
            "/api/v1/media"
          );

        const data =
          await response.json();

        if (data.success) {
          setMedia(data.data);
        }
      } catch (error) {
        console.log(error);
      }
    };

  useEffect(() => {
    fetchMedia();
  }, []);

  // UPLOAD
  const onDrop = useCallback(
    async (
      acceptedFiles: File[]
    ) => {
      try {
        const file =
          acceptedFiles[0];

        if (!file) {
          return;
        }

        setUploading(true);

        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        const response =
          await fetch(
            "/api/v1/media/upload",
            {
              method: "POST",
              body: formData,
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message
          );
        }

        setMedia((prev) => [
          {
            secure_url:
              data.data.url,

            public_id:
              data.data.publicId,
          },
          ...prev,
        ]);
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,

    accept: {
      "image/*": [],
    },
  });

  const copyUrl = async (
    url: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        url
      );

      setCopied(url);

      setTimeout(() => {
        setCopied("");
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full">

      {/* DROPZONE */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all mb-10 ${
          isDragActive
            ? "border-white bg-neutral-900"
            : "border-neutral-700"
        }`}
      >
        <input
          {...getInputProps()}
        />

        {uploading ? (
          <>
            <Loader2 className="animate-spin mb-4" />

            <p className="text-lg">
              Uploading image...
            </p>
          </>
        ) : (
          <>
            <Upload className="mb-4 w-8 h-8" />

            <p className="text-xl font-semibold">
              Drop images here
            </p>

            <p className="text-sm text-neutral-500 mt-2">
              or click to upload
            </p>
          </>
        )}
      </div>

      {/* MEDIA GRID */}
      {media.length === 0 ? (
        <div className="text-center text-neutral-500 py-10">
          No media uploaded yet
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {media.map((item) => (
            <div
              key={item.public_id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden"
            >

              {/* IMAGE */}
              <div className="relative aspect-video">
                <Image
                  src={
                    item.secure_url
                  }
                  alt="Media"
                  fill
                  className="object-cover"
                />
              </div>

              {/* ACTIONS */}
              <div className="p-4 flex flex-col gap-3">

                {/* INSERT */}
                <button
                  onClick={() =>
                    onSelect(
                      item.secure_url
                    )
                  }
                  className="bg-white text-black rounded-xl py-2 font-semibold"
                >
                  Insert Image
                </button>

                {/* COPY URL */}
                <button
                  onClick={() =>
                    copyUrl(
                      item.secure_url
                    )
                  }
                  className="border border-neutral-700 rounded-xl py-2 flex items-center justify-center gap-2 hover:bg-neutral-800"
                >
                  {copied ===
                  item.secure_url ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy URL
                    </>
                  )}
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}