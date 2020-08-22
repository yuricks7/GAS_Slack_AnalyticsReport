/**
 * Slackにメッセージを投稿する
 */
const postSlack = () => {
  const analytics = new DailyReport();

  const slack = new Slack();
//  analytics.toSlackMessage();
  slack.post(analytics.toSlackMessage());
};