import BasePage from "../BasePage";

type SettingTabs = "General" | "Advanced";

export default class Settings extends BasePage {
  async openPage(): Promise<void> {
    await this.page.getByTestId("menu").first().click();
    await this.page.getByText("Settings", { exact: true }).click();
  }

  async openTab(tab: SettingTabs): Promise<void> {
    await this.page.getByText(tab, { exact: true }).click();
  }

  async toggleHistoryTracking(): Promise<void> {
    await this.page.getByLabel("Keep track history").click();
  }

  async clearHistory(): Promise<void> {
    await this.page.getByText("Clear operation history", { exact: true }).click();
    await this.page.getByText("Yes").click();
  }

  async deleteAllIdentities(): Promise<void> {
    await this.page.getByText("Delete all identities").click();
    await this.page.getByText("Yes").click();
  }
}
