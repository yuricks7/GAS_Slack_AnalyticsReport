class DailyReport {
 /**
  * コンストラクタ
  */
  constructor() {
    // スプレッドシートからデータを取得する
    this.ss        = SpreadsheetApp.getActiveSpreadsheet();
    this.srcSheet  = this.ss.getSheetByName('Daily Report');
    this.dataRange = this.srcSheet.getDataRange();
    const values   = this.dataRange.getValues();
    this.values    = values;

    const runDate   = Moment.moment(values[1][1]);
    const dataDate  = runDate.subtract(1,'days');
    this.attributes = {
       runDate         :  runDate.format('YYYY/MM/DD'),
      dataDate         : dataDate.format('YYYY/MM/DD'),
      viewName         : values[2][1],
      totalResults     : this.separate_(values[3][1]),
      isContainedSample: values[5][1],
    };

    const totalValues = values[11];
    this.totalResults = {
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
    this.lastDayResults = {
      pageviews          : this.separate_(lastDayValues[1]),
      avgTimeOnPage      : this.separate_(this.toSecondDecimalPlace_(lastDayValues[2])),
      sessions           : this.separate_(lastDayValues[3]),
      pageviewsPerSession: this.separate_(this.toSecondDecimalPlace_(lastDayValues[4])),
      newUsers           : this.separate_(lastDayValues[5]),
      users              : this.separate_(lastDayValues[6]),
      bounceRate         : this.separate_(this.toPercentage_(lastDayValues[7])),
      avgSessionDuration : this.separate_(this.toSecondDecimalPlace_(lastDayValues[8])),
    };
    
    this.Data = {
      attributes: this.attributes,
      total     : this.totalResults,
      lastDay   : this.lastDayResults
    };
  }

 /**
  * パーセンテージ用の数値に変換
  *
  * @return {Number} パーセンテージ（小数点第一位まで）
  */
  toPercentage_(num) {
    return Number(num * 100).toFixed(1);
  }

 /**
  * 小数点第二位までに変換
  *
  * @return {Number} 変換後の数値
  */
  toSecondDecimalPlace_(num) {
    return Number(num).toFixed(2);
  }

 /**
  * 数値をカンマ区切りに変換
  *
  * 【参考】
  * 数値をカンマ区切りにする - Qiita
  * https://qiita.com/zawascript/items/922b5db574ef2b126069
  *
  * @return {String} 3桁ごとにカンマで区切った文字列
  */
  separate_(num){
    return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }

 /**
  * Slack投稿用のメッセージを作成する
  */
  toSlackMessage() {
    let m = '';
    const LF = '\n';
    const BOLD  = '*';
    m += '< おはようございまーす。昨日の成績ですよー' + LF;
    m += BOLD + '▼' + this.Data.attributes.dataDate + BOLD + LF;
    
    const lastDay = this.Data.lastDay;
    const total   = this.Data.total;
    const CODE_BLOCK = '```';
    m += CODE_BLOCK + LF;
    m += 'Pageviews             : ' + lastDay.pageviews  + ' of ' + total.pageviews + ' views'  + LF;
    m += 'Time on Page(Avg.)    : ' + lastDay.avgTimeOnPage + ' sec.'  + LF;
    m += 'Sessions              : ' + lastDay.sessions   + ' sessions' + LF;
    m += 'Pageviews/Session     : ' + lastDay.pageviewsPerSession + ' pages/session' + LF;
    m += 'Session Duration(Avg.): ' + lastDay.avgSessionDuration  + ' sec.' + LF;
    m += 'Users                 : ' + lastDay.newUsers   + ' of ' + lastDay.users   + ' people' + LF;
    m += 'BounceRate            : ' + lastDay.bounceRate + ' %'   + LF;
    m += CODE_BLOCK;
    
    return m;
  }
}