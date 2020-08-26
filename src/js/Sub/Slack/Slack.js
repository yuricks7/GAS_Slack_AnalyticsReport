/**
 * Slackクラス
 *
 * 【参照】
 * Slack API | Slack
 * https://api.slack.com/
 */
class Slack {

  constructor() {
    // リクエストメソッド用のクラス
    const header     = {"Accept": "application/json"};
    this.apiOperator = RestApiHelper.Load(header);

    // 基本設定
    const props    = PropertiesService.getScriptProperties();
    this.channelId = props.getProperty('channel_id');
  }

 /**
  * メッセージをSlackに投稿する
  *
  * @param {string} 作成したSlackメッセージ
  */
  post(message) {
    if (!message) {let message = '送信テストか空欄でーす'};

    const path  = 'chat.postMessage';
    const query = [{
    }];

    const endPoint = new SlackEndPoint(path, query);
    const option   = {
      text   : message,
      channel: this.channelId,
    };

    const json = this.apiOperator.POST(endPoint.url, option);
    console.info(json);
    return json;
  }
}
