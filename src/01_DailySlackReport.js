function SendAnalyticsReportToSlack() {
  try {
    const POST_CHANNEL_NAME   = '50_blog_yuru-wota';
    const DISPLAYED_USER_NAME = 'アクセス解析レポート';
    const text = generateMessageForSlack();

    //Slackにポスト
    var mySlack = new Slack(POST_CHANNEL_NAME, DISPLAYED_USER_NAME);
    mySlack.post(text);

  } catch (e) {
    var occuredTime = new Date();
    var errorLog    = new ErrorLog(e, occuredTime);
    errorLog.output(ss, 'エラーログ');

  }
}

/**
 * Slack投稿用にメッセージを連結する
 *
 * @return {string} 作成したメッセージ
 */
var generateMessageForSlack = function() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // レポート
  var dailyReport = generatePreviousDayReport(ss);

  // 記事別ランキング
  var dailyRanking = generateDailyRanking(ss);

  // メッセージをまとめる
  var message = ':male-construction-worker: < おはようございまーす。昨日の成績ですよー' + '\n';
  message += dailyReport + '\n'
  message += '\n'
  message += dailyRanking;

  return message;
}

/**
 * 前日のデータからレポートを生成する
 *
 * @param {object} 抽出対象のスプレッドシート
 * @return {string} 前日のレポート
 * @customfunction
 */
var generatePreviousDayReport = function(ss) {
  var dailySheet   = ss.getSheetByName('PV Report');
  var reportValues = dailySheet.getDataRange().getValues();

  const YESTERDAY_ROW   = 16; // 16行目が最新
  var previousDayReport = createReportMessage(reportValues[YESTERDAY_ROW -1]);

  return previousDayReport;
}

/**
 * データからSlack投稿用メッセージに整形する
 *
 * @param {array} 'PV Report'シートの当日の値（1次元配列）
 *   【Dimensions】ga:pageTitle, ga:pagePath
 *   【Metrics】ga:pageviews, ga:avgTimeOnPage,
 *      ga:newUsers, ga:users, ga:sessions, ga:pageviewsPerSession,
 *      ga:avgSessionDuration, ga:bounceRate
 *   【※Order】-ga:date
 * @return {string} 整形したメッセージ
 */
var createReportMessage = function(rowValues) {
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

  var reportMsg = '*▼' + reports.date + '*' + '\n';
  reportMsg += '```';
  reportMsg += 'Pageviews             : ' + reports.pageviews          + ' views'         + '\n';
  reportMsg += 'Time on Page(Avg.)    : ' + reports.avgTimeOnPage      + ' sec.'          + '\n';
  reportMsg += 'Sessions              : ' + reports.sessions           + ' sessions'      + '\n';
  reportMsg += 'Pageviews/Session     : ' + reports.pagesPerSessions   + ' pages/session' + '\n';
  reportMsg += 'Session Duration(Avg.): ' + reports.avgSessionDuration + ' sec.'          + '\n';
  reportMsg += 'Users                 : ' + reports.newUsers // ※改行しない
                              + ' of ' + reports.allUsers           + ' people'        + '\n';
  reportMsg += 'BounceRate            : ' + reports.bounceRate         + ' %'             + '\n';
  reportMsg += '```';

  return reportMsg;
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
 * 前日のデータからランキングを生成する
 *
 * @param {object} 抽出対象のスプレッドシート
 * @return {string} 前日のランキング
 * @customfunction
 */
var generateDailyRanking = function(ss) {
  var rankingSheet  = ss.getSheetByName('Daily Ranking');
  var rankingValues = rankingSheet.getDataRange().getValues();

  var dailyRanking = joinRankingMessage(rankingValues);

  return dailyRanking;
}

/**
 * Slack投稿用にランキング部分を整形する
 *
 * @param {array} 'Daily Report'シートの値（2次元配列）
 *   【Dimensions】ga:pageTitle, ga:pagePath
 *   【Metrics】ga:pageviews, ga:avgTimeOnPage,
 *      ga:newUsers, ga:users, ga:sessions, ga:pageviewsPerSession,
 *      ga:avgSessionDuration, ga:bounceRate
 *   【※Order】-ga:pageviews
 * @return {string} 記事別PVランキング
 */
var joinRankingMessage = function(values) {
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
