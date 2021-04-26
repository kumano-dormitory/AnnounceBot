const properties = PropertiesService.getScriptProperties();

/*
* slackからPOSTメソッドでアクセスがあるとここに入る。
* ポストのパラメータにpayloadがあるかどうかで分岐してスラッシュコマンドからなのかボタンからなのかを判断。
*/
function doPost(e){
  if(e.parameter.payload){
    const payload = JSON.parse(e["parameter"]["payload"]);
    if(payload.token != slackVerificationToken){
      throw new Error(payload.token);
    }
    switch(payload.actions[0].type){
      case "button":
        iteractiveShuchinyanButton(payload);
        break;
      case "datepicker":
        iteractiveShuchinyanDatepicker(payload);
        break;
      default:
        break;
    }
  }
  else if(e.parameter.team_domain){
    if(e.parameter.token != slackVerificationToken){
      throw new Error(e.parameter.token);
    }
    switch(e.parameter.command){
      case "\shuchinyan":
        slashShuchinyan(e.parameter);
        break;
      case "\shuchinyancancel":
        slashShuchinyanCancel(e.parameter);
        break;
      default:
        break;
    }
  }
}

function slashShuchinyan(parameter){
  if (e.parameter.text == "") {
    return ContentService.createTextOutput("こんにちは。周知にゃんです。\nLINEに周知を行うには `/shuchinyan` のあとに周知内容を入力して送信してください");
  }

  const userId = parameter.user_id;
  const userName = user_name;
  const user = getSlackUser(userId);
  const displayName = user.profile.display_name;
  const text = parameter.text;
  const date = new Date();
  const messageId = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyyMMddHHmmssSSS') + Math.floor(Math.random() * 1000) + userId;

  setMessageData(messageId, {'messageId':messageId,'timestamp':Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd/HH:mm:ss.SSS'),'slackId':userId,'realName':userName,'displayName':displayName,'text':text});

  const data = makeSlashShuchinyanData(date, text, messageId);
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function makeSlashShuchinyanData(date, text, messageId){
  const data = {
      "text": "こんにちは。周知にゃんです。\n以下の内容の周知先を選択してください。周知をしない場合・修正を行う場合は `終了` ボタンを押して終了してください。", //アタッチメントではない通常メッセージ
      "response_type": "ephemeral", // ここを"ephemeral"から"in_chanel"に変えると他の人にも表示されるらしい（？）
      //アタッチメント部分
      "attachments": [
        {
          "blocks": [
            {
              "type": "header",
              "text": {
                "type": "plain_text",
                "text": "*文責・誤字脱字等*を確認してください",
                "emoji": true
              }
            },
            {
              "type": "section",
              "text": {
                "type": "plain_text",
                "text": text,
                "emoji": false
              }
            },
            {
              "type": "actions",
              "elements": [
                {
                  "type": "datepicker",
                  "initial_date": Utilities.formatDate(date,'Asia/Tokyo','yyyy-MM-dd'),
                  "placeholder": {
                    "type": "plain_text",
                    "text": "Select a date",
                    "emoji": true
                  },
                  "action_id": "actionId-datepicker"
                }
              ]
            },
            {
              "type": "actions",
              "elements": [
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "text": "discord",
                    "emoji": true
                  },
                  "value": messageId,
                  "action_id": "actionId-discord"
                },
                {
                  "type": "button",
                  "text": {
                    "type": "plain_text",
                    "text": "LINE",
                    "emoji": true
                  },
                  "value": messageId,
                  "action_id": "actionId-LINE"
                }
              ]
            }
          ]
        }
      ]
    };
    return data;
}

function slashShuchinyanCancel(parameter){
  const messageIdToBeCancelled = parameter.text;
  if (messageIdToBeCancelled == "") {
    return ContentService.createTextOutput("こんにちは。周知にゃんです。\nLINEに周知を行うには `/shuchinyan` のあとに周知内容を入力して送信してください。\n予約した周知にゃんをキャンセルするときには `/shuchinyancancel` のあとにmessageIdを入力して送信してください。");
  }

  const date = new Date();
  const messagaData = getMessageDataByMessageId(messageIdToBeCancelled);

  // messageDataのmessageIdとtextを比較してあってなければ「存在しないmessageIdです」って返す。
  if(messagaData.messageId != messageIdToBeCancelled){
    const data = {
      "text": "こんにちは。周知にゃんです。", //アタッチメントではない通常メッセージ
      "response_type": "ephemeral", // ここを"ephemeral"から"in_chanel"に変えると他の人にも表示されるらしい（？）
      //アタッチメント部分
      "attachments": [
        {
          "blocks":[
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "messageId:`" + messageIdToBeCancelled + "`の予約はありませんでした。"
              }
            }
          ]
        }
      ]
    };
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
  
  // dateを比較して過ぎてたら「過去のやつです」って返す。
  const triggerTime = Date.parse(messagaData.triggerTime);
  if(date > triggerTime){
    const data = {
      "text": "こんにちは。周知にゃんです。", //アタッチメントではない通常メッセージ
      "response_type": "ephemeral", // ここを"ephemeral"から"in_chanel"に変えると他の人にも表示されるらしい（？）
      //アタッチメント部分
      "attachments": [
        {
          "blocks":[
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "messageId:`" + messageIdToBeCancelled + "`は既に周知された内容です。取り消すことはできません。"
              }
            }
          ]
        }
      ]
    };
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }

// 周知内容を表示して予約を消すか確認するdataを作る。
  const data = {
    "text": "こんにちは。周知にゃんです。\n以下の内容の周知を取り消しますか？", //アタッチメントではない通常メッセージ
    "response_type": "ephemeral", // ここを"ephemeral"から"in_chanel"に変えると他の人にも表示されるらしい（？）
    //アタッチメント部分
    "attachments": [
      {
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": messagaData.text,
              "emoji": false
            }
          },
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": "予約日時：" + messagaData.triggerTime,
              "emoji": false
            }
          },
          {
            "type": "actions",
            "elements": [
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "取り消す",
                  "emoji": true
                },
                "value": messageId,
                "action_id": "actionId-cancell"
              },
              {
                "type": "button",
                "text": {
                  "type": "plain_text",
                  "text": "取り消さない",
                  "emoji": true
                },
                "value": messageId,
                "action_id": "actionId-noCancell"
              }
            ]
          }
        ]
      }
    ]
  };
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function iteractiveShuchinyanButton(payload){
  const token = payload.token;
  const messageId = payload.actions[0].value;
  const actionId = payload.actions[0].action_id;
  const userId = payload.user.id;
  const user = getSlackUser(userId);
  const displayName = user.profile.display_name;
  const realName = user.profile.real_name;
  
  const text ='';
}

function doPostFake(e) {
  console.log("doPost(e):\n" + e);
  if (e.parameter.payload) { //ボタンから
    const payload = JSON.parse(e["parameter"]["payload"]);
    const token = payload["token"];
    const name = payload["actions"][0]["name"];
    const value = payload["actions"][0]["value"];
    const userId = payload["user"]["id"];
    const user = getSlackUser(userId);
    const displayName = user.profile.display_name;
    const realName = user.profile.real_name;
    let text;
    
    //slack以外からのアクセスでないかチェック
    if (token != slackVerificationToken) {
      throw new Error(e.parameter.token);
    }
    text = properties.getProperty(value);
    //scriptPropertyの反映に時間がかかる場合があるので最大60秒待つ
    for (let i = 0; text == null && i < 120; i++) {
      text = properties.getProperty(value);
      Utilities.sleep(500);
    }
    if (text == null) {
      return ContentService.createTextOutput("ごめんなさい。エラーが発生しました。/nもう一度最初からやり直してください。");
    }
    properties.deleteProperty(value);
    const counter = parseInt(properties.getProperty("counter"),10);
    
    if (name == "no") {
      return ContentService.createTextOutput("終了しました");
    }
    else if (name == "yes2") {
      //ブロックLINEのみにポスト
      record('0',text,displayName,realName,userId);
      sendHttpPostToLINEBot(0,text,realName + "(" + displayName + ")");
      slackPost(realName + "(" + displayName + ")" + "がブロックLINEへの周知を行いました。", text);
      properties.setProperty("counter", counter + 1);
      return ContentService.createTextOutput(text + "\n\nをブロックLINEのみに周知しました。");
    }
    else if (name == "yes1") {
      //ブロックLINE，discordへポスト
      record('1',text,displayName,realName,userId);
      sendHttpPostToLINEBot(1,text,realName + "(" + displayName + ")");
      slackPost(realName + "(" + displayName + ")" + "がdiscord，ブロックLINEとdiscordへの周知を行いました。",text);
      discordPost(text);
      properties.setProperty("counter", counter+1);
      return ContentService.createTextOutput(text + "\n\nをdiscord，ブロックLINEへ周知しました。");
    }
    return ContentService.createTextOutput("エラーが発生しました。\nもう一度最初から操作してください\n" + JSON.stringify(e));
  }
  
  else if(e.parameter.team_domain){　//slash command
    //slack以外からのアクセスでないかチェック
    if (e.parameter.token != slackVerificationToken) {
      throw new Error(e.parameter.token);
    }

    const messageId = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMddHHmmssSSS') + Math.floor(Math.random() * 1000);
    properties.setProperty(messageId, e.parameter.text);

    if (e.parameter.text == "") {
      return ContentService.createTextOutput("こんにちは。周知にゃんです。\nLINE等に周知を行うには `/announce` のあとに周知内容を入力して送信してください");
    }

    const data = {
      "text": "こんにちは。周知にゃんです。\n以下の内容の周知先を選択してください。周知をしない場合・修正を行う場合は `終了` ボタンを押して終了してください。", //アタッチメントではない通常メッセージ
      "response_type": "ephemeral", // ここを"ephemeral"から"in_chanel"に変えると他の人にも表示されるらしい（？）
      //アタッチメント部分
      "attachments": [
        {
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
                }
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
        }
      ]
    };
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
  }
}

function record(mode,text,displayName,realName,userId){
  const book = SpreadsheetApp.openById(properties.getProperty('SpreadSheetId'));
  let sheet = book.getSheetByName("シート1");
  const range = sheet.getDataRange();
  const row = range.getLastRow() + 1;
  
  const time = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd/HH:mm:ss.SSS');
  sheet.getRange(row, 1).setValue(time);
  sheet.getRange(row, 2).setValue(displayName);
  sheet.getRange(row, 3).setValue(realName);
  sheet.getRange(row, 4).setValue(userId);
  sheet.getRange(row, 5).setValue(mode);
  sheet.getRange(row, 6).setValue(text);
  
  return 0;
}

function resetcounter(){
  properties.setProperty("counter", 1);
  return;
}