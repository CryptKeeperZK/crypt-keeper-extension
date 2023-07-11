import { SelectOption } from "@src/types";

export const WEB2_PROVIDER_OPTIONS: readonly SelectOption[] = [
  { value: "twitter", label: "Twitter", icon: ["fab", "twitter"] },
  { value: "reddit", label: "Reddit", icon: ["fab", "reddit"] },
  { value: "github", label: "Github", icon: ["fab", "github"] },
];

export const IDENTITY_TYPES: readonly SelectOption[] = [
  { value: "interrep", label: "InterRep", icon: null },
  { value: "random", label: "Random", icon: null },
];

export const BROWSER_PLATFORM_BRAVE = "Brave";
export const BROWSER_PLATFORM_CHROME = "Chrome";
export const BROWSER_PLATFORM_EDGE = "Edge";
export const BROWSER_PLATFORM_FIREFOX = "Firefox";
export const BROWSER_PLATFORM_OPERA = "Opera";

export * from "./paths";
