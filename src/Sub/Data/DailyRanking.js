class DailyRanking extends spDataSheet {

  constructor() {
    // スプレッドシートからデータを取得する
    super('Daily Ranking'); // 親クラスのコンストラクタを引き継ぐ（=オーバーライド）

    // 上位5件のデータを取得する
    this.data.ranks = [];
    const values = this.values;
    for (let rank = 1; rank <= 5; rank++) {
      this.data.ranks.push(this.getRankData_(values, rank));
    }
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
    const rankValues = values[15 + rankIndex];

    let results = {};
    if (!Array.isArray(rankValues)) { // 空の時はそもそもインデックス0も無いので(!変数)だと判定できない模様。
      const UNDEFINED = '■■';

      // 格納
      results = {
        icon               : rankIcons[rankIndex],
        title              : `${UNDEFINED} - ${UNDEFINED}${UNDEFINED}${UNDEFINED}`,
        url                : `${UNDEFINED}${UNDEFINED}${UNDEFINED}${UNDEFINED}`,
        pageviews          : UNDEFINED,
        avgTimeOnPage      : UNDEFINED,
        sessions           : UNDEFINED,
        pageviewsPerSession: UNDEFINED,
        newUsers           : UNDEFINED,
        users              : UNDEFINED,
        bounceRate         : UNDEFINED,
        avgSessionDuration : UNDEFINED,
      };

    } else {
      // アナリティクスのデータをレポート用に変換
      const srcTitle     = rankValues[0];
      const blogFeed     = this.getFeed_(srcTitle);
      const articleTitle = srcTitle.replace(' - ' + blogFeed.title, '');
      
      // 格納
      results = {
        icon               : rankIcons[rankIndex],
        title              : `${blogFeed.title} - ${articleTitle}`,
        url                : `${blogFeed.url}${rankValues[1]}`,
        pageviews          : this.separate_(rankValues[2]),
        avgTimeOnPage      : this.separate_(this.toSecondDecimalPlace_(rankValues[3])),
        sessions           : this.separate_(rankValues[4]),
        pageviewsPerSession: this.separate_(this.toSecondDecimalPlace_(rankValues[5])),
        newUsers           : this.separate_(rankValues[6]),
        users              : this.separate_(rankValues[7]),
        bounceRate         : this.separate_(this.toPercentage_(rankValues[8])),
        avgSessionDuration : this.separate_(this.toSecondDecimalPlace_(rankValues[9])),
      };
    }

    return results;
  };

 /**
  * アナリティクスで取得した記事タイトルからフィードのデータを取得する
  *
  * @return {Object} サイト名とそのURLを格納したオブジェクト
  */
  getFeed_(articleTitle) {
    const blogFeeds = [{
      title: 'ゆるオタクのすすめ',
      url  : 'https://yuru-wota.hateblo.jp'
    }, {
      title: 'ゆるおたノート',
      url  : 'https://www.yuru-wota.com'
    }, {
      title: 'ゆるオタクのつぶやき',
      url  : 'https://monologue.yuru-wota.com'
    }];
    
    // ※サイト名を変更した場合は、以下を調整の必要あり！
    let blogFeed = {};
    for (let i = 0; i < blogFeeds.length; i++) {
      blogFeed = blogFeeds[i];
      if (articleTitle.indexOf(blogFeed.title) === -1) continue;
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
    const total = this.data.attributes.total;
    let info = `全 ${total} 件 のアクセスがありました`;
//    m += `${BOLD}▼全 ${total} 件 のアクセスがありました${BOLD}${LF}`;
    if (total < 5) info += '…';

    let m = '';
    m += `${BOLD}▼${info}${BOLD}${LF}`;
    
    // 1件ごとのデータ
    let data = {};
    const ranks = this.data.ranks;
    const COMMA   = ', ';
    for (let i = 0; i < ranks.length; i ++) {
      data = ranks[i];

      m += `${data.icon}${data.title}${LF}`;
      m += `${data.url}${LF}`;
      
      m += `${CODE_BLOCK}${LF}`;
      m += `${data.pageviews} pv${COMMA}`;
      m += `(${data.avgTimeOnPage} sec/pv${COMMA}`;
      m +=  `${data.bounceRate} %)${COMMA}`;
      m += `${data.newUsers} of ${data.users} people${COMMA}`;
      m += `${data.sessions} sessions${LF}`;
      m += `${CODE_BLOCK}${LF}`;
      m += `${LF}`;
    }
        
    return m;
  }
}