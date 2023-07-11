import BasePage from "../BasePage";

export default class Recover extends BasePage {
  async open(): Promise<void> {
    await this.page.getByText("Forgot password?", { exact: true }).click();
  }

  async checkMnemonic(mnemonic: string): Promise<void> {
    await this.page.getByTestId("mnemonic-input").type(mnemonic);
    await this.page.getByText("Restore", { exact: true }).click();
  }

  async resetPassword(password: string, confirmPassword = password): Promise<void> {
    await this.page.getByLabel("Password", { exact: true }).type(password);
    await this.page.getByLabel("Confirm Password", { exact: true }).type(confirmPassword);
    await this.page.getByText("Reset", { exact: true }).click();
  }

  async getMnemonic(password: string): Promise<string> {
    await this.page.getByLabel("Password", { exact: true }).type(password);
    await this.page.getByTestId("unlock-button").click();

    await this.page.getByText("Show", { exact: true }).click();
    return this.page.getByTestId("mnemonic-input").locator("textarea").first().inputValue();
  }
}
