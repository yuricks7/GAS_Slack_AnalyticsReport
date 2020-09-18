/**
 * Slackにメッセージを投稿する
 */
const PostDailyAccessReport = () => {
  const slack      = new Slack();
  const dailySheet = new DailyRankSheet(5);

  slack.post(dailySheet.toDailyReport());
};
