/**
 * Slackにメッセージを投稿する
 */
const postSlack = () => {
  const analytics = new DailyReport();
  const rankings  = new DailyRanking();

  let m = '';
  m += analytics.toSlackMessage() + '\n';
  m +=  rankings.toSlackMessage();

  const slack = new Slack();
  slack.post(m);
};
