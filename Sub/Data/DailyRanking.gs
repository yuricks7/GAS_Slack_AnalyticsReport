class DailyRanking extends spDataSheet {
 /**
  * コンストラクタ
  */
  constructor() {
    // スプレッドシートからデータを取得する
    super('Daily Ranking'); // 親クラスのコンストラクタを引き継ぐ（=オーバーライド）

    this.data.ranks = [];
    for (let i = 1; i < 5 + 1; i++) {
      this.data.ranks.push(this.getRankData_(i));
    }
  }
  
  getRankData_(rank) {
    const rankIcons = [
      ':one:', ':two:',   ':three:', ':four:', ':five:',
      ':six:', ':seven:', ':eight:', ':nine:', ':keycap_ten:'
    ];
    
    const rankIndex = rank - 1;
    const rowValues = this.dataRange.getValues()[15 + rankIndex];

    const srcTitle = rowValues[0];
    const blogFeed     = this.getFeed_(srcTitle);
    const articleTitle = srcTitle.replace(' - ' + blogFeed.title, '');
    
    const results = {
      icon               : rankIcons[rankIndex],
      title              : `${blogFeed.title} - ${articleTitle}`,
      url                : `${blogFeed.url}${rowValues[1]}`,
      pageviews          : this.separate_(rowValues[2]),
      avgTimeOnPage      : this.separate_(this.toSecondDecimalPlace_(rowValues[3])),
      sessions           : this.separate_(rowValues[4]),
      pageviewsPerSession: this.separate_(this.toSecondDecimalPlace_(rowValues[5])),
      newUsers           : this.separate_(rowValues[6]),
      users              : this.separate_(rowValues[7]),
      bounceRate         : this.separate_(this.toPercentage_(rowValues[8])),
      avgSessionDuration : this.separate_(this.toSecondDecimalPlace_(rowValues[9])),
    };
  
    return results;
    
  };

 /**
  * Slack投稿用のメッセージを作成する
  */
  toSlackMessage() {
    const LF   = '\n';
    const BOLD = '*';
    const CODE_BLOCK = '```';

    // ヘッダー
    let m = '';
    m += `${BOLD}▼全 ${this.data.attributes.total} 件 のアクセスがありました${BOLD}${LF}`;
    
    let data = {};
    const ranks = this.data.ranks;
    for (let i = 0; i < ranks.length; i ++) {
      data = ranks[i];

      m += `${data.icon}${data.title}${LF}`;
      m += `${data.url}${LF}`;
      
      m += `${CODE_BLOCK}${LF}`;
      m += `${data.pageviews} pv, `;
      m += `(${data.avgTimeOnPage} sec./pv), `;
      m += `${data.newUsers} of ${data.users} people , `;
      m += `${data.sessions} sessions.${LF}`;
      m += `${CODE_BLOCK}${LF}`;
      m += `${LF}`;
    }
        
    return m;
  }
  
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
    
    let blogFeed = {};
    for (let i = 0; i < blogFeeds.length; i++) {
      blogFeed = blogFeeds[i];
      if (articleTitle.indexOf(blogFeed.title) === -1) continue;

      break;
    }

    if (!blogFeed) {
      blogFeed = {
        title: '■■',
        url  : '■■',
      };
    }
    
    return blogFeed;
  };
  
}