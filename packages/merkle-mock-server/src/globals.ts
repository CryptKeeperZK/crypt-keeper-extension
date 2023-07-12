global.atob = (str: string) => Buffer.from(str, "base64").toString("binary");

global.btoa = (str: string) => Buffer.from(str, "binary").toString("base64");

export {};
