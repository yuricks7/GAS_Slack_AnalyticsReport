/**
 * 投稿先の設定
 * ※あらかじめ使用するプロジェクトにSlackAppライブラリを導入しておくこと！
 *
 * @param {string} 投稿先のチャンネル名
 * @param {string} 投稿に表示するユーザー名
 */
var Slack = function(channelName, displayUserName) {
  this.channelName     = channelName;
  this.displayUserName = displayUserName;
}

/**
 * メッセージをSlackに投稿する
 *
 * @param {string} 作成したSlackメッセージ
 */
Slack.prototype.post = function(message) {
  if (!message) {
    var message = '送信テストか空欄でーす';
  }

  var accessToken = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');

 //SlackAppインスタンスの取得
  var slackApp = SlackApp.create(accessToken);

  slackApp.postMessage(
    this.channelName,
    message,
    {username: this.displayUserName}
  );
};
