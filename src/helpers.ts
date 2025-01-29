import { OwnedObjectRef, SuiClient } from "@mysten/sui/client";
import {
  Transaction,
  TransactionArgument,
  TransactionInput,
} from "@mysten/sui/transactions";
import { SUI_TYPE_ARG } from "@mysten/sui/utils";
import global from "./global-config.json";

export function getWinnerCount(
  currentWinners: string[],
  winnerWhitelist: string[],
): number {
  return currentWinners
    .map((address) => winnerWhitelist.indexOf(address))
    .filter((idx) => idx >= 0).length;
}

export async function getMainCoin(
  tx: Transaction,
  client: SuiClient,
  coinType: string,
  sender: string,
): Promise<TransactionArgument> {
  const {
    data: [mainCoin, ...otherCoins],
  } = await client.getCoins({
    owner: sender,
    coinType,
  });
  const mainCoinObj = tx.objectRef({
    objectId: mainCoin.coinObjectId,
    ...mainCoin,
  });
  if (otherCoins.length > 0) {
    tx.mergeCoins(
      mainCoinObj,
      otherCoins.map((c) => c.coinObjectId),
    );
  }
  return mainCoinObj;
}

export function buyWithSui(
  tx: Transaction,
  referrer: string,
  gasCoin: OwnedObjectRef | undefined,
) {
  const poolInfo = global.poolInfos.find((info) => info.symbol === "SUI");
  if (!poolInfo) return;
  tx.moveCall({
    target: `${global.buckyouPackageId}::step_price::update_price`,
    typeArguments: [global.projectType, poolInfo.coinType],
    arguments: [
      tx.sharedObjectRef(poolInfo.priceRuleObject),
      tx.sharedObjectRef(global.statusObject),
      tx.sharedObjectRef(poolInfo.poolObject),
      tx.sharedObjectRef(global.clockObject),
    ],
  });
  const [request] = tx.moveCall({
    target: `${global.accountPackageId}::account::request`,
  });
  tx.moveCall({
    target: `${global.buckyouPackageId}::entry::buy`,
    typeArguments: [global.projectType, poolInfo.coinType],
    arguments: [
      tx.sharedObjectRef(global.configObject),
      tx.sharedObjectRef(global.statusObject),
      tx.sharedObjectRef(poolInfo.poolObject),
      tx.sharedObjectRef(global.clockObject),
      request,
      tx.pure.u64(1),
      tx.gas,
      tx.pure.option("address", referrer),
    ],
  });
  tx.setGasBudget(10_000_000);
  if (gasCoin) tx.setGasPayment([gasCoin.reference]);
}

export function buyWithOtherCoin(
  tx: Transaction,
  symbol: string,
  mainCoin: TransactionArgument,
  referrer: string,
  gasCoin: OwnedObjectRef | undefined,
): TransactionArgument | undefined {
  const poolInfo = global.poolInfos.find((info) => info.symbol === symbol);
  if (!poolInfo) return;
  tx.moveCall({
    target: `${global.buckyouPackageId}::step_price::update_price`,
    typeArguments: [global.projectType, poolInfo.coinType],
    arguments: [
      tx.sharedObjectRef(poolInfo.priceRuleObject),
      tx.sharedObjectRef(global.statusObject),
      tx.sharedObjectRef(poolInfo.poolObject),
      tx.sharedObjectRef(global.clockObject),
    ],
  });
  const [request] = tx.moveCall({
    target: `${global.accountPackageId}::account::request`,
  });
  tx.moveCall({
    target: `${global.buckyouPackageId}::entry::buy`,
    typeArguments: [global.projectType, poolInfo.coinType],
    arguments: [
      tx.sharedObjectRef(global.configObject),
      tx.sharedObjectRef(global.statusObject),
      tx.sharedObjectRef(poolInfo.poolObject),
      tx.sharedObjectRef(global.clockObject),
      request,
      tx.pure.u64(1),
      mainCoin,
      tx.pure.option("address", referrer),
    ],
  });
  tx.setGasBudget(10_000_000);
  if (gasCoin) tx.setGasPayment([gasCoin.reference]);

  return mainCoin;
}

export function settleWinners(tx: Transaction) {
  global.poolInfos.map((info) => {
    tx.moveCall({
      target: `${global.buckyouPackageId}::pool::settle_winners`,
      typeArguments: [global.projectType, info.coinType],
      arguments: [
        tx.sharedObjectRef(info.poolObject),
        tx.sharedObjectRef(global.configObject),
        tx.sharedObjectRef(global.statusObject),
        tx.sharedObjectRef(global.clockObject),
      ],
    });
  });
}
