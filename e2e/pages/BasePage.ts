import type { Locator, Page } from "@playwright/test";

export default abstract class BasePage {
  protected readonly page: Page;

  public constructor(page: Page) {
    this.page = page;
  }

  public async open(path = "/"): Promise<void> {
    await this.page.goto(path);
  }

  public async focus(): Promise<void> {
    await this.page.bringToFront();
  }

  public async close(): Promise<void> {
    return this.page.close();
  }

  public getByText(text: string | RegExp, options?: { exact: boolean }): Locator {
    return this.page.getByText(text, options);
  }

  public getByTestId(testId: string | RegExp): Locator {
    return this.page.getByTestId(testId);
  }
}
