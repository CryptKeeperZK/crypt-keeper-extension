import { Option } from "@src/types";
import { faTwitter, faGithub, faReddit } from '@fortawesome/free-brands-svg-icons';

export const WEB2_PROVIDER_OPTIONS: readonly Option[] = [{ value: "Twitter", label: "Twitter", icon: faTwitter }, { value: "Reddit", label: "Reddit", icon: faReddit }, { value: "Github", label: "Github", icon: faGithub }];
export const IDENTITY_TYPES: readonly Option[] = [{ value: "InterRep", label: "InterRep", icon: null }, { value: "Random", label: "Random", icon: null }];
