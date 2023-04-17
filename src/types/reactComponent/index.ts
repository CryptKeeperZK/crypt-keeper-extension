import { IconProp } from "@fortawesome/fontawesome-svg-core";

export type SelectOption = {
  readonly value: string;
  readonly label: string;
  readonly icon: IconProp | null;
};

export interface PasswordFormFields {
  password: string;
  confirmPassword: string;
}
