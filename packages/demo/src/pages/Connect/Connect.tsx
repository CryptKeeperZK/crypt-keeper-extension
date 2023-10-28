import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Markdown from "react-markdown";
import Container from "@mui/material/Container";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

import ActionBox from "@src/components/ActionBox";
import { useFileReader } from "@src/hooks";
import { useGlobalStyles } from "@src/styles";
import { useConnect } from "./useConnect";
import { useParams } from "react-router-dom";

type RouteParams = {
  isChangeIdentityParam: string;
};

const Connect = (): JSX.Element => {
  const classes = useGlobalStyles();
  const { connect } = useConnect();
  const { isChangeIdentityParam } = useParams<RouteParams>();

  const isChangeIdentity = isChangeIdentityParam === "true";
  
  const { fileContent: code } = useFileReader("connect.ts");
  const { fileContent: doc } = useFileReader("connect.md");

  return (
    <Container sx={{ flex: 1, position: "relative", top: 64 }}>
      <Box
        className={classes.popup}
        sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        <Typography variant="h6">{isChangeIdentity ? "Connect to CryptKeeper" : "To continue, please connect to your CryptKeeper to continue."}</Typography>

        <Markdown rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]]}>{doc}</Markdown>

        <ActionBox<boolean, void> code={code} option={isChangeIdentity} title="Connect Identity" onClick={connect} />
      </Box>
    </Container>
  );
};

export default Connect;