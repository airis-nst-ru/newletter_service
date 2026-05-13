import Image from "next/image";

type BrandIdentityProps = {
  compact?: boolean;
};

export function BrandIdentity({ compact = false }: BrandIdentityProps) {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="AIRIS Logo"
        width={compact ? 44 : 160}
        height={compact ? 44 : 160}
        priority
        className={
          compact
            ? "h-11 w-11 drop-shadow-[0_0_18px_rgba(176,106,179,0.3)]"
            : "mx-auto mb-7 h-auto max-w-[160px] drop-shadow-[0_0_24px_rgba(176,106,179,0.35)]"
        }
      />
      {compact ? (
        <div>
          <h1 className="bg-gradient-to-br from-[#b06ab3] to-[#d4a5d6] bg-clip-text text-xl font-bold text-transparent">
            AIRIS Chronicle
          </h1>
          <p className="text-sm text-[#a0a0a0]">
            The official newsletter service by AIRIS.
          </p>
        </div>
      ) : null}
    </div>
  );
}
