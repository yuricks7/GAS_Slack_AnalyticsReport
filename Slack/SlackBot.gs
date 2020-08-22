/**
 * Slackクラス
 * 
 * 【参照】
 * Slack API | Slack
 * https://api.slack.com/
 */
class Slack {
  /**
   * コンストラクタ
   */
  constructor() {
    // リクエストメソッド用のクラス
    const header    = {"Accept": "application/json"};
    this.apiOperator = RestApiHelper.Load(header);

    // 【使用例】
    // const endPoint = new SlackEndPoint(path, query);
    // this.apiOperator.GET(endPoint.url);

    // 基本設定
    const props = PropertiesService.getScriptProperties();
    this.channelId = props.getProperty('channel_id');
  }

 /**
  * メッセージをSlackに投稿する
  *
  * @param {string} 作成したSlackメッセージ
  */
  post(message) {
    if (!message) {let message = '送信テストか空欄でーす'};

    const path = `chat.postMessage`;
    const query = [{
        key: 'channel',
        value: this.channelId,
    }]

    const endPoint = new SlackEndPoint(path, query);
    const option   = { text: message };
    
    const json   = this.apiOperator.POST(endPoint.url, option);
    return json;
//    console.log(json);
  }
}