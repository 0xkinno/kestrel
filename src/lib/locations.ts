export type HazardFocus = "FLOOD" | "DROUGHT" | "EXTREME_HEAT";

export interface SeedLocation {
  name: string;
  ward: string;
  country: string;
  lat: number;
  lng: number;
  /** Primary hazard type this location is monitored for - keeps the demo's rule thresholds meaningful per place. */
  hazardFocus: HazardFocus;
}

/**
 * Real IGAD member-state locations with real approximate coordinates.
 * Ward/locality names are real named sub-areas of each town, used here at
 * illustrative (not survey-grade) precision for the hyperlocal framing.
 */
export const SEED_LOCATIONS: SeedLocation[] = [
  {
    name: "Lodwar",
    ward: "Kalobeyei",
    country: "Kenya",
    lat: 3.1191,
    lng: 35.5973,
    hazardFocus: "DROUGHT",
  },
  {
    name: "Gambela",
    ward: "Itang",
    country: "Ethiopia",
    lat: 8.25,
    lng: 34.5833,
    hazardFocus: "FLOOD",
  },
  {
    name: "Baidoa",
    ward: "Berdale",
    country: "Somalia",
    lat: 3.1167,
    lng: 43.65,
    hazardFocus: "DROUGHT",
  },
  {
    name: "Kassala",
    ward: "Khatmia",
    country: "Sudan",
    lat: 15.45,
    lng: 36.4,
    hazardFocus: "FLOOD",
  },
  {
    name: "Juba",
    ward: "Gudele",
    country: "South Sudan",
    lat: 4.8517,
    lng: 31.5825,
    hazardFocus: "FLOOD",
  },
  {
    name: "Moroto",
    ward: "Rupa",
    country: "Uganda",
    lat: 2.5333,
    lng: 34.6667,
    hazardFocus: "DROUGHT",
  },
  {
    name: "Djibouti City",
    ward: "Balbala",
    country: "Djibouti",
    lat: 11.5721,
    lng: 43.1456,
    hazardFocus: "EXTREME_HEAT",
  },
  {
    name: "Massawa",
    ward: "Taulud",
    country: "Eritrea",
    lat: 15.61,
    lng: 39.4478,
    hazardFocus: "EXTREME_HEAT",
  },
];
