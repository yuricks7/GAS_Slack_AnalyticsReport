class SubNumber {

  constructor() {

  }

 /**
  * パーセンテージ用の数値に変換
  *
  * @param {Number} num 数値
  *
  * @return {Number} パーセンテージ（小数点第一位まで）
  */
  toPercentage(num) {
    return this.separate(Number(num * 100).toFixed(1));
  }

 /**
  * 小数点第n位までに変換
  *
  * @param {Number} num 数値
  * @param {Number} decimalPoints 小数点第n位のn
  *
  * @return {Number} 変換後の数値（3桁区切り、小数点第二位まで）
  */
  toDecimalPoints(num, decimalPoints) {
    return this.separate(Number(num).toFixed(decimalPoints));
  }

 /**
  * 整数
  *
  * @param {Number} num 数値
  *
  * @return {Number} 変換後の数値（3桁区切り）
  */
  toInteger(num) {
    return this.separate(num);
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
  separate(num){
    return String(num).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }
}