// DEMO DATA. Every figure here is a placeholder, not a supplier quote.
// Replace with rates collected from real suppliers (see README "Make it real").
export interface Dest {
  id: string; name: string; country: string; hoursFromNairobi: number; baseNights: number;
  assembled: { flights: number; lodges: number; parks: number; ground: number }; // for 2 travellers over baseNights
  packagePrice: number; packageName: string; packageIncludes: string; supplierRoles: string[];
}
export const DESTINATIONS: Dest[] = [
  { id: "ke", name: "Masai Mara and Amboseli", country: "Kenya", hoursFromNairobi: 5.5, baseNights: 8,
    assembled: { flights: 600, lodges: 4200, parks: 1600, ground: 1600 }, packagePrice: 8350,
    packageName: "Savanna classic package", packageIncludes: "8 nights, 2 parks, vehicle and guide, park fees",
    supplierRoles: ["Mara camp", "Amboseli lodge", "Safari vehicle and guide", "Nairobi-Mara flight"] },
  { id: "tz", name: "Serengeti and Ngorongoro", country: "Tanzania", hoursFromNairobi: 8, baseNights: 8,
    assembled: { flights: 900, lodges: 4700, parks: 1900, ground: 1600 }, packagePrice: 8650,
    packageName: "Serengeti circuit package", packageIncludes: "8 nights, 3 parks, vehicle and guide, park fees",
    supplierRoles: ["Serengeti camp", "Ngorongoro lodge", "Safari vehicle and guide", "Arusha-Serengeti flight"] },
  { id: "rw", name: "Volcanoes and Akagera", country: "Rwanda", hoursFromNairobi: 4.5, baseNights: 7,
    assembled: { flights: 400, lodges: 3900, parks: 3900, ground: 1200 }, packagePrice: 9350,
    packageName: "Primates and plains package", packageIncludes: "7 nights, gorilla permits, Akagera game drives",
    supplierRoles: ["Volcanoes lodge", "Akagera lodge", "Driver and guide", "Permit handling"] },
];
// Assumed commission rates by component, used only for the internal business view.
export const COMMISSION = { flights: 0.05, lodges: 0.15, parks: 0.0, ground: 0.12, package: 0.1 };
