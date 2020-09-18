class spRankSheet {

  constructor(sheetName) {
    // スプレッドシートからデータを取得する
    this.ss        = SpreadsheetApp.getActiveSpreadsheet();
    this.srcSheet  = this.ss.getSheetByName(sheetName);
    this.dataRange = this.srcSheet.getDataRange();
    this.values    = this.dataRange.getValues();

    const values = this.values;

    // 上位10件のデータを取得する
    this.data = {};
    this.data.ranks = [];
    for (let rank = 1; rank <= 5; rank++) {
      this.data.ranks.push(this.getRankData_(values, rank));
    }
    
    const attributeValues = values[0];
    this.dataCounts = attributeValues[2];
    this.amount = this.getData_(attributeValues);
  }

 /**
  * 行データをオブジェクトに変換する
  */
  getData_(values) {
    const dataProps = [
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
    const UNDEFINED = '■■';
    for (let n = 0; n < dataProps.length; n++) {
      let prop = dataProps[n];
      data[prop] = {};

      if (prop === 'attributes') {
        data[prop].rank  = values[0];
        data[prop].blog  = values[2];
        data[prop].path  = values[3];
        data[prop].title = values[4];

      } else {
        const ATTRS_INDEX = 4 - 1;
        let j = ATTRS_INDEX + 3 * n - 1;
        data[prop].amp      = values[j + 0];
        data[prop].others   = values[j + 1];
        data[prop].subtotal = values[j + 2];
      }
    }
  
    return data;
  }

 /**
  * 記事1件分のデータを取得する
  */
  getRankData_(values, rank) {
    // slack絵文字
    const rankIcons = [
      ':one:', ':two:',   ':three:', ':four:', ':five:',
      ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'
    ];
    
    const rankIndex  = rank - 1;
    const TABKE_HEADERS = 4;
    const rankValues = values[TABKE_HEADERS + rankIndex];

    let results = {};
    if (!Array.isArray(rankValues)) { // 空の時はそもそもインデックス0も無いので(!変数)だと判定できない模様。
      const UNDEFINED = '■■';

      // 格納
      results = {
        attributes: {
          icon : rankIcons[rankIndex],
          title: UNDEFINED + ' - ' + UNDEFINED + UNDEFINED + UNDEFINED,
          url  : UNDEFINED + UNDEFINED + UNDEFINED + UNDEFINED + UNDEFINED,
        },

        pageviews: {
          amp   : UNDEFINED,
          others: UNDEFINED,
          total : UNDEFINED,
        },

        avgTimeOnPage: {
          amp   : UNDEFINED,
          others: UNDEFINED,
          wAvg  : UNDEFINED,
        },

        sessions: {
          amp   : UNDEFINED,
          others: UNDEFINED,
          total : UNDEFINED,
        },

        pageviewsPerSession: {
          amp   : UNDEFINED,
          others: UNDEFINED,
          wAvg  : UNDEFINED,
        },

        newUsers: {
          amp   : UNDEFINED,
          others: UNDEFINED,
          total : UNDEFINED,
        },

        users: {
          amp   : UNDEFINED,
          others: UNDEFINED,
          total : UNDEFINED,
        },

        bounceRate: {
          amp   : UNDEFINED,
          others: UNDEFINED,
          wAvg  : UNDEFINED,
        },

        avgSessionDuration: {
          amp   : UNDEFINED,
          others: UNDEFINED,
          wAvg  : UNDEFINED,
        },
      };

    } else {
      // アナリティクスのデータから、レポート用に文字列を変換
      const keyWord  = rankValues[2];
      const blogFeed = this.getFeed_(keyWord);

      // 格納
      results = this.getData_(rankValues);
      
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
    const LF   = '\n';
    const BOLD = '*';
    const CODE_BLOCK = '```';

    // ヘッダー
    const total = this.dataCounts;
    const info = this.getTotalDescription_(total);

    let m = '';
    m += `${BOLD}▼${info}${BOLD}${LF}`;
    
    // 1件ごとのデータ
    let data = {};
    const ranks = this.data.ranks;
    const DELIMITER = ' || ';
    for (let i = 0; i < ranks.length; i ++) {
      data = ranks[i];

      m += `${data.attributes.icon}${data.attributes.title}${LF}`;
      m += `${data.attributes.url}${LF}`;
      
      m += `${CODE_BLOCK}${LF}`;
      m += this.separate_(data.pageviews.subtotal) + ' pv' + DELIMITER;
      m += this.separate_(this.toSecondDecimalPlace_(data.avgTimeOnPage.subtotal)) + ' sec./pv' + DELIMITER;
      m += this.separate_(data.sessions.subtotal) + ' sess.' + DELIMITER;
      m += this.separate_(this.toSecondDecimalPlace_(data.avgSessionDuration.subtotal)) + ' sec./sess.' + DELIMITER;
      m += this.separate_(this.toPercentage_(data.bounceRate.subtotal)) + ' %' + DELIMITER;
      m += this.separate_(data.newUsers.subtotal) + ' of ' + data.users.subtotal + ' people' + LF;
      m += `${CODE_BLOCK}${LF}`;
      m += `${LF}`;
    }
        
    return m;
  }
  
 /**
  * アクセスがあった件数によってメッセージを変える
  */
  getTotalDescription_(total) {

    let m = `全 ${total} 件 のアクセスがありました`;
    if (total === 0) {
      m = '残念ながら、昨日はアクセスがありませんでした…';

    } else if (total < 5) {
      m += '…';

    }
    
    return m;
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

}