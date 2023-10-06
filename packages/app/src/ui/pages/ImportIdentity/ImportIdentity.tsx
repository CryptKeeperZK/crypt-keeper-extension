import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";

import { useImportIdentity } from "./useImportIdentity";

const ImportIdentity = (): JSX.Element => {
  const {
    faviconUrl,
    urlOrigin,
    serializedIdentity,
    serializedIdentityTooltip,
    error,
    onGoBack,
    onGoToHost,
    onSubmit,
  } = useImportIdentity();

  const isShowContent = urlOrigin && serializedIdentity;

  return (
    <Box data-testid="import-identity-page" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <FullModalHeader onClose={onGoBack}>Import identity</FullModalHeader>

      <FullModalContent>
        <Box sx={{ mx: "auto", my: 3 }}>
          <Icon size={8} url={faviconUrl || logoSVG} />
        </Box>

        {!isShowContent && (
          <Box>
            <Typography fontWeight="bold" sx={{ textAlign: "center" }} variant="h6">
              Invalid import params
            </Typography>
          </Box>
        )}

        {isShowContent && (
          <Box>
            <Box>
              <Typography component="div" fontWeight="bold" sx={{ textAlign: "center", mb: 3 }} variant="h6">
                <Typography
                  component="strong"
                  fontWeight="bold"
                  sx={{ color: "primary.main", cursor: "pointer", textDecoration: "underline", mr: 1 }}
                  variant="h6"
                  onClick={onGoToHost}
                >
                  {urlOrigin}
                </Typography>

                <Typography fontWeight="bold" sx={{ display: "inline" }} variant="h6">
                  requests to import an identity
                </Typography>
              </Typography>
            </Box>

            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Tooltip
                followCursor
                placement="top"
                title={
                  <Typography sx={{ whiteSpace: "pre-wrap" }} variant="body2">
                    {serializedIdentityTooltip}
                  </Typography>
                }
              >
                <Typography sx={{ whiteSpace: "pre-wrap", fontSize: "1.4rem", cursor: "help" }} variant="body1">
                  {serializedIdentity}
                </Typography>
              </Tooltip>
            </Box>
          </Box>
        )}

        {error && (
          <Typography color="error.main" fontSize="xs" sx={{ py: 1 }} textAlign="center">
            {error}
          </Typography>
        )}
      </FullModalContent>

      <FullModalFooter>
        <Button sx={{ mr: 1, width: "100%" }} variant="outlined" onClick={onGoBack}>
          Reject
        </Button>

        <Button
          data-testid="import-identity"
          disabled={!isShowContent}
          sx={{ ml: 1, width: "100%" }}
          variant="contained"
          onClick={onSubmit}
        >
          Accept
        </Button>
      </FullModalFooter>
    </Box>
  );
};

export default ImportIdentity;
