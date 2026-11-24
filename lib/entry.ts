// Entry requirements: links to OFFICIAL sources only. WAYFARER does not decide who may enter a country.
// Checked 22 Nov 2026 against the official portals and embassy pages listed below. Rules change; always confirm.
export interface Entry { country: string; portalName: string; portalUrl: string; facts: string[]; checkedOn: string }
export const ENTRY: Record<string, Entry> = {
  ke: { country: "Kenya", portalName: "Kenya eTA (official)", portalUrl: "https://www.etakenya.go.ke", checkedOn: "2026-11-22",
    facts: ["Most visitors must hold an approved electronic travel authorisation (eTA) before the journey starts, including children.",
      "Apply at least 3 days before travel. Official guidance gives about three working days to process, and sometimes longer.",
      "Apply only on the official site or its official app. Some groups are exempt, so check your passport."] },
  tz: { country: "Tanzania", portalName: "Tanzania Immigration online visa (official)", portalUrl: "https://visa.immigration.go.tz", checkedOn: "2026-11-22",
    facts: ["Tanzania Immigration says to apply through its official website only and not through other links.",
      "The online portal has been reported as unreliable at times, and visa on arrival is reported as an official alternative. Confirm both for your passport.",
      "Visa category and entry type can depend on nationality. Read the official guidelines."] },
  rw: { country: "Rwanda", portalName: "Rwanda Immigration (DGIE) and Irembo (official)", portalUrl: "https://www.migration.gov.rw", checkedOn: "2026-11-22",
    facts: ["Rwanda's immigration directorate says visas can be requested online through Irembo, or obtained on arrival at Kigali airport and land borders.",
      "Only migration.gov.rw and irembo.gov.rw issue authentic online visas, per Rwandan embassy guidance. Avoid agents who add fees.",
      "Eligibility and fees depend on nationality. Check before you travel."] },
};
