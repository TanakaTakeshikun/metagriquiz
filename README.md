# metagriquiz

quizBOT

## 概要

このファイルはDiscordクイズボットアプリケーションのメインエントリーポイントです。Discordクライアントの初期化、イベントハンドラの設定、コマンドの登録、そしてボットを起動状態に保つためのHTTPサーバーの作成を行います。

### 起動方法

- setting.jsonの情報の書き込み
- .envsampleの情報の書き込み
- .envsampleを.envに名前を変更
- .nvmrcでnodeのバージョンを指定
- npm intallでpackageをインストール(glitchでは必要なし)
- npm startで起動(glitchで必要なし)
- GASで5分以下定期でPOSTを行う(glitchでは要行う)

## 主要コンポーネント

### Discordクライアント設定

- 完全なインテント（権限）と特定のパーシャル（部分的データ）を持つDiscord.jsクライアントを初期化します
- エラーログ記録を設定します
- './events'ディレクトリからイベントハンドラを読み込みます
- './commands'ディレクトリからコマンドを登録します

### エラー処理

- グローバルな未捕捉例外処理を実装しています(index.js)

### 認証

- 環境変数トークン（TOKEN）を使用してDiscordで認証します

### HTTPサーバー

- ポート3000でHTTPサーバーを作成します
- POSTリクエストを通じて「wake（起動維持）」メカニズムを実装していますGASからのrequestを行ってください
- GETリクエストによる簡単なヘルスチェックエンドポイントを提供します
- ボットが実行中の場合、「Discord Bot is Oprateing!」を返します

### 備考

- ボットにはGoogle Apps Script（GAS）を使用して起動状態を維持するべきというコメントが含まれています
GASSprict

```js
 function send(){
  const URL = "WEBURL"
  response = UrlFetchApp.fetch(URL, {
   'Content-Type': 'application/json; charset=utf-8',
   'method': 'post',
   'payload': {
    'type': 'wake'
   },
   'muteHttpExceptions': true
  });
 }
 ```

# setting.json - Discord クイズボット設定ファイル

## 概要

Discordクイズボットの運用に必要なすべての基本設定を含む設定ファイルです。

## 設定セクション

### ボット設定(setting.json)

- **サーバー構成**:
  - `serverid`: Discordサーバーのid (951780348465909820)
  - `channelid`: メインクイズチャンネルid (1353146559717703732)
  - `activitiename`: ボットのアクティビティステータステキスト ("クイズBOT")

- **トークンとポイントシステム**:
  - `tokenchannel`: トークン操作用チャンネル (1084627990559858810)
  - `pointchannel`: ポイント操作用チャンネル (1084627990559858810)
  - `tokenroleid`: トークン管理用のロールid (1115455932239986738)
  - `tokenbotid`: トークンボットのid (1068392400684339210)
  - `pointobotid`: ポイントボットのid (1189072177425821707)

- **埋め込み表示設定**:
  - フッターの著作権テキスト: "©️ 2025 Metagri研究所"

### クイズ設定

- `resetTime`: クイズのリセット間隔（分）(5)
- `timeZone`: タイムゾーン設定 ("Asia/Tokyo")
- `checkTime`: 時間チェック間隔（分）(5)

### 外部連携

- `spreadsheet`: クイズデータ保存用のGoogleスプレッドシートID (1Pi51uKKRQHoRPTDcKc57M12yjeb5ivBc_ZU3_fubFrA)

# 規則

基本的にシングルクォーテーションを使用
命名規則に関しては自由
PrefixList

```

接頭辞 説明
fix 既存の機能の問題を修正する場合に使用します。
hotfix 緊急の変更を追加する場合に使用します。
add 新しいファイルや機能を追加する場合に使用します。
feat 新しい機能やファイルを追加する場合に使用します。
update 既存の機能に問題がないが、修正を加えたい場合に使用します。
change 仕様変更により、既存の機能に修正を加えた場合に使用します。
clean/refactor コードを修正し、改善する場合に使用します。
improve コードの改善をする場合に使用します。
disable 機能を一時的に無効にする場合に使用します。
remove/delete ファイルを削除する場合や、機能を削除する場合に使用します。
rename ファイル名を変更する場合に使用します。
move ファイルを移動する場合に使用します。
upgrade バージョンをアップグレードする場合に使用します。
revert 以前のコミットに戻す場合に使用します。
docs ドキュメントを修正する場合に使用します。
style コーディングスタイルの修正をする場合に使用します。
perf コードのパフォーマンスを改善する場合に使用します。
test テストコードを修正する場合や、テストコードを追加する場合に使用します。
chore ビルドツールやライブラリで自動生成されたものをコミットする場合や、上記の接頭辞に当てはまらない修正をする場合に使用します。
参考:https://qiita.com/muranakar/items/20a7927ffa63a5ca226a
```

# ファイル構造

```
│  .env:各種環境変数の保管<commit不可>
│  .env_sample:環境変数例<_sampleを消してください要変更>
│  .gitignore:gitに含めないファイルリスト<変更可能>
│  .glitch-assets:グリッチ用<基本的に変更不可>
│  .glitchdotcom.json:グリッチ用<基本的に変更不可>
│  .nvmrc:nodeのバージョン指定<変更可能ただしglitchはnode16までしかないのでそれ以下>
│  index.js:メインファイル<基本変更不可>
│  LICENSE:ライセンスファイル<変更不可>
│  package-lock.json:packageファイル<基本変更不可>
│  package.json:packageファイル<変更可能>
│  README.md:各種定義を記載<仕様変更時に変更>
│  setting.json:各種設定を保管<要編集>
│  shrinkwrap.yaml:glitchでpackageを入れる際に使う<基本変更不可>
│
├─.config:glitch関係のコンフィグ保管場所
│      glitch-package-manager<変更不可>
│
├─commands:スラッシュコマンド保管場所
│  ├─bot:botメインに関するコマンドの保管場所
│  │      help.js:helpコマンド<何か一つファイルがないと処理がうまく行えないので別のファイルがある場合は削除可能>
│  │
│  └─quiz:クイズ関連のコマンド保管場所<イベント時など変更>
├─events:DiscordAPIのイベントの処理を行う場所
│  ├─bot:bot本体のイベントの保管場所
│  │      ready.js:BOT起動時に処理するファイル<変更可能>
│  │      slashCommandHandler.js:スラッシュコマンドを最適化を行うファイル<基本変更不可>
│  │
│  └─commands:クイズ関連のイベントの処理を行う場所
│          quizbutton.js:クイズのボタンを押されたときに処理するファイル<イベント時など変更>
│
├─helpers:自作関数の保管場所
│      commandHandler.js:スラッシュコマンドの振り分けを行うファイル<基本変更不可>
│      createquiz.js:クイズを作るファイル<イベント時など変更>
│      eventHundler.js:DiscordAPIのイベントの振り分けを行うファイル<基本変更不可>
│      getLogger.js:Log(console.log)を見やすく振り分けを行うファイル<基本変更不可>
│      index.js:各ファイルを一括管理するメインファイル<ファイル追加時に要変更>
│
└─libs:自作library
    │  CommandsBuilder.js:スラッシュコマンドを登録するためのファイル<変更不可>
    │  EmbedBuild.js:D.jsのEmbedBuilderを少し改変した物<スタイルを変えたい場合変更>
    │  EventHandler.js:eventHundlerで使用<基本変更不可>
    │  index.js:各ファイルを一括管理するメインファイル<ファイル追加時に要変更>
    │  Logger.js:Logを見やすくするための物(getLoggerで使用)<基本変更不可>
    │  spreadsheet.js:スプレットシートとの接続を行っている<フォーマットなどを変えるときに要変更>
    │  ts2time.js:時間関連のフォーマットを行う<基本変更不可>
    │
    └─Command:コマンド関連のlibrary
            CommandManager.js:サブコマンドなどを適切に扱えるようにformatする<変更不可>
            index.js:各ファイルを一括管理するメインファイル<ファイル追加時に要変更>
            Managers.js:スラッシュコマンドとメッセージコマンドを分かりやすフォーマット<いらなければ削除可>
            MessageResponse.js:interactionの内容を分かりやすくフォーマット<いらなければ削除可>
            SlashCommandManager.js:slashコマンドを適切に扱えるようにフォーマット<削除不可>
```

Metagri研究所-<https://github.com/TanakaTakeshikun>
