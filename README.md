# buckyou-bot
To be the final winners of BuckYou 2025

## Setup
Install `tsx`
```
npm i -g tsx
```
Install packages
```
npm install
```
Create file `env.json`
```json
{
  "suiPrivKey": "suiprivkey...", // private key with prefix 'suiprivkey'
  "rpcUrl": "", // custom RPC URL ("" means default)
  "countdownThreshold": 10000, // buy under 10000 ms (10 sec)
  "winnerWhitelist": [ // if these addresses are winners then don't buy
    "0x531651add5343c43fd114181f33e59e0989dd68b4b6a0425758bd84e6707c7d9"
  ],
  "winnerThreshold": 2, // how many seats owned by winnerWhitelist then don't buy
  "referrer": // your referrer (if don't have one can use mine ^_^)
    "0x531651add5343c43fd114181f33e59e0989dd68b4b6a0425758bd84e6707c7d9"
}
```

## Run (make sure you have enough SUI or BUCK in sender wallet)
Buy with SUI
```
tsx auto-buy-with-sui.ts
```
Buy with BUCK
```
tsx auto-buy-with-buck.ts
```
