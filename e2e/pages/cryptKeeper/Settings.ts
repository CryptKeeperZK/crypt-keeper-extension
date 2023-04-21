import BasePage from "../BasePage";

export default class Settings extends BasePage {
  async openPage(): Promise<void> {
    await this.page.getByTestId("menu").first().click();
    await this.page.getByText("Settings", { exact: true }).click();
  }

  async toggleHistoryTracking(): Promise<void> {
    await this.page.getByLabel("Keep track history").click();
  }

  async clearHistory(): Promise<void> {
    await this.page.getByText("Clear operation history", { exact: true }).click();
    await this.page.getByText("Yes").click();
  }
}
