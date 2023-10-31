import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import logoSVG from "@src/static/icons/logo.svg";
import { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Icon } from "@src/ui/components/Icon";

import { useJoinGroup } from "./useJoinGroup";

const JoinGroup = (): JSX.Element => {
  const {
    isLoading,
    isJoined,
    isSubmitting,
    error,
    faviconUrl,
    apiKey,
    inviteCode,
    connection,
    groupId,
    onGoBack,
    onGoToHost,
    onGoToGroup,
    onJoin,
  } = useJoinGroup();

  const isShowContent = !isJoined && Boolean(connection && groupId);
  const isShowInviteInfo = Boolean(apiKey || inviteCode);

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
    <Box data-testid="join-group-page" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <FullModalHeader onClose={onGoBack}>Join group</FullModalHeader>

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
          {isJoined && (
            <Typography
              component="div"
              data-testid="joined-text"
              fontWeight="bold"
              sx={{ textAlign: "center", mb: 3 }}
              variant="h6"
            >
              <Typography fontWeight="bold" sx={{ display: "inline" }} variant="h6">
                You have already joined this
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
                  requests to join
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
                  using your connected identity
                </Typography>
              </Typography>

              {isShowInviteInfo && (
                <Box sx={{ my: 2 }}>
                  {apiKey && <Typography>API key: {apiKey}</Typography>}

                  {inviteCode && <Typography>Invite code: {inviteCode}</Typography>}
                </Box>
              )}
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
          data-testid="join-group"
          disabled={!connection || isSubmitting || isJoined || !groupId}
          sx={{ ml: 1, width: "100%" }}
          variant="contained"
          onClick={onJoin}
        >
          Accept
        </Button>
      </FullModalFooter>
    </Box>
  );
};

export default JoinGroup;
