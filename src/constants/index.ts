import { SelectOption } from "@src/types";
import { faTwitter, faGithub, faReddit } from "@fortawesome/free-brands-svg-icons";

export const WEB2_PROVIDER_OPTIONS: readonly SelectOption[] = [
  { value: "twitter", label: "Twitter", icon: faTwitter },
  { value: "reddit", label: "Reddit", icon: faReddit },
  { value: "github", label: "Github", icon: faGithub },
];

export const IDENTITY_TYPES: readonly SelectOption[] = [
  { value: "interrep", label: "InterRep", icon: null },
  { value: "random", label: "Random", icon: null },
];

export * from "./rpcActions";
