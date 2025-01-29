# BuckYou Bot

[English](README.md) | [中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

## 簡介

這是一個為 BuckYou 2025 活動設計的自動搶票機器人。它能夠自動監控並在最佳時機購買門票，支援使用 SUI 或 BUCK 代幣支付。

## 環境設置

### 1. 安裝必要工具

首先需要安裝 Node.js (建議版本 22+)，然後安裝 tsx：

```bash
npm install -g tsx
```

### 2. 安裝專案依賴

在專案目錄下執行：

```bash
npm install
```

### 3. 設定檔配置

創建 `env.json` 檔案，填入以下配置：

```json
{
  "suiPrivKey": "suiprivkey...", // 你的 SUI 私鑰（必須以 'suiprivkey' 為前綴）
  "rpcUrl": "", // 自訂 RPC URL（留空使用預設值）
  "strategy": {
    "preferredToken": "SUI", // 優先使用的代幣（"SUI" 或 "BUCK"）
    "countdownThreshold": 10000, // 開始購買的倒數時間（毫秒）
    "winnerStrategy": {
      "whitelist": [
        // 獲勝者白名單（這些地址獲勝時不買票）
        ""
      ],
      "threshold": 2 // 白名單地址持有票數達到此數量時停止買票
    }
  },
  "testMode": true, // 測試模式，不會真正購買
  "referrer": "0x3bcc0e33f2390ce0b4208378a28c6304d0228eae186a0a96eabcb7fb7e5a6a31" // 推薦人地址
}
```

## 執行方式

### 基本執行

```bash
npm start
```

### 指定代幣執行

使用 SUI 購買：

```bash
npm start --token SUI
```

使用 BUCK 購買：

```bash
npm start --token BUCK
```

### 進階參數

```bash
npm start [選項]

選項：
  --token <SUI|BUCK>          指定使用的代幣
  --threshold <毫秒>          設定購買時機（倒數毫秒數）
```

## 注意事項

1. 執行前請確保錢包中有足夠的 SUI 和 BUCK 代幣
2. 建議先小額測試確認設定正確
3. 程式執行期間請勿關閉終端機
4. 為了安全起見，建議：
   - 建立一個新的錢包專門用於搶票
   - 只存入需要用於搶票的金額
   - 不要使用主要錢包的私鑰
