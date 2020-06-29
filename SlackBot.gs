var properties = PropertiesService.getScriptProperties();
var slackAccessToken = properties.getProperty('slackAccessToken');
var slackVerificationToken = properties.getProperty('slackVerificationToken');
var slackApp = SlackApp.create(slackAccessToken);

function postTobottest(content) {
  var channelId = "#bottest"; // 対象チャンネル
  var message = content;      // 投稿するメッセージ
  var options = {}
  slackApp.postMessage(channelId, message, options);
  return;
}

function doPost(e) {
  if (e.parameter.payload) { //ボタンから
    var payload = JSON.parse(e["parameter"]["payload"]);
    var token = payload["token"];
    var name = payload["actions"][0]["name"];
    var value = payload["actions"][0]["value"];
    var text = properties.getProperty(value);

    //scriptPropertyの反映に時間がかかる場合があるので最大50秒待つ
    for (var i = 0; text == null && i < 100; i++) {
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
      postTobottest("全寮LINE，discord，ブロックLINEへの周知\n\n" + text);
      return ContentService.createTextOutput(text + "\n\nを全寮LINE，discord，ブロックLINEへ周知しました。");
    }
    else if (name = "yes2") {
      //ブロックLINEのみにポスト
      postTobottest("ブロックLINEへの周知\n\n" + text);
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

    var messageId = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMddHHmmssSSS') + Math.floor(Math.random() * 1000);
    properties.setProperty(messageId, e.parameter.text);

    if (e.parameter.text == "") {
      return ContentService.createTextOutput("こんにちは。SC周知Botです。\nLINE等に周知を行うには `/announce` のあとに周知内容を入力して送信してください");
    }

    var data = {
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
      postTobottest("全寮LINE，discord，ブロックLINEへの周知\n\n" + e.parameter.text);
      return ContentService.createTextOutput("全寮LINE，discord，ブロックLINEへの周知\n\n" + e.parameter.text);
      break;
    case '2':
      postTobottest("ブロックLINEへの周知\n\n" + e.parameter.text);
      return ContentService.createTextOutput("ブロックLINEへの周知\n\n" + e.parameter.text);
      break;
    default:
      break;
  }
  return ContentService.createTextOutput(e.parameter.mode + "\n" + e.parameter.text);
}