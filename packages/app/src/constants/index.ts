import { IdentityStrategy, IdentityWeb2Provider, SelectOption } from "@src/types";

export const WEB2_PROVIDER_OPTIONS: readonly SelectOption[] = [
  { value: "twitter", label: "Twitter", icon: ["fab", "twitter"] },
  { value: "reddit", label: "Reddit", icon: ["fab", "reddit"] },
  { value: "github", label: "Github", icon: ["fab", "github"] },
];

export const IDENTITY_TYPES: readonly SelectOption[] = [
  { value: "interrep", label: "InterRep", icon: null },
  { value: "random", label: "Random", icon: null },
];

export const WEB2_PROVIDER_TITLE_MAP: Record<IdentityWeb2Provider, string> = {
  twitter: "Twitter",
  reddit: "Reddit",
  github: "Github",
};

export const IDENTITY_TYPES_TITLE_MAP: Record<IdentityStrategy, string> = {
  interrep: "InterRep",
  random: "Random",
};

export enum BrowserPlatform {
  Brave = "Brave",
  Chrome = "Chrome",
  Edge = "Edge",
  Firefox = "Firefox",
  Opera = "Opera",
}

export { Paths } from "./paths";
