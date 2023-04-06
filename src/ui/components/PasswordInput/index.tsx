import { InputAdornment, Tooltip } from "@mui/material";
import { useShowPassword } from "@src/ui/hooks/showPassword";
import { FC, VFC } from "react";
import { UseFormRegister } from "react-hook-form";
import { Icon } from "../Icon";
import { Input } from "../Input";

export interface PasswordInputProps<FormFields> {
    className?: string;
    isShowInfo: boolean;
    register: UseFormRegister<FormFields>;
}

//type PasswordInput = (<FormFields>(props: PasswordInputProps<FormFields>) => ReturnType<FC>) & VFC<PasswordInputProps<{}>>;

export function PasswordInpu3t<FormFields>({ className, isShowInfo, register, ...rest }: PasswordInputProps<FormFields>): JSX.Element {
    const { isShowPassword, setShowPassword } = useShowPassword();

    return (
        <div className="py-4 w-full" data-testid="showen-inputs">
            <Input
                autoFocus
                className="mb-4"
                endAdornment={
                    <InputAdornment position="end">
                        {isShowInfo ? (<Tooltip
                            key={1}
                            className="info-tooltip"
                            title={
                                <div>
                                    <p>Password requirements:</p>

                                    <p>- At least 8 characters</p>

                                    <p>- At least 1 upper case and letter</p>

                                    <p>- At least 1 lower case letter</p>

                                    <p>- At least 1 special character (!@#$%^&*)</p>

                                    <p>- At least 1 number</p>
                                </div>
                            }
                        >
                            <Icon className="info-icon" fontAwesome="fa-info" />
                        </Tooltip>) : null}

                        {isShowPassword ? (
                            <Tooltip
                                key={2}
                                className="eye-tooltip"
                                data-testid="eye-slash-button"
                                title="Hide Password"
                                onClick={setShowPassword}
                            >
                                <Icon className="info-icon" fontAwesome="fa-eye-slash" />
                            </Tooltip>
                        ) : (
                            <Tooltip
                                key={2}
                                className="eye-tooltip"
                                data-testid="eye-look-button"
                                title="Show Password"
                                onClick={setShowPassword}
                            >
                                <Icon className="info-icon" fontAwesome="fa-eye" />
                            </Tooltip>
                        )}
                    </InputAdornment>
                }
                errorMessage={errors.password}
                id="password"
                label="Password"
                type={isShowPassword ? "text" : "password"}
                {...register("password")}
            />

            <Input
                errorMessage={errors.confirmPassword}
                id="confirmPassword"
                label="Confirm Password"
                type={isShowPassword ? "text" : "password"}
                {...register("confirmPassword")}
            />
        </div>
    )
}

// export const PasswordInput: PasswordInput = ({ className, isShowInfo, register, ...rest }: PasswordInputProps<FormFields>): JSX.Element => {

   
// }
