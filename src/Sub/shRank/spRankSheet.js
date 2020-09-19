class spRankSheet {

  constructor(sheetName, topN, attrCols) {
    // スプレッドシートからデータを取得する
    this.ss        = SpreadsheetApp.getActiveSpreadsheet();
    this.srcSheet  = this.ss.getSheetByName(sheetName);
    this.dataRange = this.srcSheet.getDataRange();
    this.values    = this.dataRange.getValues();

    const values = this.values;

    // 上位n件のデータを取得する
    this.data = {};
    this.data.ranks = [];
    for (let rank = 1; rank <= topN; rank++) {
      this.data.ranks.push(this.getRankData_(values, rank, attrCols));
    }

    const attributeValues = values[0];
    this.data.TotalCounts = attributeValues[2];
    this.amount           = this.getData_(attributeValues, attrCols);
  }

 /**
  * 記事1件分のデータを取得する
  */
  getRankData_(values, rank, attrCols) {
    const symbol = new SlackSymbol();
    const rankIcons = symbol.rankIcons;
    const error     = symbol.error;

    const rankIndex  = rank - 1;
    const headerRows = 4;
    const rankValues = values[headerRows + rankIndex];

    let results = {};
    if (!rankValues[3]) { // 空の時はそもそもインデックス0も無いので`(!変数)`では判定できない模様。
      // 格納
      results = this.inputAllError_(error);

      // 追加
      results = {
        attributes: {
          icon : rankIcons[rankIndex],
          title: `${error} - ${error}${error}${error}`,
          url  : `${error}${error}${error}${error}${error}`,
        }
      }

    } else {
      // アナリティクスのデータから、レポート用に文字列を変換
      const keyWord  = rankValues[2];
      const blogFeed = this.getFeed_(keyWord);

      // 格納
      results = this.getData_(rankValues, attrCols);

      // 追加
      results.attributes = {
        icon : rankIcons[rankIndex],
        blog : blogFeed.title, // 上書き
        title: blogFeed.title + ' - ' + results.attributes.title,
        url  : blogFeed.url + results.attributes.path,
      }
    }

    return results;
  };

  inputAllError_(error) {
    // オブジェクトのプロパティを準備
    const propNames = [
      'attributes',
      'pageviews',
      'avgTimeOnPage',
      'sessions',
      'pageviewsPerSession',
      'newUsers',
      'users',
      'bounceRate',
      'avgSessionDuration',
    ];

    const valNames = [
      'amp',
      'others',
      'subtotal'
    ];

    // 格納
    let data = {};
    for (let n = 0; n < propNames.length; n++) {
      let prop = propNames[n];
      data[prop] = {};

      for (let j = 0; j < valNames.length; j++) {
        data[prop][valNames[j]] = error; // 代入できてないらしい…

      console.log(data[prop][valNames[j]]);

      }
    }

    return data;
  }

 /**
  * 行データをオブジェクトに変換する
  */
  getData_(values, attrCols) {
    const propNames = [
      'attributes',
      'pageviews',
      'avgTimeOnPage',
      'sessions',
      'pageviewsPerSession',
      'newUsers',
      'users',
      'bounceRate',
      'avgSessionDuration',
    ];

    let data = {};
    for (let n = 0; n < propNames.length; n++) {
      let prop = propNames[n];
      data[prop] = {};

// ここでまとめて数値を編集したい
//      const ATTRS_INDEX = attrCols - 1;
//      let j = ATTRS_INDEX + 3 * n - 1;
//      const subNumber = new SubNumber();
//      switch (prop) {
//        case 'attributes':
//          data[prop].rank  = values[0];
//          data[prop].blog  = values[2];
//          data[prop].path  = values[3];
//          data[prop].title = values[4];
//
//        case 'avgTimeOnPage':
//        case 'pageviewsPerSession':
//        case 'avgSessionDuration':
//          const DECIMAL_POINT = 2;
//          data[prop].amp      = subNumber.toDecimalPoints(values[j + 0], DECIMAL_POINT);
//          data[prop].others   = subNumber.toDecimalPoints(values[j + 1], DECIMAL_POINT);
//          data[prop].subtotal = subNumber.toDecimalPoints(values[j + 2], DECIMAL_POINT);
//
//        case 'bounceRate':
//          data[prop].amp      = subNumber.toPercentage(values[j + 0]);
//          data[prop].others   = subNumber.toPercentage(values[j + 1]);
//          data[prop].subtotal = subNumber.toPercentage(values[j + 2]);
//
//        default:
//          data[prop].amp      = subNumber.toInteger(values[j + 0]);
//          data[prop].others   = subNumber.toInteger(values[j + 1]);
//          data[prop].subtotal = subNumber.toInteger(values[j + 2]);
//     }

      if (prop === 'attributes') {
        data[prop].rank  = values[0];
        data[prop].blog  = values[2];
        data[prop].path  = values[3];
        data[prop].title = values[4];

      } else {
        const ATTRS_INDEX = attrCols - 1;
        let j = ATTRS_INDEX + 3 * n - 1;
        data[prop].amp      = values[j + 0];
        data[prop].others   = values[j + 1];
        data[prop].subtotal = values[j + 2];
      }
    }

    return data;
  }

 /**
  * アナリティクスで取得した記事タイトルからフィードのデータを取得する
  *
  * @return {Object} サイト名とそのURLを格納したオブジェクト
  */
  getFeed_(keyWord) {
    const blogFeeds = [{
      keyWord: 'ススメ',
      title: 'ゆるオタクのすすめ',
      url  : 'https://yuru-wota.hateblo.jp'
    }, {
      keyWord: 'ノート',
      title: 'ゆるおたノート',
      url  : 'https://www.yuru-wota.com'
    }, {
      keyWord: 'つぶやき',
      title: 'ゆるオタクのつぶやき',
      url  : 'https://monologue.yuru-wota.com'
    }];

    // ※サイト名を変更した場合は、以下を調整の必要あり！
    let blogFeed = {};
    for (let i = 0; i < blogFeeds.length; i++) {
      blogFeed = blogFeeds[i];
      if (String(keyWord).indexOf(blogFeed.keyWord) === -1) continue;
      break;
    }

    return blogFeed;
  };

 /**
  * Slack投稿用のメッセージを作成する
  */
  toSlackMessage() {

  }
}
