if (typeof ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}

// タイムゾーンを東京に設定
process.env.TZ = 'Asia/Tokyo';

const querystring = require("node:querystring");
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const path = require('node:path');
const { EventHandler, CommandsBuilder } = require('./libs');
const logger = require('./helpers/getLogger');
const http = require("http");
require('dotenv').config();

/**
* Discordクライアントの設定
*/
const client = new Client({
  intents: Object.values(GatewayIntentBits),
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  rest: { timeout: 60000 }
});

// ロガーをクライアントに追加
client.logger = logger;

// イベントとコマンドのロード
EventHandler(client, path.resolve(__dirname, './events'));
client.commands = CommandsBuilder(client, path.resolve(__dirname, './commands'));

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('未処理の例外:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のPromise拒否:', reason);
});

// Discord API にログイン
client.login(process.env.TOKEN);

/**
* Google Apps Script (GAS) で定期的にサーバーを起こすためのHTTPサーバー
*/
http.createServer((req, res) => {
  if (req.method === "POST") {
      let data = "";

      req.on("data", (chunk) => {
          data += chunk;
      });

      req.on("end", () => {
          if (!data) {
              res.end("No post data");
              return;
          }

          const dataObject = querystring.parse(data);
          if (dataObject.type === "wake") {
              res.end();
              return;
          }

          res.end();
      });
  } else if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Discord Bot is Operating!");
  }
}).listen(3000, () => {
  console.log("HTTPサーバーがポート3000で起動しました");
});
