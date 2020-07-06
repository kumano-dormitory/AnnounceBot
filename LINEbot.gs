const LINEBotUrl = properties.getProperty('LINEBotUrl');

function sendHttpPostToLINEBot(mode,message,from) {
  const options =
  {
    "method": "post",
    "payload":{
      "mode": mode, //0:ブロックLINEのみ，1:全寮LINEにも送る
      "message": message,  //周知する文字列
      "from": from　//発言者かグループの名前
    }
  };
  const response = UrlFetchApp.fetch(LINEBotUrl, options);
  while(response.getResponseCode() != 200){
    response = UrlFetchApp.fetch(LINEBotUrl, options);
  }
  return response;
}