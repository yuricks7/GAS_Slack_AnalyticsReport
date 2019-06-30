var ErrorLog = function (errorObject, time) {
  this.time   = time;

  this.Object = errorObject;
  this.stack  = errorObject.stack;

  // 例） at [fileName] :[lineNum] ([functionName])
  var stack  = String(this.stack);

  var functionNameStart = stack.lastIndexOf('(') + 1;
  var functionNameEnd   = stack.length - 2;
  this.function         = stack.slice(functionNameStart, functionNameEnd);

  var fileNameStart = stack.indexOf(' ') + 1;
  var fileNameEnd   = stack.indexOf(':');
  this.scriptFile   = stack.slice(fileNameStart, fileNameEnd);

  this.line        = errorObject.lineNumber;
  this.type        = errorObject.name;
  this.description = errorObject.message;
};

ErrorLog.prototype.output = function(spreadsheet, sheetName) {
  var logs = [
    this.time,
    this.scriptFile,
    this.function,
    this.line,
    this.type,
    this.description
  ];

  var logSheet = spreadsheet.getSheetByName(sheetName);
  var lastRow  = logSheet.getLastRow();
  for (var iLog = 0; iLog < logs.length; iLog++) {
    logSheet.getRange(lastRow + 1, iLog + 1).setValue(logs[iLog]);
  }
}
