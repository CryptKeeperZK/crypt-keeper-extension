export const createModalRoot = (): void => {
  const container = document.createElement("div");
  container.id = "modal";
  document.body.append(container);
};

export const deleteModalRoot = (): void => {
  const container = document.getElementById("modal");
  document.body.removeChild(container as HTMLElement);
};
