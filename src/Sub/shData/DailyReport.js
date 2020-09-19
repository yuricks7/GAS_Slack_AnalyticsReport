class DailyReport extends spDataSheet {

  constructor() {
    // スプレッドシートからデータを取得する
    super('Daily Report'); // 親クラスのコンストラクタを引き継ぐ（=オーバーライド）
    const values    = this.dataRange.getValues();
    const numFormat = new NumFormat();
    const decimalPoint = 2;

    const amounts = values[11];
    this.data.total = {
      pageviews          : numFormat.toInteger(amounts[1]),
      avgTimeOnPage      : numFormat.toDecimalPoints(amounts[2], decimalPoint),
      sessions           : numFormat.toInteger(amounts[3]),
      pageviewsPerSession: numFormat.toDecimalPoints(amounts[4], decimalPoint),
      newUsers           : numFormat.toInteger(amounts[5]),
      users              : numFormat.toInteger(amounts[6]),
      bounceRate         : numFormat.toPercentage(amounts[7]),
      avgSessionDuration : numFormat.toDecimalPoints(amounts[8], decimalPoint),
    };

    const prevValues = values[15];
    this.data.lastDay = {
      pageviews          : numFormat.toInteger(prevValues[1]),
      avgTimeOnPage      : numFormat.toDecimalPoints(prevValues[2], decimalPoint),
      sessions           : numFormat.toInteger(prevValues[3]),
      pageviewsPerSession: numFormat.toDecimalPoints(prevValues[4], decimalPoint),
      newUsers           : numFormat.toInteger(prevValues[5]),
      users              : numFormat.toInteger(prevValues[6]),
      bounceRate         : numFormat.toPercentage(prevValues[7]),
      avgSessionDuration : numFormat.toDecimalPoints(prevValues[8], decimalPoint),
    };
  }

//  /**
//   * Slack投稿用のメッセージを作成する
//   */
//   toSlackMessage() {
//     const LF   = '\n';
//     const BOLD = '*';

//     let m = '';
//     m += `< おはようございまーす。昨日の成績ですよー${LF}`;
//     m += `${BOLD}▼${this.data.attributes.dataDate}${BOLD}${LF}`;

//     const lastDay = this.data.lastDay;
//     const total   = this.data.total;
//     const CODE_BLOCK = '```';
//     m += `${CODE_BLOCK}${LF}`;
//     m += `Pageviews             : ${lastDay.pageviews} of ${total.pageviews} views${LF}`;
//     m += `Time on Page(Avg.)    : ${lastDay.avgTimeOnPage} sec.${LF}`;
//     m += `Sessions              : ${lastDay.sessions} sessions ${LF}`;
//     m += `Pageviews/Session     : ${lastDay.pageviewsPerSession} pages/session${LF}`;
//     m += `Session Duration(Avg.): ${lastDay.avgSessionDuration} sec.${LF}`;
//     m += `Users                 : ${lastDay.newUsers} of ${lastDay.users} people${LF}`;
//     m += `BounceRate            : ${lastDay.bounceRate} %${LF}`;
//     m += `${CODE_BLOCK}${LF}`;

//     return m;
//   }
}
