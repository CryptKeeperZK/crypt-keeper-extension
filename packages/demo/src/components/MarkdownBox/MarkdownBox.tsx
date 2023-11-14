import Box from "@mui/material/Box";
import { useTheme } from "@mui/styles";
import Markdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";

import { useGlobalStyles } from "@src/styles";

import MarkdownCodeBox from "../MarkdownCodeBox";
import MarkdownHeader from "../MarkdownHeader";
import MarkdownImg from "../MarkdownImg";

interface IMarkdownBox {
  doc: string;
}

// Helper function to slugify a string (convert "Some Text" to "some-text")
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-");
}

export const MarkdownBox = ({ doc }: IMarkdownBox): JSX.Element => {
  const theme = useTheme();
  const classes = useGlobalStyles(theme);

  return (
    <Box>
      <Markdown
        className={classes.markdown}
        components={{
          code({ children, className, ...rest }) {
            // Check if it's an inline code based on className
            if (!className) {
              return <code {...rest}>{children}</code>;
            }

            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : undefined;
            const value = String(children).replace(/\n$/, "");
            return language && <MarkdownCodeBox language={language} value={value} {...rest} />;
          },
          h1({ children = "", id, ref, ...rest }) {
            const finalId = id || slugify(String(children));
            return <MarkdownHeader children={children} id={finalId} variant="h1" {...rest} />;
          },
          h2({ children = "", id, ref, ...rest }) {
            const finalId = id || slugify(String(children));
            return <MarkdownHeader children={children} id={finalId} variant="h2" {...rest} />;
          },
          img({ src, alt }) {
            return <MarkdownImg alt={alt} src={src} />;
          },
        }}
        rehypePlugins={[
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: {
                style: {
                  textDecoration: "none",
                },
              },
            },
          ],
        ]}
      >
        {doc}
      </Markdown>
    </Box>
  );
};
