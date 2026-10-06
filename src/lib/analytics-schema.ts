import { z } from "zod";
import { eventNames } from "./analytics";

export const analyticsEventSchema = z.strictObject({
  name: z.enum(eventNames),
  path: z.string().max(160).regex(/^\/(en|es)(\/(work(\/(amiloz|nixtla))?|agents|privacy|resume\/(founder|employee)|v2(\/resume\/(founder|employee))?))?$/),
  visitor: z.uuid(),
  consent: z.literal(true),
});
