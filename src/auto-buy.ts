import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, OwnedObjectRef, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { isValidSuiAddress, normalizeSuiAddress } from "@mysten/sui/utils";
import { Config } from "./types/config";
import { parseArgs } from "./utils/args-parser";
import global from "./global-config.json";
import {
  buyWithSui,
  buyWithOtherCoin,
  getMainCoin,
  getWinnerCount,
  settleWinners,
} from "./helpers";

const BUCK_TYPE =
  "0xce7ff77a83ea0cb6fd39bd8748e2ec89a3f41e8efdc3f4eb123e0ca37b184db2::buck::BUCK";

export class BuckyouBot {
  private config: Config;
  private client: SuiClient;
  private signer: Ed25519Keypair;
  private gasCoin: OwnedObjectRef | undefined;
  private realWinnerWhitelist: string[];
  private realReferrer: string;

  constructor(config: Config) {
    this.config = config;
    this.client = new SuiClient({
      url: config.rpcUrl || getFullnodeUrl("mainnet"),
    });
    this.signer = Ed25519Keypair.fromSecretKey(config.suiPrivKey);
    this.realWinnerWhitelist = [
      this.signer.toSuiAddress(),
      ...this.config.strategy.winnerStrategy.whitelist,
    ].map((address) => normalizeSuiAddress(address));
    this.realReferrer = isValidSuiAddress(config.referrer)
      ? config.referrer
      : global.defaultReferrer;
  }

  private async executePurchase(token: "SUI" | "BUCK"): Promise<boolean> {
    try {
      const statusRes = await this.client.getObject({
        id: global.statusObject.objectId,
        options: { showContent: true },
      });

      if (!statusRes.data?.content) return false;

      const content = statusRes.data.content as any;
      const endTime = content.fields.end_time as number;
      const currentWinners = content.fields.winners as string[];
      const currentTime = Date.now();
      const restTimeMs = endTime - currentTime;
      const minutes = Math.floor(restTimeMs / (1000 * 60));
      const seconds = Math.floor((restTimeMs % (1000 * 60)) / 1000);

      const buyTimeMs = restTimeMs - this.config.strategy.countdownThreshold;
      const buyMinutes = Math.floor(buyTimeMs / (1000 * 60));
      const buySeconds = Math.floor((buyTimeMs % (1000 * 60)) / 1000);

      console.log("currentWinners", currentWinners);
      console.log(`Rest time: ${minutes} minutes and ${seconds} seconds`);
      console.log(
        `Will buy at ${buyMinutes} minutes and ${buySeconds} seconds`
      );
      const tx = new Transaction();

      if (endTime < currentTime) {
        settleWinners(tx);
        const res = await this.client.signAndExecuteTransaction({
          transaction: tx,
          signer: this.signer,
        });
        console.log("Settlement tx:", res.digest);
        return true;
      }

      const diffTime = endTime - currentTime;
      const isFarFromEndTime =
        diffTime > this.config.strategy.countdownThreshold;
      const isEnoughWinnerSeat =
        getWinnerCount(currentWinners, this.realWinnerWhitelist) >=
        this.config.strategy.winnerStrategy.threshold;

      if (!isFarFromEndTime && !isEnoughWinnerSeat) {
        if (token === "SUI") {
          buyWithSui(tx, this.realReferrer, this.gasCoin);
        } else {
          const mainCoin = await getMainCoin(
            tx,
            this.client,
            BUCK_TYPE,
            this.signer.toSuiAddress()
          );
          const out = buyWithOtherCoin(
            tx,
            "BUCK",
            mainCoin,
            this.realReferrer,
            this.gasCoin
          );
          if (out) {
            tx.transferObjects([out], this.signer.toSuiAddress());
          }
        }

        if (this.config.strategy.testMode) {
          console.log("[TestMode] Buy ");
        } else {
          const res = await this.client.signAndExecuteTransaction({
            transaction: tx,
            signer: this.signer,
            options: {
              showEvents: true,
              showEffects: true,
            },
          });

          console.log("Purchase tx:", res.digest);
          this.gasCoin = res.effects?.gasObject;

          if (res.events) {
            const [newEndTimeEvent] = res.events;
            const newEndTime = (newEndTimeEvent.parsedJson as any).ms;
            await new Promise((r) =>
              setTimeout(
                r,
                newEndTime -
                  currentTime -
                  this.config.strategy.countdownThreshold
              )
            );
          }
        }
        return false;
      } else {
        let waitTime = 0;

        if (isFarFromEndTime) {
          console.log("Far from end time");
          waitTime = Math.min(
            waitTime,
            diffTime - this.config.strategy.countdownThreshold
          );
        }

        if (isEnoughWinnerSeat) {
          console.log("Enough winner seats");
          waitTime = Math.min(waitTime, 59_000);
        }

        if (waitTime > 0) {
          await new Promise((r) => setTimeout(r, waitTime));
        }
        return false;
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      await new Promise((r) => setTimeout(r, 1_000));
      return false;
    }
  }

  public async start(): Promise<void> {
    console.log("Starting BuckYou Bot...");
    const args = parseArgs();

    // Override config with command line arguments
    if (args.token) this.config.strategy.preferredToken = args.token;
    if (args.threshold)
      this.config.strategy.countdownThreshold = args.threshold;

    while (true) {
      try {
        console.log("start");
        const success = await this.executePurchase(
          this.config.strategy.preferredToken
        );
        if (success) break;
      } catch (error) {
        console.error("Error in main loop:", error);
        await new Promise((r) => setTimeout(r, 1_000));
      }
    }
  }
}

// Entry point
if (require.main === module) {
  const main = async () => {
    const config = require("../env.json");
    const bot = new BuckyouBot(config);
    await bot.start();
  };

  main().catch(console.error);
}
