const LINEBotUrl = properties.getProperty('LINEBotUrl');

function sendHttpPostToLINEBot(mode, message, from) {
  const options =
  {
    "method": "post",
    'contentType': 'application/json',
    "payload": JSON.stringify(
      {
        "mode": mode, //0:ブロックLINEのみ，1:全寮LINEとdiscordにも送る
        "message": message,  //周知する文字列
        "from": from　//発言者かグループの名前
      }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(LINEBotUrl, options);
  console.log(response);
  return response;
}