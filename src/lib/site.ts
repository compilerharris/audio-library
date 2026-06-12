/**
 * Central site/organization configuration.
 * Used by the donation modal, about section and footer.
 */
export const SITE = {
  name: "Noor Audio Library",
  shortName: "Noor",
  tagline: "Timeless knowledge, beautifully preserved.",
  mission:
    "We record, restore and freely share long-form Islamic lectures — from Qur'anic tafsir to the sciences of the heart — so that authentic knowledge remains within reach of every seeker, in every language.",
  email: "salam@nooraudio.org",
  socials: {
    instagram: "https://instagram.com/nooraudio",
    youtube: "https://youtube.com/@nooraudio",
    facebook: "https://facebook.com/nooraudio",
    telegram: "https://t.me/nooraudio",
  },
  donation: {
    /** Encoded into the QR code. */
    url: "https://donate.nooraudio.org",
    note: "Every contribution goes directly to hosting, restoration of archival recordings, and producing new lectures.",
    details: [
      { label: "Bank", value: "Al Amanah Bank" },
      { label: "Account name", value: "Noor Audio Foundation" },
      { label: "IBAN", value: "AE07 0331 2345 6789 0123 456" },
      { label: "Reference", value: "LIBRARY-DONATION" },
    ],
  },
} as const;
