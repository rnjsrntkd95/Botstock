const fetch = require('node-fetch');
const eventEmitter = require('./eventEmitter');

/*	
	BOTS - 실행할 봇의 개수
	PRICE_SERVER_URL - 현재가 정보를 요청할 서버 URL
	SERVER_URL - 매수/매도 주문을 요청할 서버 URL
*/

const BOTS = 50;
const PRICE_SERVER_URL = 'http://localhost:3000';
// const SERVER_URL = 'http://118.67.130.70:3000';
// const SERVER_URL = 'https://boostock.kro.kr:3000';
// const SERVER_URL = 'http://118.67.132.210:3000';
const SERVER_URL = 'http://localhost:3000';
// const SERVER_URL = 'http://220.117.130.11:3000';

const AMOUNT_MIN = 1;
const AMOUNT_MAX = 3;
const priceMap = new Map();
let upper = false;
let onoff = false;

const isUP = type => {
	const flag = type % 2 === 0;
	return upper ? flag : !flag;
};

const randomType = () => {
	return (Math.floor(Math.random() * (3 + 1)) + 1) % 2 === 0;
};

const setPosition = async () => {
	const position = {};
	const stocks = await fetchCurrentPrice();
	stocks.forEach(stock => {
		position[stock.code] = randomType();
	});
	return position;
};

const fetchCurrentPrice = async () => {
	const config = {
		method: 'GET',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
	};
	try {
		const res = await fetch(`${PRICE_SERVER_URL}/api/stock/prices`, config);
		if (res.status === 200) {
			const { stocks } = await res.json();
			stocks.forEach(stock => {
				priceMap.set(stock.code, stock.price);
			});
			return stocks;
		}
	} catch (err) {
		// console.log(err);
	}
};

const handleBidAsk = async (botId, stockCode, bidAskType, bidAskAmount, bidAskPrice) => {
	const orderData = {
		botId,
		stockCode,
		type: bidAskType ? 2 : 1,
		amount: bidAskAmount,
		price: bidAskPrice,
	};

	const config = {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(orderData),
	};

	try {
		const res = await fetch(`${SERVER_URL}/api/user/border`, config);
		const data = await res.json();
		if (res.status !== 200) {
			const error = new Error();
			error.message = data.message;
			throw error;
		}
		// console.log(
		// 	botId - 80001,
		// 	stockCode,
		// 	bidAskType ? '매수' : '매도',
		// 	bidAskPrice + '원',
		// 	bidAskAmount + '주',
		// 	priceMap.get(stockCode) - bidAskPrice
		// );
	} catch (error) {}
};
const matchQuote = price => {
	const natural = parseInt(price).toString();
	let result = natural.slice(0, 4);
	if (natural.length > 4) for (let i = 0; i < natural.length - 4; i++) result += '0';

	return Number(result);
};
const randomCode = () => {
	const codes = [...priceMap.keys()];
	return codes[Math.floor(Math.random() * codes.length)];
};
const randomAmount = () => {
	return Math.floor(Math.random() * (AMOUNT_MAX + AMOUNT_MIN)) + AMOUNT_MIN;
};
const randomPrice = (code, type) => {
	const currentPrice = priceMap.get(code);
	const num = Math.floor(Math.random() * 99) + 1;
	const rate = 0.0005;
	gap = (rate * (100 - num)) / 100;
	if (num < 40) {
		const rate = 0.0015;
		gap = (rate * (100 - num)) / 100;
	} else if (num < 97) {
		const rate = 0.005;
		gap = (rate * (100 - num)) / 100;
	} else if (num < 98) {
		const rate = 0.006;
		gap = (rate * (100 - num)) / 100;
	} else if (num < 99) {
		const rate = 0.007;
		gap = (rate * (100 - num)) / 100;
	} else {
		const rate = 0.008;
		gap = (rate * (100 - num)) / 100;
	}
	return matchQuote(
		isUP(type) ? currentPrice + currentPrice * gap : currentPrice - currentPrice * gap
	);
};
const randomTime = () => {
	const [MAX_TIME, MIN_TIME] = [60000, 10000]; // 70000 + 10000 / 2 = 40s
	return Math.floor(Math.random() * (MAX_TIME + MIN_TIME)) + MIN_TIME;
};

const startTradingBot = async () => {
	const position = await setPosition();

	const setDirection = setInterval(() => {
		upper = !upper;
	}, 900000);
	const setType = setInterval(() => {
		Object.keys(position).forEach(code => {
			position[code] = randomType();
		});
	}, 600000);

	await fetchCurrentPrice();
	const getCurrent = setInterval(fetchCurrentPrice, 500);

	const bots = Array.from({ length: BOTS }, (undefined, i) => i % 2 === 1);
	bots.forEach((type, index) => {
		const orderBot = type => {
			const time = randomTime();
			setTimeout(() => {
				if (!onoff) return;
				const botId = 80001 + index;
				const code = randomCode();
				const amount = randomAmount(); // 1~4 랜덤

				const price = randomPrice(code, amount); //

				handleBidAsk(botId, code, type, amount, price);

				orderBot(!type);
			}, time);
		};
		orderBot(type);
	});

	eventEmitter.on('stop', () => {
		onoff = false;
		clearInterval(setDirection);
		clearInterval(setType);
		clearInterval(getCurrent);
	});
};

eventEmitter.on('start', () => {
	if (onoff) eventEmitter.emit('stop');
	onoff = true;
	startTradingBot();
});

// 60000, 10000, 200
// 3200
