/**
* 列ごとクラス化
*
* @param {object} インスタンス化する列のSheetオブジェクト
* @param {num} 列番号
* @param {num} 列の数
* @param {num} 列幅
* @param {string} 列の数値の書式
* @param {string} 列の昇順'asd'/降順'dsd'
*/
var Column = function(sheet, number, counts, width, order, numFormat) {
  this.sheet     = sheet;
  this.number    = number;
  this.counts    = counts;
  this.width     = width;
  this.order     = order;
  this.numFormat = numFormat;

  this.header    = sheet.getRange(1, number).getValue();
};

Column.prototype = {
  setWidth : function() {
    this.sheet.setColumnWidths(this.number, this.counts, this.width);
  },
  
  setNumFormat : function() {
    const FIRST_ROW = 1;
    var   rowCounts = this.sheet.getLastRow();
    if (this.numFormat) {
      this.sheet.getRange(FIRST_ROW, this.number, rowCounts, this.counts)
                .setNumberFormat(this.numFormat);
    }
    
  }
};

Column.prototype.setGradation = function() {
  if (!this.order) {
    Logger.log("setGradationメソッドの引数に'asd'か'dsd'を指定してください。")
    return;
  }
  
  var tempSheet = this.sheet;
  
  var colorOrders = setColorOrders(this.order);
  
  const FIRST_ROW = 1;
  var   rowCounts = tempSheet.getLastRow();
  var   range     = tempSheet.getRange(FIRST_ROW, this.number, rowCounts, this.counts);
  
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .setGradientMaxpoint(colorOrders[0])
    .setGradientMinpoint(colorOrders[2])
    .setRanges([range])
    .build();
    
  var rules = tempSheet.getConditionalFormatRules();
  rules.push(rule);
  
  tempSheet.setConditionalFormatRules(rules);
  
  return range;
}

var setColorOrders = function(tempOrder) {
  const RED   = '#e67c73';
  const PINK  = '#f3beb9';
  const WHITE = '#FFFFFF';

  var colors = [];
  if (tempOrder === 'asd') {
    colors.push(RED);
    colors.push(PINK);
    colors.push(WHITE);
    
  } else if (tempOrder === 'dsd') {
    colors.push(WHITE);
    colors.push(PINK);
    colors.push(RED);
  }
  
  return colors;
};

/**
* 指定の値があったら白っぽくする条件付き書式を設定
*
* @return {range} 条件付き書式を設定した範囲
*/
Column.prototype.setWhite = function(criteria) {
  if (!this.order) {
    Logger.log("setWhiteメソッドの第2引数に'asd'か'dsd'を指定してください。")
    return;
  }
  
  var tempSheet   = this.sheet;
  const FIRST_ROW = 1;
  var   rowCounts = tempSheet.getLastRow();
  var   range     = tempSheet.getRange(FIRST_ROW, this.number, rowCounts, this.counts);

  if (!criteria) criteria = 0;
  if (this.order === 'dsd') criteria = 1; // 「100%」を白くする

  const LIGHT_GRAY = '#efefef';
  var rule = SpreadsheetApp.newConditionalFormatRule()
    .whenNumberEqualTo(criteria)
    .setFontColor(LIGHT_GRAY)
    .setItalic(true)
    .setRanges([range])
    .build();

  var rules = tempSheet.getConditionalFormatRules();
  rules.push(rule);
  tempSheet.setConditionalFormatRules(rules);
  
  return range;
};
