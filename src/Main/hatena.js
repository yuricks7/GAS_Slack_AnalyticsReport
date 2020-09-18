const test = () => {
  getSiteContent(login());
};

/**
 * ログイン操作
 *
 * 【参考】
 * 【初心者向けのGAS】スクレイピングのためにログインページで自動ログインする方法 | よこのじ.work
 * https://yokonoji.work/gas-scraping-login
 */
const login = () => {
  const LOGIN_URL = 'https://www.hatena.ne.jp/login';
  
  // 基本設定
  const props = PropertiesService.getScriptProperties();
  const hatenaLoginId  = props.getProperty('hatena_login_id');
  const hatenaPassword = props.getProperty('hatena_password');
  
  // POSTに使用するオプション  
  const options = {
    method : 'post',
    // 書き方が正しくないかも…？
    payload: {
      loginId : hatenaLoginId,
      password: hatenaPassword,
      login   : 'ログイン',
    },
    followRedirects: false
  };

  // POSTリクエスト
  const post_response = UrlFetchApp.fetch(LOGIN_URL, options);

  // レスポンスからcookieを取得
  const cookies = post_response.getHeaders()['Set-Cookie'];

// →GASからログインはできないっぽい…？
//  const content = post_response.getContentText('UTF-8'); // ログイン失敗のHTMLが返ってくる
//  console.log(content);

  return cookies;
};

/**
 * GETリクエストでスクレイピング
 *
 * 【参考】
 * 【初心者向けのGAS】スクレイピングのためにログインページで自動ログインする方法 | よこのじ.work
 * https://yokonoji.work/gas-scraping-login
 */
const getSiteContent = (cookies) => {
  const headers = { Cookie: cookies };
  const get_options = {
    method : 'get',
    headers: headers,
    followRedirects: false
  };
 
  const SCRAPING_URL = 'https://blog.hatena.ne.jp/yuricks7/yuru-wota.hateblo.jp/accesslog';
  
  // GETリクエスト
  const get_respoinse = UrlFetchApp.fetch(SCRAPING_URL, get_options);
  const content = get_respoinse.getContentText('UTF-8');
  
  console.log(content);

};