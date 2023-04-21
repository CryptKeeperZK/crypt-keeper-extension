import type { Locator, Page } from "@playwright/test";

export default abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(path = "/"): Promise<void> {
    await this.page.goto(path);
  }

  async focus(): Promise<void> {
    await this.page.bringToFront();
  }

  async close(): Promise<void> {
    return this.page.close();
  }

  getByText(text: string | RegExp, options?: { exact: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  getByTestId(testId: string | RegExp): Locator {
    return this.page.getByTestId(testId);
  }
}
