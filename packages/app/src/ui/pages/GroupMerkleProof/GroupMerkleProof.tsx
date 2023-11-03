import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";

import { useGroupMerkleProof } from "./useGroupMerkleProof";

const GroupMerkleProof = (): JSX.Element => {
  const {
    isLoading,
    isSubmitting,
    isJoined,
    error,
    faviconUrl,
    connection,
    groupId,
    onGoBack,
    onGoToHost,
    onGoToGroup,
    onGenerateMerkleProof,
  } = useGroupMerkleProof();

  const isShowContent = isJoined && Boolean(connection && groupId);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          height: "100%",
        }}
      >
        Loading...
      </Box>
    );
  }

  return (
    <Box data-testid="group-merkle-proof-page" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <FullModalHeader onClose={onGoBack}>Group Merkle Proof</FullModalHeader>

      <FullModalContent>
        <Box sx={{ mx: "auto", my: 3 }}>
          <Icon size={8} url={faviconUrl || logoSVG} />
        </Box>

        {!connection && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography fontWeight="bold" sx={{ textAlign: "center", mb: 2 }} variant="h6">
              No connected identity found
            </Typography>
          </Box>
        )}

        {!groupId && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <Typography fontWeight="bold" sx={{ textAlign: "center" }} variant="h6">
              No group found
            </Typography>
          </Box>
        )}

        <Box>
          {!isJoined && (
            <Typography
              component="div"
              data-testid="not-joined-text"
              fontWeight="bold"
              sx={{ textAlign: "center", mb: 3 }}
              variant="h6"
            >
              <Typography fontWeight="bold" sx={{ display: "inline" }} variant="h6">
                You are not a
              </Typography>

              <Typography
                component="strong"
                fontWeight="bold"
                sx={{ color: "primary.main", cursor: "pointer", textDecoration: "underline", mx: 1 }}
                variant="h6"
                onClick={onGoToGroup}
              >
                Group
              </Typography>

              <Typography fontWeight="bold" sx={{ display: "inline" }} variant="h6">
                member
              </Typography>
            </Typography>
          )}

          {isShowContent && (
            <Box>
              <Typography component="div" fontWeight="bold" sx={{ textAlign: "center", mb: 3 }} variant="h6">
                <Typography
                  component="strong"
                  fontWeight="bold"
                  sx={{ color: "primary.main", cursor: "pointer", textDecoration: "underline", mr: 1 }}
                  variant="h6"
                  onClick={onGoToHost}
                >
                  {connection!.urlOrigin}
                </Typography>

                <Typography fontWeight="bold" sx={{ display: "inline" }} variant="h6">
                  requests to prove your
                </Typography>

                <Typography
                  component="strong"
                  fontWeight="bold"
                  sx={{ color: "primary.main", cursor: "pointer", textDecoration: "underline", mx: 1 }}
                  variant="h6"
                  onClick={onGoToGroup}
                >
                  Group
                </Typography>

                <Typography fontWeight="bold" sx={{ display: "inline" }} variant="h6">
                  membership
                </Typography>
              </Typography>
            </Box>
          )}
        </Box>

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
          data-testid="generate-merkle-proof"
          disabled={!connection || isSubmitting || !isJoined || !groupId}
          sx={{ ml: 1, width: "100%" }}
          variant="contained"
          onClick={onGenerateMerkleProof}
        >
          Accept
        </Button>
      </FullModalFooter>
    </Box>
  );
};

export default GroupMerkleProof;
