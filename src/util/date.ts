const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "long",
});

export const formatDate = (isoDate: Date): string => formatter.format(isoDate);
