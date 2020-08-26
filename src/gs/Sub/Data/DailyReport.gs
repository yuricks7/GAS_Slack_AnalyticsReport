class DailyReport extends spDataSheet {

  constructor() {
    // スプレッドシートからデータを取得する
    super('Daily Report'); // 親クラスのコンストラクタを引き継ぐ（=オーバーライド）
    const values = this.dataRange.getValues();

    const totalValues = values[11];
    this.data.total = {
      pageviews          : this.separate_(totalValues[1]),
      avgTimeOnPage      : this.separate_(this.toSecondDecimalPlace_(totalValues[2])),
      sessions           : this.separate_(totalValues[3]),
      pageviewsPerSession: this.separate_(this.toSecondDecimalPlace_(totalValues[4])),
      newUsers           : this.separate_(totalValues[5]),
      users              : this.separate_(totalValues[6]),
      bounceRate         : this.separate_(this.toPercentage_(totalValues[7])),
      avgSessionDuration : this.separate_(this.toSecondDecimalPlace_(totalValues[8])),
    };
    
    const lastDayValues = values[15];
    this.data.lastDay = {
      pageviews          : this.separate_(lastDayValues[1]),
      avgTimeOnPage      : this.separate_(this.toSecondDecimalPlace_(lastDayValues[2])),
      sessions           : this.separate_(lastDayValues[3]),
      pageviewsPerSession: this.separate_(this.toSecondDecimalPlace_(lastDayValues[4])),
      newUsers           : this.separate_(lastDayValues[5]),
      users              : this.separate_(lastDayValues[6]),
      bounceRate         : this.separate_(this.toPercentage_(lastDayValues[7])),
      avgSessionDuration : this.separate_(this.toSecondDecimalPlace_(lastDayValues[8])),
    };
  }

 /**
  * Slack投稿用のメッセージを作成する
  */
  toSlackMessage() {
    const LF   = '\n';
    const BOLD = '*';

    let m = '';
    m += `< おはようございまーす。昨日の成績ですよー${LF}`;
    m += `${BOLD}▼${this.data.attributes.dataDate}${BOLD}${LF}`;
    
    const lastDay = this.data.lastDay;
    const total   = this.data.total;
    const CODE_BLOCK = '```';
    m += `${CODE_BLOCK}${LF}`;
    m += `Pageviews             : ${lastDay.pageviews} of ${total.pageviews} views${LF}`;
    m += `Time on Page(Avg.)    : ${lastDay.avgTimeOnPage} sec.${LF}`;
    m += `Sessions              : ${lastDay.sessions} sessions ${LF}`;
    m += `Pageviews/Session     : ${lastDay.pageviewsPerSession} pages/session${LF}`;
    m += `Session Duration(Avg.): ${lastDay.avgSessionDuration} sec.${LF}`;
    m += `Users                 : ${lastDay.newUsers} of ${lastDay.users} people${LF}`;
    m += `BounceRate            : ${lastDay.bounceRate} %${LF}`;
    m += `${CODE_BLOCK}${LF}`;
    
    return m;
  }
}