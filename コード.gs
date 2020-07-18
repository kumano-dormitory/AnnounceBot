const properties = PropertiesService.getScriptProperties();

function doPost(e) {
    if (e.parameter.payload) { //ボタンから
        const payload = JSON.parse(e["parameter"]["payload"]);
        const token = payload["token"];
        const name = payload["actions"][0]["name"];
        const value = payload["actions"][0]["value"];
        const userId = payload["user"]["id"];
        const user = JSON.parse(UrlFetchApp.fetch("https://slack.com/api/users.profile.get?token=" + slackAccessToken + "&user=" + userId + "&pretty=1")).profile.display_name;
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

        if (name == "no") {
            return ContentService.createTextOutput("終了しました");
        }
        else if (name == "yes2") {
            //ブロックLINEのみにポスト
            record('0', text, user, userId);
            sendHttpPostToLINEBot(0, text, user);
            slackPost(user + "がブロックLINEへの周知を行いました", text);
            return ContentService.createTextOutput(text + "\n\nをブロックLINEのみに周知しました。");
        }
        else if (name == "yes1") {
            //ブロックLINE，全寮LINE，discordへポスト
            record('1', text, user, userId);
            sendHttpPostToLINEBot(1, text, user);
            slackPost(user + "が全寮LINE，discord，ブロックLINEへの周知を行いました", text);
            discordPost(text);
            return ContentService.createTextOutput(text + "\n\nを全寮LINE，discord，ブロックLINEへ周知しました。");
        }
        return ContentService.createTextOutput("エラーが発生しました。\nもう一度最初から操作してください\n" + JSON.stringify(e));
    }

    else if (e.parameter.team_domain) {　//slash command
        //slack以外からのアクセスでないかチェック
        if (e.parameter.token != slackVerificationToken) {
            throw new Error(e.parameter.token);
        }

        const messageId = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMddHHmmssSSS') + Math.floor(Math.random() * 1000);
        properties.setProperty(messageId, e.parameter.text);

        if (e.parameter.text == "") {
            return ContentService.createTextOutput("こんにちは。周知さんです。\nLINE等に周知を行うには `/announce` のあとに周知内容を入力して送信してください");
        }

        const data = {
            "text": "こんにちは。周知さんです。\n周知が終わったら `終了` ボタンを押して終了してください。", //アタッチメントではない通常メッセージ
            "response_type": "ephemeral", // ここを"ephemeral"から"in_chanel"に変えると他の人にも表示されるらしい（？）
            //アタッチメント部分
            "attachments": [{
                "title": "以下の内容の周知先を選択してください？(選択前には文責・誤字脱字等を確認してください)",//　アタッチメントのタイトル
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
                        "text": "全寮LINE,discord,ブロックLINE",
                        "type": "button",
                        "value": messageId
                    },
                    //ボタン2
                    {
                        "name": "yes2",
                        "text": "ブロックLINEのみ(寮外秘の内容)",
                        "type": "button",
                        "value": messageId
                    },
                    //ボタン3
                    {
                        "name": "no",
                        "text": "終了",
                        "type": "button",
                        "value": messageId
                    }
                ]
            }]
        };
        return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
    }
}

function record(mode, text, user, userId) {
    const book = SpreadsheetApp.openById(properties.getProperty('SpreadSheetId'));
    let sheet = book.getSheetByName("シート1");
    const range = sheet.getDataRange();
    const row = range.getLastRow() + 1;

    const time = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd/HH:mm:ss.SSS');
    sheet.getRange(row, 1).setValue(time);
    sheet.getRange(row, 2).setValue(user);
    sheet.getRange(row, 3).setValue(userId);
    sheet.getRange(row, 4).setValue(mode);
    sheet.getRange(row, 5).setValue(text);

    return 0;
}