# BuckYou Bot

[English](README.md) | [中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

## Introduction

This is an automated ticket purchasing bot for BuckYou 2025. It monitors and automatically purchases tickets at optimal times, supporting both SUI and BUCK tokens.

## Setup

### 1. Required Tools

First, install Node.js (version 22+ recommended) and tsx:

```bash
npm install -g tsx
```

### 2. Install Dependencies

In the project directory:

```bash
npm install
```

### 3. Configuration

Create `env.json` file with the following configuration:

```json
{
  "suiPrivKey": "suiprivkey...", // Your SUI private key (must start with 'suiprivkey')
  "rpcUrl": "", // Custom RPC URL (leave empty for default)
  "strategy": {
    "preferredToken": "SUI", // Preferred token ("SUI" or "BUCK")
    "countdownThreshold": 10000, // Countdown threshold in milliseconds
    "winnerStrategy": {
      "whitelist": [
        // Winner whitelist (don't buy when these addresses win)
        ""
      ],
      "threshold": 2 // Stop buying when whitelist addresses own this many tickets
    }
  },
  "testMode": true, // Test mode, won't make actual purchases
  "referrer": "0x3bcc0e33f2390ce0b4208378a28c6304d0228eae186a0a96eabcb7fb7e5a6a31" // Referrer address
}
```

## Usage

### Basic Execution

Automatically choose the best payment method:

```bash
npm start
```

### Token-Specific Execution

Buy with SUI:

```bash
npm start --token SUI
```

Buy with BUCK:

```bash
npm start--token BUCK
```

### Advanced Parameters

```bash
npm start [options]

Options:
  --token <SUI|BUCK>          Specify token to use
  --threshold <milliseconds>  Set purchase timing (countdown in ms)
```

## Important Notes

1. Ensure sufficient SUI and BUCK tokens in wallet before running
2. Test with small amounts first to verify settings
3. Keep terminal open while bot is running
4. For security considerations:
   - Create a new wallet specifically for ticket purchasing
   - Only deposit the amount needed for tickets
   - Don't use your main wallet's private key
