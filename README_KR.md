# BuckYou Bot

[English](README.md) | [中文](README_CN.md) | [日本語](README_JP.md) | [한국어](README_KR.md)

## 소개

이것은 BuckYou 2025를 위한 자동 티켓 구매 봇입니다. 최적의 타이밍에 자동으로 티켓을 모니터링하고 구매하며, SUI 또는 BUCK 토큰으로 결제할 수 있습니다.

## 설정

### 1. 필수 도구

먼저 Node.js(버전 22+ 권장)와 tsx를 설치하세요:

```bash
npm install -g tsx
```

### 2. 의존성 설치

프로젝트 디렉토리에서 실행:

```bash
npm install
```

### 3. 설정

`env.json` 파일을 생성하고 다음 설정을 입력하세요:

```json
{
  "suiPrivKey": "suiprivkey...", // SUI 개인키 ('suiprivkey'로 시작해야 함)
  "rpcUrl": "", // 사용자 정의 RPC URL (기본값은 비워두기)
  "strategy": {
    "preferredToken": "SUI", // 선호하는 토큰 ("SUI" 또는 "BUCK")
    "countdownThreshold": 10000, // 구매 시작 카운트다운 시간 (밀리초)
    "winnerStrategy": {
      "whitelist": [
        // 당첨자 화이트리스트 (이 주소들이 당첨되면 구매하지 않음)
        ""
      ],
      "threshold": 2 // 화이트리스트 주소가 이 수량의 티켓을 보유하면 중지
    }
  },
  "testMode": true, // 테스트 모드, 실제 구매는 이루어지지 않음
  "referrer": "0x3bcc0e33f2390ce0b4208378a28c6304d0228eae186a0a96eabcb7fb7e5a6a31" // 추천인 주소
}
```

## 사용 방법

### 기본 실행

최적의 결제 방법 자동 선택:

```bash
npm start
```

### 토큰별 실행

SUI로 구매:

```bash
npm start --token SUI
```

BUCK로 구매:

```bash
npm start --token BUCK
```

### 고급 매개변수

```bash
npm start [options]

옵션:
  --token <SUI|BUCK>          사용할 토큰 지정
  --threshold <milliseconds>  구매 타이밍 설정 (카운트다운, 밀리초)
```

## 중요 사항

1. 실행 전 지갑에 충분한 SUI 및 BUCK 토큰이 있는지 확인하세요
2. 설정 확인을 위해 처음에는 소액으로 테스트하세요
3. 봇 실행 중에는 터미널을 열어두세요
4. 보안 고려사항:
   - 티켓 구매 전용 새 지갑 생성
   - 티켓 구매에 필요한 금액만 입금
   - 메인 지갑의 개인키를 사용하지 마세요

## 면책 조항

이 봇의 사용으로 인한 어떠한 손실이나 손해에 대해서도 개발자는 책임을 지지 않습니다. 자신의 책임 하에 사용하시기 바랍니다.
