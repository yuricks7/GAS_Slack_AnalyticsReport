/**
 * SlackEndPointクラス
 * 
 * 【参照】
 * Slack API | Slack
 * https://api.slack.com/
 * 
 * 【使用例】
 * ```
 * const endPoint = new SlackEndPoint(path, query);
 * this.apiOperator.GET(endPoint.url);
 * ```
 */
class SlackEndPoint {
  /**
   * SlackEndPointクラスのインスタンスを生成する
   *
   * @note
   * URIの書式：`${this.baseUrl}${action}`
   *
   * @param {string} path  URIの`${action}`の部分
   * @param {object} query 絞り込み条件
   */
  constructor(path, query) {
    this.baseUrl = 'https://slack.com/api/';

    this.path  = path;
    this.query = query;

    // APIの設定値
    const props       = PropertiesService.getScriptProperties();
    this.apiToken     = props.getProperty('api_token');
    this.commonParams = `token=${this.apiToken}`;
    
    this.url = this.generate(path, query);
  }

  /**
   * HTTPリクエストのメソッド用URLを生成する
   *
   * @note
   * URIの書式：`/1/category/{value}/item`?`key=value`&`key=value`…
   *
   * @param {string} path  URIの`category/{value}/item`の部分
   * @param {object} query 絞り込み条件
   *
   * @return {string} 生成したエンドポイントURL
   */
  generate(path, query) {

    // クエリの数で処理を分ける
    let queryString = '';
    switch (true) {
      case (!query):
        queryString = '????';
        break;

      case (!Array.isArray(query)):
        queryString = `${query.key}=${query.value}`;
        break;

      default:
        // クエリをURL連結用の文字列に変換
        let requestQueries = [];
        for (let i = 0; i < query.length; i++) {
          let param = query[i];
          requestQueries.push(`${param.key}=${param.value}`);
        }
        queryString = requestQueries.join('&');
        break;
    }

    // 連結
    return `${this.baseUrl}${path}?${this.commonParams}&${queryString}`;
  }
}