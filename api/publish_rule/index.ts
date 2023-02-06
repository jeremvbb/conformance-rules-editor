import { parseDocument } from "yaml";
import { STORAGE_PROVIDER } from "../providers/BaseStorage";
import handle_response from "../utils/handle_response";

const next_core_id = async () =>
  `CORE-${(parseInt((await STORAGE_PROVIDER.maxCoreId()).slice(-6)) + 1)
    .toString()
    .padStart(6, "0")}`;

export default async (context, req) => {
  await handle_response(context, async () => {
    const rule = await STORAGE_PROVIDER.getRule(context.bindingData.id);
    const doc = parseDocument(rule.content);
    if (!doc.has("Core")) {
      doc.set("Core", doc.createNode({}));
    }
    const core: any = doc.get("Core");
    if (!/^CORE-\d{6}$/.test(core.get("Id") ?? "")) {
      core.set("Id", await next_core_id());
    }
    core.set("Status", "Published");
    rule.json = doc.toJSON();
    rule.content = doc.toString();
    return {
      body: await STORAGE_PROVIDER.patchRule(context.bindingData.id, rule),
    };
  });
};