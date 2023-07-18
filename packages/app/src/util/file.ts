export const readFile = async (file: Blob): Promise<ProgressEvent<FileReader>> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.addEventListener("load", resolve);
    fileReader.addEventListener("error", reject);

    fileReader.readAsText(file);
  });
