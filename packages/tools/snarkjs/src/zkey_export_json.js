import { readZKey as readZKey } from "./zkey_utils.js";
import { utils } from "@cryptkeeperzk/ffjavascript";

export default async function zkeyExportJson(zkeyFileName) {

    const zKey = await readZKey(zkeyFileName, true);
    delete zKey.curve;
    delete zKey.F;

    return utils.stringifyBigInts(zKey);
}
