import { Controller } from "react-hook-form";

import { getEnabledFeatures } from "@src/config/features";
import { IDENTITY_TYPES, WEB2_PROVIDER_OPTIONS } from "@src/constants";
import { Button } from "@src/ui/components/Button";
import { Dropdown } from "@src/ui/components/Dropdown";
import { FullModal, FullModalContent, FullModalFooter, FullModalHeader } from "@src/ui/components/FullModal";
import { Input } from "@src/ui/components/Input";

import "./createIdentityStyles.scss";
import { useCreateIdentity } from "./useCreateIdentity";

const CreateIdentity = (): JSX.Element => {
  const features = getEnabledFeatures();
  const { isLoading, isProviderAvailable, errors, control, closeModal, onSubmit } = useCreateIdentity();

  return (
    <FullModal data-testid="create-identity-page" onClose={closeModal}>
      <form className="create-identity-form" onSubmit={onSubmit}>
        <FullModalHeader onClose={closeModal}>Create Identity</FullModalHeader>

        <FullModalContent>
          {features.RANDOM_IDENTITY && (
            <Controller
              control={control}
              defaultValue={IDENTITY_TYPES[0]}
              name="identityStrategyType"
              render={({ field }) => (
                <Dropdown
                  {...field}
                  className="my-2"
                  errorMessage={errors.identityStrategyType}
                  id="identityStrategyType"
                  label="Identity type"
                  options={IDENTITY_TYPES}
                />
              )}
              rules={{ required: "Identity strategy type is required" }}
            />
          )}

          {isProviderAvailable && (
            <>
              <Controller
                control={control}
                defaultValue={WEB2_PROVIDER_OPTIONS[0]}
                name="web2Provider"
                render={({ field }) => (
                  <Dropdown
                    {...field}
                    className="my-2"
                    errorMessage={errors.web2Provider}
                    id="web2Provider"
                    label="Web2 Provider"
                    options={WEB2_PROVIDER_OPTIONS}
                  />
                )}
                rules={{ required: "Provider is required" }}
              />

              <Controller
                control={control}
                defaultValue={0}
                name="nonce"
                render={({ field }) => (
                  <Input {...field} className="my-2" errorMessage={errors.nonce} id="nonce" label="Nonce" />
                )}
                rules={{ required: "Nonce is required", min: { value: 0, message: "Nonce must be positive number" } }}
              />
            </>
          )}
        </FullModalContent>

        {errors.root && <div className="text-xs text-red-500 text-center pb-1">{errors.root}</div>}

        <FullModalFooter>
          <Button loading={isLoading} type="submit">
            Create
          </Button>
        </FullModalFooter>
      </form>
    </FullModal>
  );
};

export default CreateIdentity;
