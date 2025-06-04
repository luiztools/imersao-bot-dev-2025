const axios = require("axios");
const crypto = require("crypto");

const SYMBOL = "BTCUSDT";
const QUANTITY = "0.001";

const API_URL = "https://testnet.binance.vision";//https://api.binance.com
const API_KEY = "XXXXX";
const SECRET_KEY = "XXXXXX";

let isOpened = false;

function calcSMA(data) {
    const closes = data.map(candle => parseFloat(candle[4]));
    const sum = closes.reduce((a, b) => a + b);
    return sum / data.length;
}

async function newOrder(symbol, quantity, side){
    const order = { symbol, quantity, side };
    order.type = "MARKET";
    order.timestamp = Date.now();

    const signature = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(new URLSearchParams(order).toString())
        .digest("hex");

    order.signature = signature;

    try{
        const {data} = await axios.post(
            API_URL + "/api/v3/order", 
            new URLSearchParams(order).toString(), 
            {
                headers: { "X-MBX-APIKEY": API_KEY }
            }
        )

        console.log(data);
    }
    catch(err){
        console.error(err.response.data);
    }
}

async function start() {
    const { data } = await axios.get(API_URL + "/api/v3/klines?limit=21&interval=15m&symbol=" + SYMBOL);
    const candle = data[data.length - 1];
    const price = parseFloat(candle[4]);

    console.clear();
    console.log("Price: " + price);

    const sma = calcSMA(data);
    console.log("SMA: " + sma);
    console.log("Is Opened? " + isOpened);

    if (price <= 200000 && isOpened === false) {
        isOpened = true;
        newOrder(SYMBOL, QUANTITY, "buy");
    }
    else if (price >= (sma * 1.1) && isOpened === true) {
        newOrder(SYMBOL, QUANTITY, "sell");
        isOpened = false;
    }
    else
        console.log("aguardar");
}

setInterval(start, 3000);

start();