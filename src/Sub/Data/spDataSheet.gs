class spDataSheet {
 /**
  * コンストラクタ
  */
  constructor(sheetName) {
    // スプレッドシートからデータを取得する
    this.ss        = SpreadsheetApp.getActiveSpreadsheet();
    this.srcSheet  = this.ss.getSheetByName(sheetName);
    this.dataRange = this.srcSheet.getDataRange();
    const values   = this.dataRange.getValues();
    this.values    = values;

    const ATTRIBUTE_COL = 1;
    const runDate    = Moment.moment(values[1][ATTRIBUTE_COL]);
    const dataDate   = runDate.subtract(1,'days');
    const attributes = {
       runDate         :  runDate.format('YYYY/MM/DD'),
      dataDate         : dataDate.format('YYYY/MM/DD'),
      viewName         : values[2][ATTRIBUTE_COL],
      total            : this.separate_(values[3][ATTRIBUTE_COL]),
      isContainedSample: values[5][ATTRIBUTE_COL],
    };

    this.data = {
      attributes: attributes
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
    const LF   = '\n';
    const BOLD = '*';

    let m = '';
    
    return m;
  }
}