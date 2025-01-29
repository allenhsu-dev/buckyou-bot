import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export interface CommandLineArgs {
  token?: "SUI" | "BUCK";
  threshold?: number;
}

export function parseArgs(): CommandLineArgs {
  return yargs(hideBin(process.argv))
    .option("token", {
      choices: ["SUI", "BUCK"] as const,
      describe: "Token to use for purchase",
    })
    .option("threshold", {
      type: "number",
      describe: "Countdown threshold in milliseconds",
    })
    .parse() as CommandLineArgs;
}
