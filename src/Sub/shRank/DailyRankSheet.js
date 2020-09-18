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
    const symbol = new SlackSymbol();
    const LF   = symbol.lf;
    const BOLD = symbol.bold;
    const CODE_BLOCK = symbol.codeBlock;
    
    // 一部、生データを使用する
    const dailyReport = new DailyReport();
    const report      = dailyReport.data;

    // メッセージの作成
    let m = '';
    m += `< おはようございまーす。昨日の成績ですよー${LF}`;
    m += `${BOLD}▼${report.attributes.dataDate}${BOLD}${LF}`;

    const numFormat     = new NumFormat();
    const DECIMAL_POINT = 2;
    const amount = this.amount;

    const pv  = numFormat.toInteger(amount.pageviews.subtotal);
    const tpv = numFormat.toInteger(this.values[0][3]);
    const top = numFormat.toDecimalPoints(amount.avgTimeOnPage.subtotal, DECIMAL_POINT);
    const ss  = numFormat.toInteger(amount.sessions.subtotal);
    const pps = numFormat.toDecimalPoints(amount.pageviewsPerSession.subtotal, DECIMAL_POINT);
    const sd  = numFormat.toDecimalPoints(amount.avgSessionDuration.subtotal,  DECIMAL_POINT);
    const nu  = numFormat.toInteger(amount.newUsers.subtotal);
    const au  = numFormat.toInteger(amount.users.subtotal);
    const br  = numFormat.separate(report.lastDay.bounceRate); // 暫定的に…

    m += CODE_BLOCK;
    m += 'Pageviews             : ' + pv  + ' of '  + tpv + ' views' + LF;
    m += 'Time on Page(Avg.)    : ' + top + ' sec.'     + LF;
    m += 'Sessions              : ' + ss  + ' sessions' + LF;
    m += 'Pageviews/Session     : ' + pps + ' pages/session' + LF;
    m += 'Session Duration(Avg.): ' + sd  + ' sec.' + LF;
    m += 'Users                 : ' + nu  + ' of '  + au + ' people' + LF;
    m += 'BounceRate            : ' + br  + ' %(*)' + LF;
    m += CODE_BLOCK;
    m += LF;

    return m;
  }
  
 /**
  * ランキングを作成する
  */
  toRanking() {
    const symbol = new SlackSymbol();
    const LF   = symbol.lf;
    const BOLD = symbol.bold;
    const CODE_BLOCK = symbol.codeBlock;

    // ヘッダー
    const total = this.data.TotalCounts;
    const info = this.getTotalDescription_(total);

    let m = '';
    m += `${BOLD}▼${info}${BOLD}${LF}`;
    
    // 1件ごとのデータ
    let data = {};
    let nums = {};
    const ranks = this.data.ranks;
    const DELIMITER = ' || ';
    for (let i = 0; i < ranks.length; i ++) {
      data = ranks[i];

      const attr = data.attributes;
      m += `${attr.icon}${attr.title}${LF}`;
      m += `${attr.url}${LF}`;
      
      const numFormat     = new NumFormat();
      const DECIMAL_POINT = 2;
      const pv  = numFormat.toInteger(data.pageviews.subtotal);
      const top = numFormat.toDecimalPoints(data.avgTimeOnPage.subtotal, DECIMAL_POINT);
      const ss  = numFormat.toInteger(data.sessions.subtotal);
      const sd  = numFormat.toDecimalPoints(data.avgSessionDuration.subtotal, DECIMAL_POINT);
      const pps = numFormat.toDecimalPoints(data.pageviewsPerSession.subtotal, DECIMAL_POINT);
      const br  = numFormat.toPercentage(data.bounceRate.subtotal);
      const nu  = numFormat.toInteger(data.newUsers.subtotal);
      const au  = numFormat.toInteger(data.users.subtotal);
      
      m += CODE_BLOCK;
      m += pv  + ' pv'  + DELIMITER;
      m += top + ' sec./pv'    + DELIMITER;
      m += ss  + ' sess.'      + DELIMITER;
      m += sd  + ' sec./sess.' + DELIMITER;
      m += pps + ' pv/sess.'   + DELIMITER;
      m += br  + ' %'   + DELIMITER;
      m += nu  + ' of ' + au   + ' people' + LF;
      m += CODE_BLOCK;
      m += LF;
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