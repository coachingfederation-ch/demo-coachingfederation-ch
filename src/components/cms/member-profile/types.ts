/**
 * Shared types and constants for the Member Area profile editor.
 *
 * Exports: Profile, LinkDraft, PracticeDraft, EMPTY_PRACTICE, and the field
 * length / bucket constants. Consumed by useMemberProfileForm and the
 * member-profile section components.
 */
import { getMyMemberProfile } from "@/lib/member-profile.functions";
import { PROFILE_IMAGE_BUCKET, PROFILE_IMAGE_PREVIEW_TTL_SECONDS } from "@/lib/storage";

export const PHOTO_BUCKET = PROFILE_IMAGE_BUCKET;
export const PHOTO_SIZE = 512;
export const DESCRIPTION_MAX = 3000;
export const TAGLINE_MAX = 160;
export const LINKS_MAX = 6;
export const RICH_TEXT_MAX = 2000;
export const NOTE_MAX = 120;
export const QUOTE_MAX = 400;
export { PROFILE_IMAGE_PREVIEW_TTL_SECONDS };

export type Profile = NonNullable<Awaited<ReturnType<typeof getMyMemberProfile>>>;
export type LinkDraft = { link_type: "website" | "linkedin" | "other"; label: string; url: string };

/** The optional free-text practice fields, kept as one flat draft object. */
export type PracticeDraft = {
  approach: string;
  qualifications: string;
  experience_band: string;
  session_length_note: string;
  fees_note: string;
  availability_note: string;
  response_time_note: string;
  booking_url: string;
  contact_email_public: boolean;
  testimonial_quote: string;
  testimonial_attribution: string;
  /** Volunteer bio for the public team page — only for operational-structure members. */
  team_bio: string;
};

export const EMPTY_PRACTICE: PracticeDraft = {
  approach: "",
  qualifications: "",
  experience_band: "",
  session_length_note: "",
  fees_note: "",
  availability_note: "",
  response_time_note: "",
  booking_url: "",
  contact_email_public: false,
  testimonial_quote: "",
  testimonial_attribution: "",
  team_bio: "",
};
