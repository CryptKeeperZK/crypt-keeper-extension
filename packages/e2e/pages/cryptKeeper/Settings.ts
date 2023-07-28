import fs from "fs";

import { CRYPT_KEEPER_PASSWORD } from "../../constants";
import BasePage from "../BasePage";

type SettingTabs = "General" | "Security" | "Backup";

interface IUploadBackupArgs {
  backupFilePath: string;
  password?: string;
  backupPassword?: string;
}

interface IDownloadBackupArgs {
  backupPassword?: string;
}

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

  async deleteStorage(): Promise<void> {
    await this.page.getByText("Delete storage", { exact: true }).click();
    await this.page.getByText("Yes").click();
  }

  async downloadBackup({ backupPassword = CRYPT_KEEPER_PASSWORD }: IDownloadBackupArgs = {}): Promise<string | null> {
    await this.page.getByText("Download backup", { exact: true }).click();
    await this.page.getByLabel("Password", { exact: true }).type(backupPassword);

    const [download] = await Promise.all([
      this.page.waitForEvent("download"),
      this.page.getByText("Download", { exact: true }).click(),
    ]);

    await download.path();
    const path = `./playwright-downloads/${download.suggestedFilename()}`;

    return new Promise((resolve, reject) => {
      const content = decodeURIComponent(download.url().replace("data:application/json;charset=utf-8,", ""));
      fs.writeFile(path, content, (err: Error | null) => {
        if (err) {
          reject(err);
        }

        resolve(path);
      });
    });
  }

  async uploadBackup({
    backupFilePath,
    password = CRYPT_KEEPER_PASSWORD,
    backupPassword = CRYPT_KEEPER_PASSWORD,
  }: IUploadBackupArgs): Promise<void> {
    await this.page.getByText("Upload backup", { exact: true }).click({ delay: 1000 });
    const popup = await this.page.context().waitForEvent("page");

    await popup.setInputFiles(`input[name="backupFile"]`, backupFilePath);
    await popup.getByLabel("Password", { exact: true }).type(password);
    await popup.getByLabel("Backup password", { exact: true }).type(backupPassword);

    await popup.getByText("Upload", { exact: true }).click();
  }

  async goToChangePassword(): Promise<void> {
    await this.page.getByTestId("change-password").click();
  }

  async goToRevealMnemonic(): Promise<void> {
    await this.page.getByTestId("reveal-mnemonic").click();
  }
}
