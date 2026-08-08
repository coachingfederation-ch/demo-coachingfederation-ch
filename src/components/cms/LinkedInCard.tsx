/**
 * The branded 1200x627 visual that accompanies a LinkedIn post.
 * Exports: LinkedInCard, toDataUrl. Rendered off-screen at full size by
 * LinkedInShareCard.tsx and rasterised with html-to-image.
 */
import { forwardRef } from "react";
import { Mark } from "@/components/marks";
import icfLogo from "@/assets/icf-switzerland-charter-chapter.png.asset.json";
import { LINKEDIN_CARD_HEIGHT, LINKEDIN_CARD_WIDTH, type LinkedInImageMode } from "@/lib/linkedin";

export const LinkedInCard = forwardRef<
  HTMLDivElement,
  { title: string; kicker: string; mode: LinkedInImageMode; imageDataUrl: string | null }
>(function LinkedInCard({ title, kicker, mode, imageDataUrl }, ref) {
  const showPhoto = mode === "feature" && !!imageDataUrl;
  return (
    <div
      ref={ref}
      style={{ width: LINKEDIN_CARD_WIDTH, height: LINKEDIN_CARD_HEIGHT }}
      className="relative flex overflow-hidden bg-[#212251] text-white"
    >
      <div
        className={`relative z-10 flex flex-col justify-between ${showPhoto ? "w-[58%]" : "w-full"} p-14`}
      >
        <img src={icfLogo.url} alt="" className="h-20 w-auto object-contain object-left" />
        <div>
          <div className="mb-5 text-[15px] font-bold uppercase tracking-[0.22em] text-[#EFCB30]">
            {kicker}
          </div>
          <h2
            className="font-display text-[52px] font-bold leading-[1.08] tracking-tight"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h2>
          <Mark name="line2" className="mt-6 block h-6 w-64 text-[#5778FA]" />
        </div>
        <div className="text-[17px] font-semibold text-white/75">
          The Switzerland Chapter of ICF
        </div>
      </div>

      {showPhoto ? (
        <div className="relative w-[42%]">
          <img src={imageDataUrl ?? ""} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-y-0 left-0 w-32"
            style={{ background: "linear-gradient(to right, #212251, rgba(33,34,81,0))" }}
          />
        </div>
      ) : (
        <>
          <Mark
            name="circular2"
            className="pointer-events-none absolute -right-16 -top-20 h-[420px] w-[420px] text-[#2B379B]"
          />
          <Mark
            name="star2"
            className="pointer-events-none absolute bottom-10 right-24 h-40 w-40 text-[#EFCB30]"
          />
        </>
      )}
    </div>
  );
});
