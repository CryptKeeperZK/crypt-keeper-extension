export interface CreateWindowArgs {
  type: "popup";
  focused: boolean;
  width: number;
  height: number;
  tabId?: number;
  url?: string;
}

export interface CreateTabArgs {
  url?: string;
  index?: number;
  highlighted?: boolean;
  active?: boolean;
}

export interface OpenPopupArgs {
  params?: Record<string, string>;
}
