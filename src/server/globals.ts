if (!global.atob) {
  global.atob = (str: string) => Buffer.from(str, "base64").toString("binary");
}

if (!global.btoa) {
  global.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");
}

export {};
