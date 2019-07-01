/**
 * 全記事ランキングを他のシートに転記する
 */
function ExportAllArticlesRanking() {
  try {
    // 実行時間の計測スタート
    var exportTimer = new Timer;
    var start       = exportTimer.start();

    // 実際の処理
    var processResults = {};
    processResults = exportRanking();

    // 実行時間の記入
    var logSheet = processResults.spreadsheet.getSheetByName('Import Log');
    var logRow   = logSheet.getLastRow() + 1;
    logSheet.getRange(logRow, 1).setValue(processResults.sheetName);
    logSheet.getRange(logRow, 2).setValue(Moment.moment(start).format('YYYY/MM/DD HH:mm:ss.SSS'));

    var end = exportTimer.finish();
    logSheet.getRange(logRow, 3).setValue(Moment.moment(end).format('YYYY/MM/DD HH:mm:ss.SSS'));

    var time = end - start;
    Logger.log(time);
    logSheet.getRange(logRow, 4).setValue('=$C' + logRow + '-$B' +logRow);

  } catch (e) {
    var occuredTime = new Date();
    var errorLog    = new ErrorLog(e, occuredTime);
    var ss          = SpreadsheetApp.getActiveSpreadsheet();
    errorLog.output(ss, 'エラーログ');

  }
}

/* ------------------- ▼メイン▼ ------------------- */
/**
 * ダウンロードされたランキングデータを別のシートに転記する
 *
 * @return {object} 転記先のスプレッドシート
 */
var exportRanking = function() {
  var scriptProps         = PropertiesService
                            .getScriptProperties().getProperties();
  const DESTINATION_SS_ID = scriptProps.EXPORT_SS_ID;

  var   destinationSS    = SpreadsheetApp.openById(DESTINATION_SS_ID);
  const CONFIG_SHEET_COL = 4;

  var rawDataSS    = SpreadsheetApp.getActiveSpreadsheet();
  var newSheetName = getDataDateMoment(rawDataSS, CONFIG_SHEET_COL);

  deleteSheetNameDuplicated(newSheetName, destinationSS);

  var sheetCounts = destinationSS.getNumSheets();
  Logger.log('シート：全 ' + sheetCounts + ' 枚');

  var exportSheet  = destinationSS.insertSheet(newSheetName, sheetCounts);
  var exportValues = setOutputValues(rawDataSS);

  exportToNewSheet(destinationSS, exportSheet, exportValues);

  var rets = {
    spreadsheet: destinationSS,
    sheetName: newSheetName,
  };

  return rets;
}
/* ------------------- ▲メイン▲ ------------------- */

/**
 * データの日付をMomentオブジェクト形式で取得
 *
 * @param {object} 'ReportConfiguration'シートのあるSpreadsheet
 * @param {num} 'ReportConfiguration'シートの列番号
 * @return {object} Momentオブジェクト形式のデータの日付
 */
var getDataDateMoment = function(rawDataSS, targetCol) {
  var configSheet     = rawDataSS.getSheetByName('Report Configuration');
  var configDataRange = configSheet.getDataRange();
  var configValues    = configDataRange.getValues();

  var dataDate   = configValues[4][targetCol - 1];
  var momentDate = Moment.moment(dataDate).format('YYYYMMDD');

  return momentDate;
};

/**
 * エクスポート先の確認
 *
 * @param {string} 作成予定のシート名
 * @param {object} シートを作成予定のSpreadsheet
 */
var deleteSheetNameDuplicated = function(sheetName, ss) {
  var Sheets = ss.getSheets();
  for (var i = 0; i < Sheets.length; i++){
    if (Sheets[i].getSheetName() === sheetName) {
      ss.deleteSheet(Sheets[i]);
    }
  }
  return
};

/**
 * エクスポート用の二次元配列を作成
 *
 * @return {array} エクスポートする値の二次元配列
 */
var setOutputValues = function(rawDataSS) {
  // レポートを取得
  var rawDataSheet = rawDataSS.getSheetByName('Comp. Ranking');
  var rawdataRange = rawDataSheet.getDataRange();
  var rawValues    = rawdataRange.getValues();
  //  Logger.log(rawValues);

  var outputValues = []; // 初期化

  const FIRST_ROW    = 15; // 見出しからスタート
  var rawDataLastRow = rawdataRange.getLastRow();

  // 生データの行数分繰り返し
  for (var rRawData = FIRST_ROW - 1; rRawData < rawDataLastRow; rRawData++) {
    // 1次元配列化
    var rowValues = pushRowValues(rawValues[rRawData], rRawData);
    // Logger.log('\n' + outputRowValues);

    // 2次元配列化
    outputValues.push(rowValues);
  }

  //  Logger.log(outputValues);
  return outputValues;
}

/**
 * 1行分の値を配列で取得
 *
 * @param {array} 現在の作業行の値（1次元配列）
 * @param {num} 生データ側の現在の作業行インデックス
 * @return {array} エクスポートする値の1次元配列
 */
var pushRowValues = function(inputRowValues, rRawData) {
  var currentOutputRow = [];

  // 順位
  var rank = rRawData - 14;
  if (rank === 0) {
    currentOutputRow.push('Rank');
  } else {
    currentOutputRow.push(rank);
  }

  // ページ種別
  var categories = selectCategory(inputRowValues[0]);
  for (var count = 0; count < categories.length; count++) {
    currentOutputRow.push(categories[count]);
  };

  // ページ名を編集
  const DELETE_STRING = ' - ゆるオタクのすすめ';
  var currentTitle    = inputRowValues[0];
  if (currentTitle.indexOf(DELETE_STRING) !== -1 ) {
    currentTitle = currentTitle.replace(DELETE_STRING, '');
  }

  currentOutputRow.push(currentTitle);

  // URLを編集
  const ADDITIONAL_URL = 'https://www.yuru-wota.com';
  var currentUrl = inputRowValues[1];
  if (currentUrl !== 'Page') {
    currentUrl = ADDITIONAL_URL + currentUrl;
  }

  currentOutputRow.push(currentUrl);

  // 以下、各数値を入力
  for (var iInput = 2; iInput <= 9; iInput++) {
    currentOutputRow.push(inputRowValues[iInput]);
    currentOutputRow.push(getPreviousDayRatio(inputRowValues[iInput]));
  }

//  Logger.log(currentOutputRow);
  return currentOutputRow;
}

/**
 * ページタイトルからページ種別を取得
 *
 * @param {string} サーチ対象のページタイトル
 * @return {array} pageCategories↓の5つ目を除いた配列
 */
var selectCategory = function(pageTitle) {
  var pageCategories = [
    ['numT', 'Type',    'numC', 'Category',      'Page Title'], // 見出し行
    [01,     'TOP',     01,     'TOP',           'ゆるオタクのすすめ'],
    [01,     'TOP',     02,     'Archives',      '記事一覧 - ゆるオタクのすすめ'],
    [02,     'Article', 01,     'Article',       '---'],        //残り
    [03,     'Error',   01,     'PageError',     'Not Found'],
    [03,     'Error',   02,     'EntryError',    'Entry is not found'],
    [03,     'Error',   03,     'CategoryError', 'Category is not found'],
    [03,     'Error',   04,     'UnknownError',  '(not set)'],
    [04,     'Archive', 01,     'Category',      'カテゴリーの記事一覧'],
    [04,     'Archive', 02,     'Annual',        '年間の記事一覧'],
    [04,     'Archive', 03,     'Monthly',       'ヶ月間の記事一覧'],
    [04,     'Archive', 04,     'Daily',         '日間ーの記事一覧'],
    [05,     'Report',  01,     'DataStuio',     '/reporting/']
  ];

  const C_CATEGORY = 4;
  var iCategory = searchCategoryIndex(pageTitle, pageCategories, C_CATEGORY);

  var categoryValues = pageCategories[iCategory].slice(0, pageCategories[iCategory].length - 1);

//  Logger.log('\n【%s】%s', pageTitle, categoryValues);
  return categoryValues;
};

/**
 * ページタイトルからページ種別の行インデックスを取得
 *
 * @param {string} 判定するページタイトル
 * @param {array} ページ種別一覧の二次元配列
 * @param {num} ページ種別一覧の列インデックス
 * @return {num} 一致したページ種別の行インデックス
 */
var searchCategoryIndex = function(pageTitle, pageCategories, cSearchCol) {
  var index = 0;

  switch (pageTitle) {
    // 見出し行
    case (pageCategories[0][cSearchCol]):
      index = 0;
      break;

    // TOPページ
    case (pageCategories[1][cSearchCol]):
      index = 1;
      break;

    // 記事一覧
    case (pageCategories[2][cSearchCol]):
      index = 2;
      break;

    // 各ナントカの記事一覧
    default:
      for (var rCategories = 4; rCategories < pageCategories.length; rCategories++) {
        if (pageTitle.indexOf(pageCategories[rCategories][cSearchCol]) !== -1) {
          index = rCategories;
          break;
        }
        // どれも当てはまらない場合
        index = 3;
      }
  }
  return index;
};

/**
* データの前日比を取得
*
* @param {num} 当日データ
* @return {num} 当日データと前日データの差
* @customfunction
*/
var getPreviousDayRatio = function(currentDayData) {

  var ss = SpreadsheetApp.getActiveSpreadsheet();
//  var previousDaySheet  = ss.getSheetByName();
//  var previousDayRange  = previousDayRange.getDataRange();
//  var previousDayValues = previousDayRange.getValues();

}

/**
 * 説明
 *
 * @param {object} エクスポート先のシート
 * @param {array} エクスポートする値の二次元配列
 * @return {object} エクスポート先のシート
 */
var exportToNewSheet = function(ss, sheet, exportValues) {
  var targetLastRow = exportValues.length;
  var targetLastCol = exportValues[1].length;
  var targetRange   = sheet.getRange(1, 1, targetLastRow, targetLastCol);

  // 見出し行の書式を設定
  setHeaderFormat(sheet, targetLastCol);


  targetRange.setValues(exportValues); //ここで値を入力

  var columns = createColumnsCollection(sheet);
//  Logger.log(columns);
//  Logger.log(columns.array);

  // 書式設定
  for (var iColumns = 0; iColumns < columns.length; iColumns++) {
    columns[iColumns].setNumFormat();
    columns[iColumns].setWidth();
    if (iColumns > 5) {
      columns[iColumns].setGradation(columns[iColumns][5]);

      var criteria = 0; // 0の場合に白くする
      if (columns[iColumns][0] === 'Bounce Rate') {
        criteria = 1; // 「100%」の場合に白くする
      }
      columns[iColumns].setWhite(criteria, columns[iColumns][5]);
    }
  }

};

/**
 * 列ごとに書式を設定する
 *
 * @param {sheet} 列を操作するシート
 * @return {object} 作成したColumnオブジェクトの集合
 */
var createColumnsCollection = function(sheet) {
  var settings = [
    [sheet,   1, 1,  40, 'asd', '#,000 '],
    [sheet,   2, 1,  28, 'asd', '#,#00 '],
    [sheet,   3, 1,  60],
    [sheet,   4, 1,  28, 'asd', '#,#00 '],
    [sheet,   5, 1,  80],
    [sheet,   6, 2, 280],
    [sheet,   8, 2,  60, 'asd', '#,##0 '],
    [sheet,  10, 2, 100, 'asd', '#,##0.00 "sec. "'],
    [sheet,  12, 6,  60, 'asd', '#,##0 '],
    [sheet,  18, 2, 100, 'asd', '#,##0.00 "pages "'],
    [sheet,  20, 2, 100, 'asd', '#,##0.00 "sec. "'],
    [sheet,  22, 2,  80, 'dsd', '0.00 % ']
  ];

  var columns = generateColumns(settings);

  return columns;
};

/**
 * Columnクラスのオブジェクトを生成して配列にする
 *
 * @param {array} 生成したい列の設定（二次元配列）
 * @return {object} 作成したColumnオブジェクトの集合
 */
var generateColumns = function(settings) {
  var columns = [];

  for (var iSettings = 0; iSettings < settings.length; iSettings++) {
    var tempSettings = settings[iSettings];
    var tempSheet    = tempSettings[0];
    var colNum       = tempSettings[1];

    var column = new Column(
     tempSheet,
     colNum,
     tempSettings[2],
     tempSettings[3],
     tempSettings[4],
     tempSettings[5]
     )

    columns.push(column);

  //    Logger.log(column.header);
  }

  return columns;
};

var setHeaderFormat = function(sheet, lastCol) {
  var headerRange = sheet.getRange(1, 1, 1, lastCol);
  const DEEP_BLUE = '#20124d';
  const WHITE     = '#ffffff';
  headerRange.setBackground(DEEP_BLUE)
             .setFontColor(WHITE)
             .setFontWeight('Bold');

  return sheet;
};
