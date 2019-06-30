function SendAnalyticsReportToSlack() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // レポート
  var dailySheet   = ss.getSheetByName('PV Report');
  var reportValues = dailySheet.getDataRange().getValues();

  const YESTERDAY_ROW   = 16; // 16行目が最新
  var previousDayReport = createAnalyticsReport(reportValues[YESTERDAY_ROW -1]);

  // 記事別ランキング
  var rankingSheet  = ss.getSheetByName('Daily Ranking');
  var rankingValues = rankingSheet.getDataRange().getValues();

  var dailyRanking = createDailyRanking(rankingValues);

  // メッセージをまとめる
  var message = ':male-construction-worker: < おはようございまーす。昨日の成績ですよー' + '\n'
              + previousDayReport + '\n'
              + '\n'
              + dailyRanking;

  //Slackにポスト
  const POST_CHANNEL_NAME   = '50_blog_yuru-wota';
  const DISPLAYED_USER_NAME = 'アクセス解析レポート';
  var mySlack = new Slack(POST_CHANNEL_NAME, DISPLAYED_USER_NAME);
  mySlack.post(message);
}

/**
 * Slack投稿用メッセージのレポート部分を生成する
 *
 * @param {Array} 'PV Report'シートの当日の値（1次元配列）
 *   【Dimensions】ga:pageTitle, ga:pagePath
 *   【Metrics】ga:pageviews, ga:avgTimeOnPage,
 *      ga:newUsers, ga:users, ga:sessions, ga:pageviewsPerSession,
 *      ga:avgSessionDuration, ga:bounceRate
 *   【※Order】-ga:date
 */
var createAnalyticsReport = function(rowValues) {
  // 読みやすいように値を加工しつつ代入
  var reports = {
    date               : Moment.moment(rowValues[0]).format('YYYY/MM/DD (ddd)'),
    pageviews          : rowValues[1],
    avgTimeOnPage      : rowValues[2].toFixed(2),
    newUsers           : rowValues[3],
    allUsers           : rowValues[4],
    sessions           : rowValues[5],
    pagesPerSessions   : rowValues[6].toFixed(2),
    avgSessionDuration : rowValues[7].toFixed(2),
    bounceRate         : (rowValues[8] * 100).toFixed(1)
  }

  var report = '*▼' + reports.date + '*' + '\n';
  report += '```';
  report += 'Pageviews             : ' + reports.pageviews          + ' views'         + '\n';
  report += 'Time on Page(Avg.)    : ' + reports.avgTimeOnPage      + ' sec.'          + '\n';
  report += 'Sessions              : ' + reports.sessions           + ' sessions'      + '\n';
  report += 'Pageviews/Session     : ' + reports.pagesPerSessions   + ' pages/session' + '\n';
  report += 'Session Duration(Avg.): ' + reports.avgSessionDuration + ' sec.'          + '\n';
  report += 'Users                 : ' + reports.newUsers // ※改行しない
                              + ' of ' + reports.allUsers           + ' people'        + '\n';
  report += 'BounceRate            : ' + reports.bounceRate         + ' %'             + '\n';
  report += '```';

  return report;
}

/* --------------↓メモ↓-------------- */
// 余裕が出来たら、レポート↑を桁揃えしたい…
//var showSpace = function() {
//  var num = 1;
//  Logger.log('【\u0020%s】', num);
//  Logger.log('【%s\u0020】', num);
//
//  num = String(1);
//  Logger.log('【\u0020%s】', num);
//  Logger.log('【%s\u0020】', num);
//}
/* --------------↑メモ↑-------------- */

/**
 * Slack投稿用メッセージのランキング部分を生成する
 *
 * @param {array} 'Daily Report'シートの値（2次元配列）
 *   【Dimensions】ga:pageTitle, ga:pagePath
 *   【Metrics】ga:pageviews, ga:avgTimeOnPage,
 *      ga:newUsers, ga:users, ga:sessions, ga:pageviewsPerSession,
 *      ga:avgSessionDuration, ga:bounceRate
 *   【※Order】-ga:pageviews
 * @return {string} 記事別PVランキング
 */
var createDailyRanking = function(values) {
  var ranking = [];

  const HEADER_ROW = 15;
  for(var rankRow = 0; rankRow < 5; rankRow++) {
    var currentRow        = HEADER_ROW + rankRow;
    var currentRankValues = values[currentRow];

    if (!currentRankValues) {
      currentRankValues = [];

      for (var iCol = 0; iCol < values[HEADER_ROW].length; iCol++) {
        currentRankValues.push('■■■■■■');
      }
    }
    ranking.push(createTempRankMsg(rankRow, currentRankValues));
  }

  var rankingMsg = '*▼デイリーランキング*' + '\n';
  rankingMsg = ranking.join('');

  return  rankingMsg;
}

/**
 * 現在の順位のメッセージを作成する
 *
 * @param {num} 現在の順位
 * @param {array} 現在の順位の値が入った配列
 * @return {string} 現在の順位分のメッセージ
 */
var createTempRankMsg = function(rank, rowValues) {

  if (!rowValues[0]) {
    rowValues = [];

    for (var iValue = 0; iValue < rowValues.length; iValue++) {
      rowValues[iValue].push('■■');
      Logger.log(rowValues[iValue]);
    }
  }
  var blogFeedObj = checkBlogFeed(rowValues[0]);
  var title       = blogFeedObj.title;

  // Slackで読みやすいように、値を加工しつつ代入
  var articleTitle  = title + ' - ' + rowValues[0].replace(' - ' + title, '');
  var artivleUrl    = blogFeedObj.url + rowValues[1];
  var pageviews     = rowValues[2];
  var avgTimeOnPage = Number(rowValues[3]).toFixed(2);
  var newUsers      = rowValues[4];
  var allUsers      = rowValues[5];
  var sessions      = rowValues[6];

  var rankIcons = [
    ':one:', ':two:',   ':three:', ':four:', ':five:',
    ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'
  ];

  var m = rankIcons[rank] + articleTitle + '\n'
        + artivleUrl + '\n'
        + '```'
        + pageviews           + ' pv, '
        + '(' + avgTimeOnPage + ' sec./pv), '
        + newUsers  + ' of '  + allUsers      + ' people , '
        + sessions            + ' sessions.'  + '\n'
        + '```' + '\n'
        + '\n';

  return m;
};

/**
 * アナリティクスの記事タイトルから、ブログ名とURLを判断する
 *
 * @param {string} 記事タイトルの文字列
 * @return {object} ブログのタイトルとURLのオブジェクト
 */
var checkBlogFeed = function(checkTarget) {
  var yuru_wotaku_no_susume = {
    title: 'ゆるオタクのすすめ',
    url: 'https://yuru-wota.hateblo.jp'
  };

  var yuru_wota_note = {
    title: 'ゆるおたノート',
    url: 'https://www.yuru-wota.com'
  };

  var blogFeeds = [
    yuru_wotaku_no_susume,
    yuru_wota_note
  ];

  var ret = {};
  var comparisonTitle = '';
  for (var iTarget = 0; iTarget < blogFeeds.length; iTarget++) {

    comparisonTitle = blogFeeds[iTarget].title;
    if (checkTarget.indexOf(comparisonTitle) !== -1) {
      ret = comparisonTitle;
      break;
    }
  }

  return ret = blogFeeds[iTarget];
};
