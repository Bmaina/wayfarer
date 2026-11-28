// DEMO DATA. Every figure here is a placeholder, not a supplier quote.
// Replace with rates collected from real suppliers (see README "Make it real").
export interface Dest {
  id: string; kind: "safari" | "beach"; name: string; country: string; hoursFromNairobi: number; baseNights: number;
  assembled: { flights: number; lodges: number; parks: number; ground: number }; // for 2 travellers over baseNights
  packagePrice: number; packageName: string; packageIncludes: string; supplierRoles: string[];
}
export const DESTINATIONS: Dest[] = [
  { id: "ke", kind: "safari", name: "Masai Mara and Amboseli", country: "Kenya", hoursFromNairobi: 5.5, baseNights: 8,
    assembled: { flights: 600, lodges: 4200, parks: 1600, ground: 1600 }, packagePrice: 8350,
    packageName: "Savanna classic package", packageIncludes: "8 nights, 2 parks, vehicle and guide, park fees",
    supplierRoles: ["Mara camp", "Amboseli lodge", "Safari vehicle and guide", "Nairobi-Mara flight"] },
  { id: "tz", kind: "safari", name: "Serengeti and Ngorongoro", country: "Tanzania", hoursFromNairobi: 8, baseNights: 8,
    assembled: { flights: 900, lodges: 4700, parks: 1900, ground: 1600 }, packagePrice: 8650,
    packageName: "Serengeti circuit package", packageIncludes: "8 nights, 3 parks, vehicle and guide, park fees",
    supplierRoles: ["Serengeti camp", "Ngorongoro lodge", "Safari vehicle and guide", "Arusha-Serengeti flight"] },
  { id: "rw", kind: "safari", name: "Volcanoes and Akagera", country: "Rwanda", hoursFromNairobi: 4.5, baseNights: 7,
    assembled: { flights: 400, lodges: 3900, parks: 3900, ground: 1200 }, packagePrice: 9350,
    packageName: "Primates and plains package", packageIncludes: "7 nights, gorilla permits, Akagera game drives",
    supplierRoles: ["Volcanoes lodge", "Akagera lodge", "Driver and guide", "Permit handling"] },
  { id: "zz", kind: "beach", name: "Zanzibar", country: "Tanzania", hoursFromNairobi: 3, baseNights: 6,
    assembled: { flights: 500, lodges: 3000, parks: 600, ground: 400 }, packagePrice: 4800,
    packageName: "Spice coast beach package", packageIncludes: "6 nights beach resort, Stone Town visit, transfers",
    supplierRoles: ["Zanzibar beach resort", "Stone Town guide", "Airport and island transfers", "Nairobi-Zanzibar flight"] },
  { id: "sc", kind: "beach", name: "Seychelles", country: "Seychelles", hoursFromNairobi: 6, baseNights: 6,
    assembled: { flights: 1400, lodges: 5400, parks: 700, ground: 500 }, packagePrice: 8500,
    packageName: "Granite islands package", packageIncludes: "6 nights island stay, one island excursion, transfers",
    supplierRoles: ["Seychelles island hotel", "Inter-island ferry or flight", "Excursion operator", "Nairobi-Mahe flight"] },
  { id: "mv", kind: "beach", name: "Maldives", country: "Maldives", hoursFromNairobi: 12, baseNights: 6,
    assembled: { flights: 1800, lodges: 7200, parks: 800, ground: 1400 }, packagePrice: 11900,
    packageName: "Atoll resort package", packageIncludes: "6 nights resort, speedboat or seaplane transfers",
    supplierRoles: ["Maldives resort", "Seaplane or speedboat transfer", "Dive or excursion operator", "Flights to Male"] },
];
// Assumed commission rates by component, used only for the internal business view.
export const COMMISSION = { flights: 0.05, lodges: 0.15, parks: 0.0, ground: 0.12, package: 0.1 };
