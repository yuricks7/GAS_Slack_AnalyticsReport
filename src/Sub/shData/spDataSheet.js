class spDataSheet {

  constructor(sheetName) {
    // スプレッドシートからデータを取得する
    this.ss        = SpreadsheetApp.getActiveSpreadsheet();
    this.srcSheet  = this.ss.getSheetByName(sheetName);
    this.dataRange = this.srcSheet.getDataRange();
    const values   = this.dataRange.getValues();
    this.values    = values;

    this.configSheet  = this.ss.getSheetByName('config');
    this.configRange  = this.configSheet.getDataRange();
    this.configValues = this.configRange.getValues();
    const dataDate    = Moment.moment(this.configValues[3][2]);

    const DATA_COL = 2;
    const runDate     = Moment.moment(values[1][DATA_COL]-1);
    const DATE_FORMAT = 'YYYY/MM/DD (ddd)';
    const numFormat = new NumFormat();
    const attributes = {
       runDate         :  runDate.format(DATE_FORMAT),
      dataDate         : dataDate.format(DATE_FORMAT),
      viewName         : values[2][DATA_COL],
      total            : numFormat.toInteger(values[3][DATA_COL]),
      isContainedSample: values[5][DATA_COL],
    };

    this.data = {
      attributes: attributes
    };
  }

 /**
  * Slack投稿用のメッセージを作成する
  */
  toSlackMessage() {

  }
}
