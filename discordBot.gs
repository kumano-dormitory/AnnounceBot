const discordWebhookUrl = properties.getProperty('discordWebhookUrl');
const discordWebhookToken = properties.getProperty('discordWebhookToken');

function discordPost(content) {
  const params = {
    'method': 'post',
    'payload': {
      'token': discordWebhookToken,  //discordのwebhooksのトークン
      'channel': '#一般',         //送信したいチャンネル
      "content": content,
      'username': '周知さん',     //送信させたいユーザー名
      'parse': 'full'
    },
    'muteHttpExceptions': true

  };
  const response = UrlFetchApp.fetch(discordWebhookUrl, params);

  //Logger.log(response.getContentText());
  return response;
}