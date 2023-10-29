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
  subHeader: ISubHeaderComponent[];
}

export const DEMO_LIST: IListComponents = {
  header: {
    title: "Demo",
  },
  subHeader: [
    {
      title: "Connection",
      items: [{ title: "Connect to CryptKeeper", path: Paths.CONNECT }],
    },
    {
      title: "Identity Management",
      items: [
        { title: "Get Identity Metadata", path: Paths.GET_IDENTITY_METADATA },
        { title: "Import Identity", path: Paths.IMPORT_IDENTITY },
        { title: "Reveal Identity Commitment", path: Paths.REVEAL_IDENTITY_COMMITMENT },
      ],
    },
    {
      title: "Zero-Knowledge Proofs Management",
      items: [
        { title: "Semaphore", path: Paths.SEMAPHORE },
        { title: "Rate-Limiting Nullifier", path: Paths.RLN },
        { title: "Bandada", path: Paths.BANDADA },
      ],
    },
  ],
};
