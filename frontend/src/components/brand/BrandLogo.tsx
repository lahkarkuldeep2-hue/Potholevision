import { Route } from "lucide-react";

interface BrandLogoProps {
  compact?: boolean;
}

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex shrink-0 items-center justify-center border border-[#C8A96B]/60 text-[#C8A96B] ${
        compact ? "h-9 w-9" : "h-11 w-11"
      }`}>
        <Route size={compact ? 18 : 21} strokeWidth={1.5} />
      </div>

      <div>
        <span className={`block font-semibold tracking-[0.17em] text-[#F4E9D0] ${
          compact ? "text-[14px]" : "text-[17px]"
        }`}>
          POTHOLEVISION
        </span>
        <span className="mt-0.5 block text-[8px] tracking-[0.29em] text-[#8B969E]">
          ROAD INTELLIGENCE
        </span>
      </div>
    </div>
  );
}
