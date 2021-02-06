//https://kyoto.stopcovid19.jp/ のgithub(https://github.com/stop-covid19-kyoto/covid19-kyoto)内のjsonを見ます
//
const urlLastUpdate = "https://github.com/stop-covid19-kyoto/covid19-kyoto/raw/development/data/last_update.json";
//検査者数
// const urlInspectionsSummary = "https://github.com/stop-covid19-kyoto/covid19-kyoto/raw/development/data/inspections_summary.json";
//全体のまとめ
const urlMainSummary = "https://github.com/stop-covid19-kyoto/covid19-kyoto/raw/development/data/main_summary.json";
//新規感染者数
const urlPatientsSummary = "https://github.com/stop-covid19-kyoto/covid19-kyoto/raw/development/data/patients_summary.json"
//重症者病床数(変わるかもしれないので時々確認しよう)
const numOfBeds = 86;

function getInfoOfKyotoPref(){
  const responseLastUpdate = UrlFetchApp.fetch(urlLastUpdate);
  const objLastUpdate = JSON.parse(responseLastUpdate.getContentText());
  const lastUpdate = objLastUpdate.last_update;
  //Logger.log("lastUpdate:",lastUpdate);
  
  let scriptProp = PropertiesService.getScriptProperties();
  if(scriptProp.getProperty("lastupdate") != lastUpdate){
    scriptProp.setProperty("lastupdate", lastUpdate);
    
    //7日間の新規感染者数
    let weeklyNewPatients = 0;
    const responsePatientsSummary = UrlFetchApp.fetch(urlPatientsSummary);
    const objPatientsSummary = JSON.parse(responsePatientsSummary.getContentText());
    const sizeOfData = objPatientsSummary.data.length;
    for(let i = sizeOfData - 7; i < sizeOfData;i++){
      weeklyNewPatients += objPatientsSummary.data[i].小計;
      //Logger.log(objPatientsSummary.data[i]);
    }
    //Logger.log("weeklyNewPatients:",weeklyNewPatients);
    
    //重症者数
    let severePatient = 0;
    const responseMainSummary = UrlFetchApp.fetch(urlMainSummary);
    const objMainSummary = JSON.parse(responseMainSummary.getContentText());
    for (const element of objMainSummary.children[0].children) {
      if(element.attr == "重症者"){
        severePatient = element.value;
        break;
      }
    }
    //Logger.log("severePatient:",severePatient);
    
    let status = "normal";
    //警戒基準の判定
    if(weeklyNewPatients / 7 > 20 || severePatient / numOfBeds > 0.4 ){
      status = "emergency";
    }
    //Logger.log("status:",status);
    if(scriptProp.getProperty("status") != status) {
      scriptProp.setProperty("status", status);
      switch(status){
        case "emergency":
          slackPostCOVID19(
            "京都府のモニタリング指標が「特別警戒基準」に変わったようです。\n" + 
            "https://www.pref.kyoto.jp/kentai/corona/tassei_jyokyo.html 10/20BLKの議案及び寮内の状況を確認して次のような内容を周知してください。",
            
            "京都府の新型コロナモニタリング指標が特別警戒基準になったことを踏まえて、熊野寮の警戒レベルをレベル②警戒時に引き上げます。\n" +  
            "平時からの対策に加えて、以下の対策を徹底してください。\n" + 
            "・食堂、食堂横廊下、ロビー、事務室使用時のマスク着用徹底\n" + 
            "・外出前後での手洗いもしくはアルコール消毒徹底\n" + 
            "・外出時のマスク着用推奨\n" + 
            "・食堂、談話室の換気（1時間に5分）徹底。8時から22時までの間は毎時放送で呼びかけ\n" + 
            "・寮外生にも以上のルールに従ってもらう\n" + 
            "また、体調不良者はブロックの保健係などに報告するようにしてください。\n" + 
            "文責:常任委員会"
          );
          break;
        case "normal":
          slackPostCOVID19(
            "京都府のモニタリング指標が「特別警戒基準」ではなくなったようです。\n" + 
            "https://www.pref.kyoto.jp/kentai/corona/tassei_jyokyo.html 10/20BLKの議案及び寮内の状況を確認して次のような内容を周知してください。",
            
            "京都府の新型コロナモニタリング指標が警戒基準になったことを踏まえて、熊野寮の警戒レベルをレベル①平時に引き下げます。\n" +  
            "警戒レベルは下がりますが、熊野寮自治会ではマスク、手洗いうがい、換気等の基本的な対策を推奨しています。\n" + 
            "また、体調不良者はブロックの保健係などに報告するようにしてください。\n" + 
            "文責:常任委員会"
          );
          break;
      }
    }
  }
  return;
}

function slackPostCOVID19(content,attachment) {
  const token = slackAccessToken;
  const channel = "周知さん"; //投稿先チャンネル名
  const username = "京都府モニタリング指標さん"; //BOTの名前
  const text = content; //メッセージ
  const attachments = JSON.stringify([
      {
        color: "#f55", //インデント線の色(赤っぽい色)
        text: attachment  //インデント内に表示されるテスト
      }
    ]);
  const payload = {
    "channel" : channel, //通知先チャンネル名
    "text" : text, //送信テキスト
    "attachments": attachments //リッチなメッセージを送る用データ
  };
  const option = {
    "method" : "POST", //POST送信
    "payload" : payload //POSTデータ
  };
  let response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage?token=" + token, option);
  while(response.getResponseCode() != 200){
    response = UrlFetchApp.fetch("https://slack.com/api/chat.postMessage?token=" + token, option);
  }
  console.log(response);
  return  response;
}