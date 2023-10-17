import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { BigNumberInput } from "@src/ui/components/BigNumberInput";
import { FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Input } from "@src/ui/components/Input";
import { UploadButton } from "@src/ui/components/UploadButton";

import { useImportIdentity } from "./useImportIdentity";

const ImportIdentity = (): JSX.Element => {
  const { isLoading, urlOrigin, errors, trapdoor, nullifier, register, onGoBack, onGoToHost, onDrop, onSubmit } =
    useImportIdentity();

  return (
    <Box
      component="form"
      data-testid="import-identity-page"
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <FullModalHeader onClose={onGoBack}>Import identity</FullModalHeader>

      <FullModalContent>
        <Box>
          <Box>
            {urlOrigin && (
              <Typography component="div" fontWeight="bold" sx={{ textAlign: "left", mb: 1 }} variant="h6">
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
            )}

            {!urlOrigin && (
              <Typography component="div" fontWeight="bold" sx={{ textAlign: "left", mb: 1 }} variant="h6">
                Import identity with trapdoor and nullifier
              </Typography>
            )}
          </Box>

          <Box>
            <Box sx={{ mb: 2 }}>
              <Input
                autoFocus
                errorMessage={errors.name}
                id="name"
                label="Name"
                placeholder="Enter identity name"
                size="small"
                type="text"
                variant="filled"
                {...register("name", { required: "Name is required" })}
              />
            </Box>

            <UploadButton
              accept={{ "application/json": [".json"] }}
              isLoading={isLoading}
              multiple={false}
              name="file"
              onDrop={onDrop}
            />

            <Typography sx={{ textAlign: "center", my: 1 }}>Or enter data manually</Typography>

            <Box sx={{ mb: 2 }}>
              <BigNumberInput
                errorMessage={errors.trapdoor}
                id="trapdoor"
                label="Trapdoor"
                placeholder="Enter identity trapdoor"
                size="small"
                type="text"
                value={trapdoor}
                variant="filled"
                {...register("trapdoor", {
                  required: "Identity trapdoor is required",
                })}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <BigNumberInput
                errorMessage={errors.nullifier}
                id="nullifier"
                label="Nullifier"
                placeholder="Enter identity nullifier"
                size="small"
                type="text"
                value={nullifier}
                variant="filled"
                {...register("nullifier", {
                  required: "Identity nullifier is required",
                })}
              />
            </Box>
          </Box>
        </Box>

        {errors.root && (
          <Typography color="error.main" fontSize="xs" sx={{ my: 1 }} textAlign="center">
            {errors.root}
          </Typography>
        )}
      </FullModalContent>

      <FullModalFooter>
        <Button sx={{ mr: 1, width: "100%" }} variant="outlined" onClick={onGoBack}>
          Reject
        </Button>

        <Button
          data-testid="import-identity"
          disabled={isLoading}
          sx={{ ml: 1, width: "100%" }}
          type="submit"
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
