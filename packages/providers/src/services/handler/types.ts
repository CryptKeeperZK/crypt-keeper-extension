export interface RequestsPromisesHandlers {
  resolve: (res?: unknown) => void;
  reject: (reason?: unknown) => void;
}
