const properties = PropertiesService.getScriptProperties();
const slackAccessToken = properties.getProperty('slackAccessToken');
const slackVerificationToken = properties.getProperty('slackVerificationToken');
const slackApp = SlackApp.create(slackAccessToken);
const discordWebhookUrl = properties.getProperty('discordWebhookUrl');
const discordWebhookToken = properties.getProperty('discordWebhookToken');

function slackPostTobottest(content) {
  const channelId = "#bottest"; // 対象チャンネル
  const message = content;      // 投稿するメッセージ
  const options = {}
  const response = slackApp.postMessage(channelId, message, options);
  return response;
}

function discordPost(content) {
  const url = discordWebhookUrl;      //discordのwebhooksのurl
  const token = discordWebhookToken;  //discordのwebhooksのトークン
  const channel = '#general';         //送信したいチャンネル
  const text = content;
  const username = 'AnnounceBot';     //送信させたいユーザー名
  const parse = 'full';
  const method = 'post';

  const payload = {
    'token': token,
    'channel': channel,
    "content": text,
    'username': username,
    'parse': parse,
  };

  const params = {
    'method': method,
    'payload': payload,
    'muteHttpExceptions': true

  };


  const response = UrlFetchApp.fetch(url, params);
  //Logger.log(response.getContentText());
  return response;
}

function doPost(e) {
  if (e.parameter.payload) { //ボタンから
    const payload = JSON.parse(e["parameter"]["payload"]);
    const token = payload["token"];
    const name = payload["actions"][0]["name"];
    const value = payload["actions"][0]["value"];
    let text = properties.getProperty(value);

    //scriptPropertyの反映に時間がかかる場合があるので最大60秒待つ
    for (let i = 0; text == null && i < 120; i++) {
      text = properties.getProperty(value);
      Utilities.sleep(500);
    }
    if (text == null) {
      return ContentService.createTextOutput("ごめんなさい。エラーが発生しました。/nもう一度最初からやり直してください。");
    }
    //properties.deleteProperty(value);

    //slack以外からのアクセスでないかチェック
    if (token != slackVerificationToken) {
      throw new Error(e.parameter.token);
    }

    if (name == "yes1") {
      //ブロックLINE，全寮LINE，discordへポスト
      const content = "全寮LINE，discord，ブロックLINEへの周知\n\n" + text;
      slackPostTobottest(content);
      discordPost(content).getResponseCode();
      return ContentService.createTextOutput(text + "\n\nを全寮LINE，discord，ブロックLINEへ周知しました。");
    }
    else if (name = "yes2") {
      //ブロックLINEのみにポスト
      const content = "ブロックLINEへの周知\n\n" + text;
      slackPostTobottest(content);
      return ContentService.createTextOutput(text + "\n\nをブロックLINEのみに周知しました。");
    }
    else if (name == "no") {
      return ContentService.createTextOutput("もう一度最初から操作してください");
    }
    return ContentService.createTextOutput("エラーが発生しました。\nもう一度最初から操作してください\n" + JSON.stringify(e));
  }
  else {　//slash command
    //slack以外からのアクセスでないかチェック
    if (e.parameter.token != slackVerificationToken) {
      throw new Error(e.parameter.token);
    }

    const messageId = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMddHHmmssSSS') + Math.floor(Math.random() * 1000);
    properties.setProperty(messageId, e.parameter.text);

    if (e.parameter.text == "") {
      return ContentService.createTextOutput("こんにちは。SC周知Botです。\nLINE等に周知を行うには `/announce` のあとに周知内容を入力して送信してください");
    }

    const data = {
      "text": "こんにちは。SC周知Botです。", //アタッチメントではない通常メッセージ
      "response_type": "ephemeral", // ここを"ephemeral"から"in_chanel"に変えると他の人にも表示されるらしい（？）
      //アタッチメント部分
      "attachments": [{
        "title": "以下の内容を全寮に周知しますか？(文責・誤字脱字等を確認してください)",//　アタッチメントのタイトル
        "text": e.parameter.text,//アタッチメント内テキスト
        "fallback": "あなたの環境はボタン表示に対応していないようです。他の人にやってもらってください。",//ボタン表示に対応してない環境での表示メッセージ. 
        "callback_id": "callback_button",
        "color": "#00bfff", //左の棒の色を指定する
        "attachment_type": "default",
        // ボタン部分
        "actions": [
          //ボタン1
          {
            "name": "yes1",
            "text": "全寮LINE，discord，ブロックLINEに周知",
            "type": "button",
            "value": messageId
          },
          //ボタン2
          {
            "name": "yes2",
            "text": "ブロックLINEのみに周知(寮外秘の内容)",
            "type": "button",
            "value": messageId
          },
          //ボタン3
          {
            "name": "no",
            "text": "いいえ",
            "type": "button",
            "value": messageId
          }
        ]
      }]
    };
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  if (!e.parameter.text || !e.parameter.mode) {
    return ContentService.createTextOutput("Too few parameters.");
  }
  switch (e.parameter.mode) {
    case '1':
      slackPostTobottest("全寮LINE，discord，ブロックLINEへの周知\n\n" + e.parameter.text);
      return ContentService.createTextOutput("全寮LINE，discord，ブロックLINEへの周知\n\n" + e.parameter.text);
      break;
    case '2':
      slackPostTobottest("ブロックLINEへの周知\n\n" + e.parameter.text);
      return ContentService.createTextOutput("ブロックLINEへの周知\n\n" + e.parameter.text);
      break;
    default:
      break;
  }
  return ContentService.createTextOutput(e.parameter.mode + "\n" + e.parameter.text);
}