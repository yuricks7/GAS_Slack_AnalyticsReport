class DailyRankSheet extends spRankSheet {

  constructor(topN) {
    super('DR(sort)', topN, 4);
    
  }

  toDailyReport() {
    let m = '';
    m += this.toShortDescription() + '\n';
    m += this.toRanking();
    
    return m;
  }
  
 /**
  * 概要文を作成する
  */
  toShortDescription() {
    const LF   = '\n';
    const BOLD = '*';
    
    const dailyReport = new DailyReport();
    const report = dailyReport.data;

    let m = '';
    m += `< おはようございまーす。昨日の成績ですよー${LF}`;
    m += `${BOLD}▼${report.attributes.dataDate}${BOLD}${LF}`;

    const amount    = this.amount;
    const subNumber = new SubNumber();
    const DECIMAL_POINT = 2;
    const data   = {
//      pv : amount.pageviews.subtotal,
//      tpv: subNumber.toInteger(this.values[0][3]),
//      top: amount.avgTimeOnPage.subtotal,
//      ss : amount.sessions.subtotal,
//      pps: amount.pageviewsPerSession.subtotal,
//      sd : amount.avgSessionDuration.subtotal,
//      nu : amount.newUsers.subtotal,
//      us : amount.users.subtotal,
//      br : report.lastDay.bounceRate, // 暫定的に…

      pv : subNumber.toInteger(amount.pageviews.subtotal),
      tpv: subNumber.toInteger(this.separate_(this.values[0][3])),
      top: subNumber.toDecimalPoints(amount.avgTimeOnPage.subtotal, DECIMAL_POINT),
      ss : subNumber.toInteger(amount.sessions.subtotal),
      pps: subNumber.toDecimalPoints(amount.pageviewsPerSession.subtotal, DECIMAL_POINT),
      sd : subNumber.toDecimalPoints(amount.avgSessionDuration.subtotal,  DECIMAL_POINT),
      nu : subNumber.toInteger(amount.newUsers.subtotal),
      us : subNumber.toInteger(amount.users.subtotal),
      br : subNumber.separate(report.lastDay.bounceRate), // 暫定的に…
    }
    
    const CODE_BLOCK = '```';
    m += `${CODE_BLOCK}${LF}`;
    m += 'Pageviews             : ' + data.pv  + ' of '  + data.tpv + ' views' + LF;
    m += 'Time on Page(Avg.)    : ' + data.top + ' sec.' + LF;
    m += 'Sessions              : ' + data.ss  + ' sessions'      + LF;
    m += 'Pageviews/Session     : ' + data.pps + ' pages/session' + LF;
    m += 'Session Duration(Avg.): ' + data.sd  + ' sec.' + LF;
    m += 'Users                 : ' + data.nu  + ' of '  + data.us + ' people' + LF;
    m += 'BounceRate            : ' + data.br  + ' %(*)' + LF;
    m += `${CODE_BLOCK}${LF}`;

    return m;
  }
  
 /**
  * ランキングを作成する
  */
  toRanking() {
    const LF   = '\n';
    const BOLD = '*';
    const CODE_BLOCK = '```';

    // ヘッダー
    const total = this.data.TotalCounts;
    const info = this.getTotalDescription_(total);

    let m = '';
    m += `${BOLD}▼${info}${BOLD}${LF}`;
    
    // 1件ごとのデータ
    let data = {};
    const ranks = this.data.ranks;
    const DELIMITER = ' || ';
    for (let i = 0; i < ranks.length; i ++) {
      data = ranks[i];

      m += `${data.attributes.icon}${data.attributes.title}${LF}`;
      m += `${data.attributes.url}${LF}`;
      
      m += `${CODE_BLOCK}${LF}`;
      m += this.separate_(data.pageviews.subtotal) + ' pv' + DELIMITER;
      m += this.separate_(this.toSecondDecimalPlace_(data.avgTimeOnPage.subtotal)) + ' sec./pv' + DELIMITER;
      m += this.separate_(data.sessions.subtotal) + ' sess.' + DELIMITER;
      m += this.separate_(this.toSecondDecimalPlace_(data.avgSessionDuration.subtotal)) + ' sec./sess.' + DELIMITER;
      m += this.separate_(this.toSecondDecimalPlace_(data.pageviewsPerSession.subtotal)) + ' pv/sess.' + DELIMITER;
      m += this.separate_(this.toPercentage_(data.bounceRate.subtotal)) + ' %' + DELIMITER;
      m += this.separate_(data.newUsers.subtotal) + ' of ' + data.users.subtotal + ' people' + LF;
      m += `${CODE_BLOCK}${LF}`;
      m += `${LF}`;
    }
        
    return m;
  }

 /**
  * アクセスがあった件数によってメッセージを変える
  */
  getTotalDescription_(total) {

    let m = `全 ${total} 件 のアクセスがありました`;
    if (total === 0) {
      m = '残念ながら、昨日はアクセスがありませんでした…';

    } else if (total < 5) {
      m += '…';

    }
    
    return m;
  }
}