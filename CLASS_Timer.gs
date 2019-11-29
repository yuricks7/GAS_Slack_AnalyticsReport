/**
 * ●●するクラス
 * ※あらかじめ使用するプロジェクトにMomentライブラリを導入しておくこと！
 *
 * @param {}
 * @param {}
 * @param {}
 * @param {}
 */
var Timer = function(sheetName, sheet) {
  this.sheetName = sheetName;
  this.sheet     = sheet;
}

/**
 * ●●する
 *
 * @param {}
 * @param {}
 * @param {}
 * @param {}
 * @return {}
 */

Timer.prototype = {
  start : function() {
    return new Date;
  },

  finish : function() {
    return new Date;
  }
};

Timer.prototype.getMomentString = function(date, format) {
  if (!date) {
    date = new Date;
  } else if (!format) {
    format = 'yyyy/mm/dd hh:mm:ss';
  }
  return Moment.moment(date).format(format);
};

//Timer.prototype.getProcessTime = function() {
//  return this.finish - this.start;
//};

/**
 * ●●する
 *
 * @param {}
 * @param {}
 * @param {}
 * @param {}
 * @return {}
 */

//Timer.prototype.getProcessTime = function(argument) {
//  if (!this.sheet) {
//    const SHEET_NAME = 'Log';
//    var   ss         = SpreadsheetApp.getActiveSpreadsheet();
//    this.sheet = ss.getSheetByName(SHEET_NAME);
//    Logger.log('引き数が無いので、シート「' + SHEET_NAME + '」を作成しました。')
//  }
//
//  var dataRange = this.sheet.getDataRange();
//  var lastRow     = dataRange.getLastRow();
//
//  const FIRST_ROW = xxxxxxxx; // 見出し行
//
//
//  return sheet;
//};
