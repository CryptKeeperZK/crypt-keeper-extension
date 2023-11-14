import { Identity } from "@cryptkeeperzk/semaphore-identity";
import { bigintToHex } from "bigint-conversion";

export const genMockIdentityCommitments = (): string[] => {
  const identityCommitments: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const mockIdentity = new Identity();
    const idCommitment = bigintToHex(mockIdentity.getCommitment());

    identityCommitments.push(idCommitment);
  }
  return identityCommitments;
};

export const ellipsify = (text: string, start = 6, end = 4): string => {
  if (text.length - end <= start) {
    return text;
  }

  return `${text.slice(0, start)}...${text.slice(text.length - end, text.length)}`;
};

export const loadFile = async (filePath: string): Promise<string> => {
  const response = await fetch(filePath);
  const data: string = await response.text();
  return data;
};

export const replaceUrlParams = (path: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((acc, [key, value]) => acc.replace(`:${key}`, value), path);

export function handleHeadingClick(event: React.MouseEvent, id: string) {
  event.preventDefault();

  const targetElement = document.getElementById(id);
  if (targetElement) {
    window.scrollTo({
      top: targetElement.offsetTop - 25,
      behavior: "smooth",
    });
  }
}

export const injectMarkdownCode = (doc: string, codeSnippets: Record<string, string>): string => {
  let injectedMarkdown = doc;

  for (let snippetKey in codeSnippets) {
    const placeholder = `// ${snippetKey}`;
    injectedMarkdown = injectedMarkdown.replace(placeholder, codeSnippets[+snippetKey]);
  }

  return injectedMarkdown;
};
