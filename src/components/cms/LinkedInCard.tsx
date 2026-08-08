/**
 * The branded 1200x742 (golden-ratio) visual that accompanies a LinkedIn post.
 * Exports: LinkedInCard, toDataUrl. Rendered off-screen at full size by
 * LinkedInShareCard.tsx and rasterised with html-to-image.
 */
import { forwardRef } from "react";
import { Mark } from "@/components/marks";
import icfLogo from "@/assets/icf-switzerland-charter-chapter.png.asset.json";
import { LINKEDIN_CARD_HEIGHT, LINKEDIN_CARD_WIDTH, type LinkedInImageMode } from "@/lib/linkedin";
import { LINKEDIN_MARK_COMPOSITIONS } from "@/lib/linkedin-visuals";

export const LinkedInCard = forwardRef<
  HTMLDivElement,
  {
    title: string;
    kicker: string;
    mode: LinkedInImageMode;
    imageDataUrl: string | null;
    /** Which brush-mark composition to draw (wraps around the table). */
    variant: number;
  }
>(function LinkedInCard({ title, kicker, mode, imageDataUrl, variant }, ref) {
  const showPhoto = mode === "feature" && !!imageDataUrl;
  const composition =
    LINKEDIN_MARK_COMPOSITIONS[
      ((variant % LINKEDIN_MARK_COMPOSITIONS.length) + LINKEDIN_MARK_COMPOSITIONS.length) %
        LINKEDIN_MARK_COMPOSITIONS.length
    ]!;

  return (
    <div
      ref={ref}
      style={{ width: LINKEDIN_CARD_WIDTH, height: LINKEDIN_CARD_HEIGHT }}
      className="relative flex flex-col overflow-hidden bg-[#212251] text-white"
    >
      {showPhoto ? null : (
        <>
          {composition.items.map((item) => (
            <Mark
              key={item.name}
              name={item.name}
              className={`pointer-events-none ${item.className}`}
            />
          ))}
        </>
      )}

      <div
        className="relative z-10 flex flex-col justify-between p-16"
        style={{ height: showPhoto ? "61.8%" : "100%" }}
      >
        <img src={icfLogo.url} alt="" className="h-24 w-auto object-contain object-left" />
        {/* Text keeps to the left 61.8% column so brush marks never sit under it. */}
        <div style={{ width: showPhoto ? "100%" : "61.8%" }}>
          <div className="mb-5 text-[17px] font-bold uppercase tracking-[0.22em] text-[#EFCB30]">
            {kicker}
          </div>
          <h2
            className="font-display text-[54px] font-bold leading-[1.08] tracking-tight"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: showPhoto ? 3 : 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </h2>
        </div>
        {showPhoto ? null : (
          <div className="text-[19px] font-semibold text-white/75">
            The Switzerland Chapter of ICF
          </div>
        )}
      </div>

      {showPhoto ? (
        <div className="relative w-full" style={{ height: "38.2%" }}>
          <img src={imageDataUrl ?? ""} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-x-0 top-0 h-28"
            style={{ background: "linear-gradient(to bottom, #212251, rgba(33,34,81,0))" }}
          />
          <div className="absolute bottom-8 left-16 text-[19px] font-semibold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            The Switzerland Chapter of ICF
          </div>
        </div>
      ) : null}
    </div>
  );
});
