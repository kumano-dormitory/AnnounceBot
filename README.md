# announce bot

## 導入方法
1. GASの準備1
    1. GASで新しいプロジェクトを作成
    1. 適当にスクリプトファイルを作ってコードをペースト。1つのファイルでもいい。
1. SpreadSheetの準備
    1. 新しいSpreadSheetを作り，idをGASのスクリプトのプロパティに登録(`プロパティ:SpreadSheetId`，`値:id`)
1. Slackの設定1
    1. https://api.slack.com/apps でCreateNewApp
    1. `OAuth&Permissions`で`Bot Token Scopes`の`chat:write`および`users.profile:read`を追加
    1. ページ上部`Install App to Workspace`をクリックし，目的のワークスペースにインストール(アプリの権限を変えるたびに再インストールが必要)
    1. `OAuth & Permissions`の`Bot User OAuth Access Token`を，GASのスクリプトのプロパティに登録(`プロパティ:slackAccessToken`，`値:Bot User OAuth Access Token`)
    1. `Basic Information`の`Verification Token`を，GASのスクリプトのプロパティに登録(`プロパティ:slackVerificationToken`，`値:Verification Token`)
1. discordの設定
    1. サーバの設定でwebhooksを開く
    1. 適当にwebhookを作成し，`webhook url`をコピー
    1. ウェブブラウザで`webhook url`にアクセスし，`token`をコピー
    1. `webhook url`を，GASのスクリプトのプロパティに登録(`プロパティ:discordWebhookUrl`，`値:webhook url`)
    1. `token`を，GASのスクリプトのプロパティに登録(`プロパティ:discordWebhookToken`，`値:token`)
1. LINEBotの設定
    1. LINEbotのurlを聞いてGASのスクリプトのプロパティに登録(`プロパティ:LINEBotUrl`，`値:url`)
1. GASの準備2
    1. GASのプロジェクトをウェブアプリとして公開し，`Current web app URL`をコピー
1. Slackの設定2
    1. https://api.slack.com/apps にアクセス
    1. `Slash Commands`でスラッシュコマンドを作成。`Request URL`に`Current web app URL`を貼り付け
    1. `Interactivity & Shortcuts`の`Request URL`にも`Current web app URL`を貼り付け
    1. botを入れたいチャンネルを開いてadd appをする
1. おしまい

## 使い方

### slackから周知する場合
Slackの設定2で作ったスラッシュコマンドの引数に周知内容を書いてbotの指示に従う。

## slack部分
GASのslackAppライブラリは使わないことにした。自分でpost投げたほうが自由度が高いので。
### ハマりポイント
- ボタン押した後に投げられるJSONの読み取り(`payload.action`の中)  
. で読み取れるんやと思って試行錯誤しまくってた。結局今のコードが読み取れてる理由が分からない。
- 最初の入力内容の引継ぎ  
ボタンのvalueで渡そうと思ったら改行が消えて悲しかった(仮に改行が保たれてたとしても間違ってる)。ユニークなidをつけてScriptPropertyに入れてidをvalueに入れる今のやり方が正しいのかは知らない。ScriptPropertyの反映がちょっと遅い。
- Attachmentの設定  
- ボタン押した後のslackの挙動  
よくわからない。ボタン押した後の処理が終わってreturnしてもボタンが表示されたままだったりした。色々いじってたら直った。どこで直ったかは忘れた。
### 参考
- [Google Apps Script で Slack Botを作ってみた。(お勉強編) - Qiita](https://qiita.com/Quikky/items/9de56c049304885a4f4f)
- [Botもサーバーも不要！SlackとGASで簡単な共有＆アンケートツールを作ってみた - Qiita](https://qiita.com/vankobe/items/d759dbe3bddeeb318257)
- [Slack App+GASでボタン選択式botを作ろう - Qiita](https://qiita.com/tomoharr24/items/0b4c0f2d9097ab7fc7da)
- [Slack BOTでMessage Buttonsを使う - Google Apps Script試行錯誤Blog](https://www.pre-practice.net/2017/11/slack-botmessage-buttons.html)
- [Google Apps Scriptを用いてライブラリを使わずにSlackにGoogleサイトの変更通知を投稿する - Qiita](https://qiita.com/KanaSakaguchi/items/f0b1bb1cf73f0ec5ec71)

## discord部分
### ハマりポイント
- なし  
メッセージ送るだけなら簡単すぎて焦る。
### 参考
[GoogleSpreadSheetからdiscordにpost - Qiita](https://qiita.com/fishkiller/items/369035f70c4ff4c4677b)

## LINE部分
以下をoptionにしてpost
``` JS
const options =
  {
    "method": "post",
    'contentType': 'application/json',
    "payload": JSON.stringify(
      {
        "mode": mode, //0:ブロックLINEのみ，1:全寮LINEとdiscordにも送る
        "message": message,  //周知する文字列
        "from": from　//発言者かグループの名前
      })
  };
```
## その他
LINEから投稿する機能はなくなった。  
ボタンを押してもメッセージが変わらないことがある。なんで？
