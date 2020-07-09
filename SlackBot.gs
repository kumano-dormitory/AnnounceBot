const slackAccessToken = properties.getProperty('slackAccessToken');
const slackVerificationToken = properties.getProperty('slackVerificationToken');
//const slackApp = SlackApp.create(slackAccessToken);

function slackPost(content,attachment) {
  var token = slackAccessToken;
  var channel = "bottest"; //投稿先チャンネル名
  var username = "周知さん"; //BOTの名前
  var text = content; //メッセージ
  var attachments = JSON.stringify([
      {
        color: "#9c9", //インデント線の色
        text: attachment  //インデント内に表示されるテスト
      }
    ]);
  var payload = {
    "channel" : channel, //通知先チャンネル名
    "text" : text, //送信テキスト
    "attachments": attachments //リッチなメッセージを送る用データ
  };
  var option = {
    "method" : "POST", //POST送信
    "payload" : payload //POSTデータ
  };
  var response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage?token=" + token, option);
  while(response.getResponseCode() != 200){
    response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage?token=" + token, option);
  }
  return  response;
}