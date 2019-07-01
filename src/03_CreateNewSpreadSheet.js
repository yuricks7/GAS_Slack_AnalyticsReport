/**
 * 月イチで当月分のSpreadSheetを作成
 */
function CreateNewSpreadsheet() {
  var scriptProps = PropertiesService.getScriptProperties().getProperties();

  // 原本をFileオブジェクトとして取得し、当月分のSpreadSheetを作成
  const ORIGINAL_SS_ID   = scriptProps.ORIGINAL_SS_ID;
  const TARGET_FOLDER_ID = scriptProps.STORE_TARGET_FOLDER_ID;

  var originalSsFile = DriveApp.getFileById(ORIGINAL_SS_ID);
  var targetForlder  = DriveApp.getFolderById(TARGET_FOLDER_ID);
  var newName        = getNewName();

  var newSS   = originalSsFile.makeCopy(targetForlder).setName(newName);

  // 翌朝のレポート作成に備えて準備
  const NEW_SS_ID     = newSS.getId();
  const PROPERTY_NAME = 'EXPORT_SS_ID';
  var scriptProps = PropertiesService.getScriptProperties().setProperty(PROPERTY_NAME, NEW_SS_ID);
}

/**
 * 実行日の日付からファイル名を生成
 *
 * @return {string} 「YYYYMM」形式の文字列
 */
var getNewName = function() {
  var currentDate = new Date();
  var dateString  = Moment.moment(currentDate).format('YYYYMM');

  return dateString;
};
