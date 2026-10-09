/**
 * Hanout expo demo seed (local).
 *
 *   npm run seed:hanout           # departments, channels, staff, 12 products, history
 *   npm run seed:hanout -- --reset # also wipe orders + chat and reseed history (keeps leads)
 */
import { provisionHanout, resetHanoutDemo } from "@/server/services/hanout";

async function main() {
  const result = await provisionHanout();
  console.log("provisioned", result);
  if (process.argv.includes("--reset")) {
    await resetHanoutDemo();
    console.log("demo orders + chat reset");
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
