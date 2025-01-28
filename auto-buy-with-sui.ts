import { Transaction } from "@mysten/sui/transactions";
import { getFullnodeUrl, OwnedObjectRef, SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
  suiPrivKey,
  rpcUrl,
  countdownThreshold,
  winnerWhitelist,
  winnerThreshold,
  referrer,
} from "./env.json";
import { isValidSuiAddress, normalizeSuiAddress } from "@mysten/sui/utils";
import global from "./global-config.json";
import { buyWithSui, getWinnerCount, settleWinners } from "./helpers";

const client = new SuiClient({
  url: rpcUrl.length > 0 ? rpcUrl : getFullnodeUrl("mainnet"),
});
const signer = Ed25519Keypair.fromSecretKey(suiPrivKey);

async function main() {
  let gasCoin: OwnedObjectRef | undefined = undefined;
  const realWinnerWhitelist = [signer.toSuiAddress(), ...winnerWhitelist].map(
    (address) => normalizeSuiAddress(address),
  );
  const realReferrer = isValidSuiAddress(referrer)
    ? referrer
    : global.defaultReferrer;

  while (true) {
    try {
      const statusRes = await client.getObject({
        id: global.statusObject.objectId,
        options: {
          showContent: true,
        },
      });
      if (statusRes.data && statusRes.data.content) {
        const content = statusRes.data.content as any;
        const endTime = content.fields.end_time as number;
        const currentWinners = content.fields.winners as string[];
        const currentTime = Date.now();
        const tx = new Transaction();
        if (endTime < currentTime) {
          settleWinners(tx);
          const res = await client.signAndExecuteTransaction({
            transaction: tx,
            signer,
          });
          console.log(res.digest);
          break;
        } else {
          const diffTime = endTime - currentTime;
          const isFarFromEndTime = diffTime > countdownThreshold;
          const isEnoughWinnerSeat =
            getWinnerCount(currentWinners, realWinnerWhitelist) >=
            winnerThreshold;
          if (!isFarFromEndTime && !isEnoughWinnerSeat) {
            buyWithSui(tx, realReferrer, gasCoin);
            const res = await client.signAndExecuteTransaction({
              transaction: tx,
              signer,
              options: {
                showEvents: true,
                showEffects: true,
              },
            });
            console.log(res.digest);
            gasCoin = res.effects?.gasObject;
            if (res.events) {
              const [newEndTimeEvent] = res.events;
              const newEndTime = (newEndTimeEvent.parsedJson as any).ms;
              await new Promise((r) =>
                setTimeout(r, newEndTime - currentTime - countdownThreshold),
              );
            }
          } else {
            if (isFarFromEndTime) {
              console.log("far from end time");
              await new Promise((r) =>
                setTimeout(r, diffTime - countdownThreshold),
              );
            }
            if (isEnoughWinnerSeat) {
              console.log("enough winner seat");
              await new Promise((r) => setTimeout(r, 60_000));
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      await new Promise((r) => setTimeout(r, 1_000));
    }
  }
}

main().catch((err) => console.log(err));
