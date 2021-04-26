const slackAccessToken = properties.getProperty('slackAccessToken');
const slackVerificationToken = properties.getProperty('slackVerificationToken');
//const slackApp = SlackApp.create(slackAccessToken);

function getSlackUser(userId){
  const options = {
    "method" : "get",
    "headers" : {
      Authorization: "Bearer " + slackAccessToken
    }
  }
  const user = JSON.parse(UrlFetchApp.fetch("https://slack.com/api/users.profile.get?user=" + userId + "&pretty=1",options));
  return user;
}

function slackPost(content,attachment) {
  const token = slackAccessToken;
  const channel = "bottest"; //投稿先チャンネル名
  const text = content; //メッセージ
  const attachments = JSON.stringify([
      {
        color: "#9c9", //インデント線の色
        text: attachment  //インデント内に表示されるテスト
      }
    ]);
  const payload = {
    "channel" : channel, //通知先チャンネル名
    "text" : text, //送信テキスト
    "attachments": attachments, //リッチなメッセージを送る用データ
    "token": token
  };
  const option = {
    "method" : "POST", //POST送信
    "payload" : payload //POSTデータ
  };
  let response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", option);
  while(response.getResponseCode() != 200){
    response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", option);
  }
  console.log(response.getContentText());
  return  response;
}

function slackPostTest(){
  const attachments = JSON.stringify(
  [{
          "blocks": [
            {
              "type": "header",
              "text": {
                "type": "plain_text",
                "text": "This is a header block",
                "emoji": true
              }
            },
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": "This is a plain text section block.",
                "emoji": true
              }
            },
            {
              "type": "actions",
              "elements": [
                {
                  "type": "datepicker",
                  "initial_date": "2021-04-28",
                  "placeholder": {
                    "type": "plain_text",
                    "text": "Select a date",
                    "emoji": true
                  },
                  "action_id": "actionId-1"
                },
                /*{
                  "type": "timepicker",
                  "initial_time": "13:37",
                  "placeholder": {
                    "type": "plain_text",
                    "text": "Select time",
                    "emoji": true
                  },
                  "action_id": "actionId-2"
                } */
              ]
            },
            {
              "type": "actions",
              "elements": [
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "text": "Click Me",
                    "emoji": true
                  },
                  "value": "click_me_123",
                  "action_id": "actionId-0"
                },
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "text": "Click Me",
                    "emoji": true
                  },
                  "value": "click_me_123",
                  "action_id": "actionId-1"
                }
              ]
            }
          ]
        }]);
  const content = "test";
  const token = slackAccessToken;
  const channel = "bottest"; //投稿先チャンネル名
  const text = content; //メッセージ
  const payload = {
    "channel" : channel, //通知先チャンネル名
    "text" : text, //送信テキスト
    "attachments": attachments, //リッチなメッセージを送る用データ
    "token": token
  };
  const option = {
    "method" : "POST", //POST送信
    "payload" : payload //POSTデータ
  };
  let response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", option);
  while(response.getResponseCode() != 200){
    response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage", option);
  }
  console.log(response.getContentText());
  return  response;
}