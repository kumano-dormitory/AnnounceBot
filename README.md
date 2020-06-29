# announce bot

## 導入方法
1. Slackの設定1
    1. https://api.slack.com/apps でCreateNewApp
    1. OAuth&PermissionsでBot Token Scopesのchat:writeを追加
    1. ページ上部`Install App to Workspace`をクリックし，目的のワークスペースにインストール(アプリの権限を変えるたびに再インストールが必要)
    1. `OAuth & Permissions`の`Bot User OAuth Access Token`を，GASのスクリプトのプロパティに登録(`プロパティ:slackAccessToken`，`値:Bot User OAuth Access Token`)
    1. `Basic Information`の`Verification Token`を，GASのスクリプトのプロパティに登録(`プロパティ:slackVerificationToken`，`値:Verification Token`)
    1. `OAuth & Permissions`の`Scopes`で`chat:write`を有効化
1. GASの準備
    1. GASのSlackApp(`ライブラリキー:M3W5Ut3Q39AaIwLquryEPMwV62A3znfOO`)をライブラリに追加
    1. GASにコードをペースト
    1. GASをウェブアプリとして公開し，`Current web app URL`をコピー
1. Slackの設定2
    1. https://api.slack.com/apps にアクセス
    1. `Slash Commands`でスラッシュコマンドを作成。`Request URL`に`Current web app URL`を貼り付け
    1. `Interactivity & Shortcuts`の`Request URL`にも`Current web app URL`を貼り付け
1. おしまい

## 使い方
### 外部からslackに周知する場合
1. `Current web app URL`にパラメータとして，modeとtextをつけると，slackに周知される。いずれのパラメータも必須  
(ex:https://script.google.com/macros/s/[scriptId]/exec?mode=1&text=周知内容)

mode=1:ブロックLINE，全寮LINE，discordへの周知  
mode=2:ブロックLINEのみへの周知

## slack部分
### ハマりポイント
- ボタン押した後に投げられるJSONの読み取り(`payload.action`の中)  
. で読み取れるんやと思って試行錯誤しまくってた。結局今のコードが読み取れてる理由が分からない。
- 最初の入力内容の引継ぎ  
ボタンのvalueで渡そうと思ったら改行が消えて悲しかった(仮に改行が保たれてたとしても間違ってる)。ユニークなidをつけてScriptPropertyに入れてidをvalueに入れる今のやり方が正しいのかは知らない。
### 参考
- [Google Apps Script で Slack Botを作ってみた。(お勉強編)](https://qiita.com/Quikky/items/9de56c049304885a4f4f)
- [Botもサーバーも不要！SlackとGASで簡単な共有＆アンケートツールを作ってみた](https://slack.dev/bolt-js/ja-jp/tutorial/getting-started)
- [Slack App+GASでボタン選択式botを作ろう](https://qiita.com/tomoharr24/items/0b4c0f2d9097ab7fc7da)
- [Slack BOTでMessage Buttonsを使う](https://www.pre-practice.net/2017/11/slack-botmessage-buttons.html)

## その他
discordにも流せるようにする。