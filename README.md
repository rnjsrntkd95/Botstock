# Botstock

Boostock을 위한 간단한 트레이딩 봇입니다. API 요청으로 트레이딩 봇을 ON/OFF 할 수 있으면 EventEmitter를 통해 이벤트가 전달됩니다.

# 설명
트레이딩 봇 서버는 9999 포트로 실행됩니다.  

`tradingBot.js` - 트레이딩 봇을 실행하기 위한 로직이 담겨있습니다.  

```
BOTS - 실행할 봇의 개수
PRICE_SERVER_URL - 현재가 정보를 요청할 서버 URL
SERVER_URL - 매수/매도 주문을 요청할 서버 URL
```
### API
1. 트레이딩 봇 ON
    - `[SERVER_URL]:9999/start`으로 요청하면 트레이딩 봇이 실행됩니다. 
    - 첫번째 주문이 들어오기까지 10s~60s가 소요됩니다.

2. 트레이딩 봇 OFF
    - `[SERVER_URL]:9999/stop`으로 요청하면 트레이딩 봇이 종료됩니다.



