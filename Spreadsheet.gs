const spreadsheetId = properties.getProperty('spreadSheetId');
const propertyColumnPair = {'messageId':1, 'timestamp':2, 'displayName':3, 'realName':4, 'slackId':5, 'mode':6, 'text':7, 'triggerTime':8, 'triggerId':9, 'cancellation':11, 'c-timestamp':12, 'c-displayName':13, 'c-realName':14, 'c-slackID':15};

/**
 * dataに入っているうち、未記入の部分だけ上書きする。
 * @param {string} messageId
 * @param {object} data {'messageId':1, 'timestamp':2, 'displayName':3, 'realName':4, 'slackId':5, 'mode':6, 'text':7, 'triggerTime':8, 'triggerId':9, 'cancellation':11, 'c-timestamp':12, 'c-displayName':13, 'c-realName':14, 'c-slackID':15}
 */
function setMessageData(messageId, data) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('シート1');
  const row = getRowByMessageId(messageId);
  const range = sheet.getRange(row,1,1,15);

  for (const property in data) {
    if(typeof propertyColumnPair[property] === 'undefined') continue;
    const cell = range.getCell(1,propertyColumnPair[property]);
    if(cell.getValue() === ''){
      cell.setValue(data[property]);
    }
  }
}

/**
 * messageIdからrowを見つけて返す。なければlastRow+1を返す。
 */
function getRowByMessageId(messageId){
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('シート1');
  const textFinder = sheet.createTextFinder(messageId).matchEntireCell();
  const targetCell = textFinder.findNext();
  if(targetCell !== null){
    return targetCell.getRow();
  }
  else{
    return sheet.getLastRow() + 1;
  }
}

/**
 * messageIdのデータをJSONで返す
 */
function getMessageDataByMessageId(messageId){
  const row = getRowByMessageId(messageId);
  const range = sheet.getRange(row,1,1,15);

  let messageData = {'messageId':1, 'timestamp':2, 'displayName':3, 'realName':4, 'slackId':5, 'mode':6, 'text':7, 'triggerTime':8, 'triggerId':9, 'cancellation':11, 'c-timestamp':12, 'c-displayName':13, 'c-realName':14, 'c-slackID':15};
  for(const property in propertyColumnPair){
    messageData[property] = range.getValue(1,propertyColumnPair[property]);
  }
  return messageData;
}