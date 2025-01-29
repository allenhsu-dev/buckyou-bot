# BuckYou Bot

[English](README.md) | [中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

## はじめに

これは BuckYou 2025 のための自動チケット購入ボットです。最適なタイミングで自動的にチケットを監視し購入することができ、SUI または BUCK トークンでの支払いに対応しています。

## セットアップ

### 1. 必要なツール

まず、Node.js（バージョン 22 以上推奨）と tsx をインストールします：

```bash
npm install -g tsx
```

### 2. 依存関係のインストール

プロジェクトディレクトリで以下を実行：

```bash
npm install
```

### 3. 設定

`env.json` ファイルを作成し、以下の設定を入力：

```json
{
  "suiPrivKey": "suiprivkey...", // SUI プライベートキー（'suiprivkey'で始まる必要があります）
  "rpcUrl": "", // カスタム RPC URL（デフォルトの場合は空白）
  "strategy": {
    "preferredToken": "SUI", // 優先トークン（"SUI" または "BUCK"）
    "countdownThreshold": 10000, // 購入開始までのカウントダウン時間（ミリ秒）
    "winnerStrategy": {
      "whitelist": [
        // 当選者ホワイトリスト（これらのアドレスが当選した場合は購入しない）
        ""
      ],
      "threshold": 2 // ホワイトリストアドレスがこの数のチケットを所持したら停止
    }
  },
  "testMode": true, // テストモード、実際の購入は行われません
  "referrer": "0x3bcc0e33f2390ce0b4208378a28c6304d0228eae186a0a96eabcb7fb7e5a6a31" // 紹介者アドレス
}
```

## 使用方法

### 基本的な実行

最適な支払い方法を自動選択：

```bash
npm start
```

### トークン指定実行

SUI で購入：

```bash
npm start --token SUI
```

BUCK で購入：

```bash
npm start --token BUCK
```

### 詳細パラメータ

```bash
npm start [options]

オプション:
  --token <SUI|BUCK>          使用するトークンを指定
  --threshold <milliseconds>  購入タイミングを設定（カウントダウン、ミリ秒）
```

## 重要な注意事項

1. 実行前に十分な SUI および BUCK トークンがウォレットにあることを確認
2. 設定を確認するため、最初は少額でテストすることを推奨
3. ボット実行中はターミナルを開いたままにしてください
4. セキュリティ上の考慮事項：
   - チケット購入専用の新しいウォレットを作成
   - チケット購入に必要な金額のみを入金
   - メインウォレットのプライベートキーは使用しないでください

## 免責事項

このボットの使用によって生じたいかなる損失や損害についても、開発者は責任を負いません。自己責任でご使用ください。
