/**
 * Slackにメッセージを投稿する
 */
const PostDailyAccessReport = () => {
  const slack      = new Slack();
  const dailySheet = new DailyRankSheet(10);

  slack.post(dailySheet.toDailyReport());
};
