import { Paths } from "./paths";

interface IItemComponent {
  title: string;
  path?: string;
}

interface ISubHeaderComponent {
  title?: string;
  items: IItemComponent[];
}

export interface IListComponents {
  header: IItemComponent;
  subHeader?: ISubHeaderComponent[];
  items?: IItemComponent[];
}

export const DEMO: IListComponents = {
  header: {
    title: "Demo",
  },
  subHeader: [
    {
      title: "CONNECTION",
      items: [{ title: "Connect to CryptKeeper", path: Paths.CONNECT }],
    },
    {
      title: "IDENTITY MANAGEMENT",
      items: [
        { title: "Connected Identity Metadata", path: Paths.GET_IDENTITY_METADATA },
        { title: "Import Identity", path: Paths.IMPORT_IDENTITY },
        { title: "Reveal Identity Commitment", path: Paths.REVEAL_IDENTITY_COMMITMENT },
      ],
    },
    {
      title: "ZERO-KNOWLEDGE PROOFS MANAGEMENT",
      items: [
        { title: "Semaphore", path: Paths.SEMAPHORE },
        { title: "Rate-Limiting Nullifier", path: Paths.RLN },
      ],
    },
    {
      title: "External System",
      items: [{ title: "Bandada", path: Paths.BANDADA }],
    },
  ],
};

export const GETTING_STARTED: IListComponents = {
  header: {
    title: "Getting Started",
  },
  items: [
    { title: "Overview", path: Paths.OVERVIEW },
    { title: "Contributing", path: Paths.CONTRIBUTING },
  ],
};

export const REFERENCES: IListComponents = {
  header: {
    title: "References",
  },
  items: [
    { title: "Terms", path: Paths.TERMS },
    { title: "FAQ", path: Paths.FAQ },
    { title: "Resources", path: Paths.RESOURCES },
    { title: "Privacy Policy", path: Paths.PRIVACY_POLICY },
  ],
};
