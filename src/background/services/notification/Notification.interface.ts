export interface CreateNotificationArgs {
  id?: string;
  options: {
    title: string;
    message: string;
    type: "basic" | "image" | "list" | "progress";
    iconUrl?: string;
  };
}
