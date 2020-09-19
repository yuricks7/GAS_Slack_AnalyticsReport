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
    const lf   = symbol.lf;
    const bold = symbol.bold;
    const codeBlock = symbol.codeBlock;

    // 一部、生データを使用する
    const dailyReport = new DailyReport();
    const report      = dailyReport.data;

    // メッセージの作成
    let m = '';
    m += `< おはようございまーす。昨日の成績ですよー${lf}`;
    m += `${bold}▼${report.attributes.dataDate}${bold}${lf}`;

    const numFormat    = new NumFormat();
    const decimalPoint = 2;
    const amount = this.amount;

    const pv  = numFormat.toInteger(amount.pageviews.subtotal);
    const tpv = numFormat.toInteger(this.values[0][3]);
    const top = numFormat.toDecimalPoints(amount.avgTimeOnPage.subtotal, decimalPoint);
    const ss  = numFormat.toInteger(amount.sessions.subtotal);
    const pps = numFormat.toDecimalPoints(amount.pageviewsPerSession.subtotal, decimalPoint);
    const sd  = numFormat.toDecimalPoints(amount.avgSessionDuration.subtotal,  decimalPoint);
    const nu  = numFormat.toInteger(amount.newUsers.subtotal);
    const au  = numFormat.toInteger(amount.users.subtotal);
    const br  = numFormat.separate(report.lastDay.bounceRate); // 暫定的に…

    m += codeBlock;
    m += 'Pageviews             : ' + pv  + ' of '  + tpv + ' views' + lf;
    m += 'Time on Page(Avg.)    : ' + top + ' sec.'     + lf;
    m += 'Sessions              : ' + ss  + ' sessions' + lf;
    m += 'Pageviews/Session     : ' + pps + ' pages/session' + lf;
    m += 'Session Duration(Avg.): ' + sd  + ' sec.' + lf;
    m += 'Users                 : ' + nu  + ' of '  + au + ' people' + lf;
    m += 'BounceRate            : ' + br  + ' %(*)' + lf;
    m += codeBlock;
    m += lf;

    return m;
  }

 /**
  * ランキングを作成する
  */
  toRanking() {
    const symbol = new SlackSymbol();
    const lf   = symbol.lf;
    const bold = symbol.bold;
    const codeBlock = symbol.codeBlock;

    // ヘッダー
    const total = this.data.TotalCounts;
    const info = this.getTotalDescription_(total);

    let m = '';
    m += `${bold}▼${info}${bold}${lf}`;

    // 1件ごとのデータ
    let rank = {};
    const ranks     = this.data.ranks;
    const delimiter = symbol.myDelimiter;
    for (let i = 0; i < ranks.length; i ++) {
      rank = ranks[i];

      const attr = rank.attributes;
      m += `${attr.icon}${attr.title}${lf}`;
      m += `${attr.url}${lf}`;

      const numFormat    = new NumFormat();
      const decimalPoint = 2;

   console.log(rank.pageviews);

      const pv  = numFormat.toInteger(rank.pageviews.subtotal);
      const top = numFormat.toDecimalPoints(rank.avgTimeOnPage.subtotal, decimalPoint);
      const ss  = numFormat.toInteger(rank.sessions.subtotal);
      const sd  = numFormat.toDecimalPoints(rank.avgSessionDuration.subtotal, decimalPoint);
      const pps = numFormat.toDecimalPoints(rank.pageviewsPerSession.subtotal, decimalPoint);
      const br  = numFormat.toPercentage(rank.bounceRate.subtotal);
      const nu  = numFormat.toInteger(rank.newUsers.subtotal);
      const au  = numFormat.toInteger(rank.users.subtotal);

      m += codeBlock;
      m += pv  + ' pv'  + delimiter;
      m += top + ' sec./pv'    + delimiter;
      m += ss  + ' sess.'      + delimiter;
      m += sd  + ' sec./sess.' + delimiter;
      m += pps + ' pv/sess.'   + delimiter;
      m += br  + ' %'   + delimiter;
      m += nu  + ' of ' + au   + ' people' + lf;
      m += codeBlock;
      m += lf;
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
