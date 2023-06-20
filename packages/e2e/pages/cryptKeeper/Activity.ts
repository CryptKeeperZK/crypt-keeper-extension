import BasePage from "../BasePage";

export default class Activity extends BasePage {
  async openTab(): Promise<void> {
    await this.page.getByText("Activity", { exact: true }).click();
  }

  async deleteOperation(index = 0): Promise<void> {
    const operations = await this.page.locator(".activity-row").all();
    await operations[index].getByTestId("menu").click();

    await this.page.getByText("Delete").click();
    await this.page.getByText("Yes").click();
  }
}
