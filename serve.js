// 簡易HTTPサーバー
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BUILD_DIR = path.join(__dirname, 'build');

// MIMEタイプのマッピング
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// 404ページ
const NOT_FOUND_PAGE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>404 - ページが見つかりません</title>
  <style>
    body {
      font-family: sans-serif;
      color: #fff;
      background-color: #0A192F;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background-color: #172a46;
      border-radius: 8px;
    }
    h1 { color: #64FFDA; }
    a { color: #64FFDA; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404 - ページが見つかりません</h1>
    <p>お探しのページは存在しないか、移動した可能性があります。</p>
    <p><a href="/">ホームに戻る</a></p>
  </div>
</body>
</html>
`;

// HTTPサーバーの作成
const server = http.createServer((req, res) => {
  console.log(`📝 リクエスト: ${req.method} ${req.url}`);
  
  // URLからパスを取得（クエリパラメータを除去）
  let filePath = path.join(BUILD_DIR, req.url.split('?')[0]);
  
  // ディレクトリの場合、index.htmlを参照
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  
  // 実際のパス（存在しない場合はindex.htmlにフォールバック - SPAのため）
  if (!fs.existsSync(filePath)) {
    // SPA用にルートのindex.htmlにフォールバック
    const rootIndexPath = path.join(BUILD_DIR, 'index.html');
    if (fs.existsSync(rootIndexPath)) {
      filePath = rootIndexPath;
    } else {
      // 404エラー
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(NOT_FOUND_PAGE);
      return;
    }
  }
  
  // ファイル拡張子を取得
  const extname = path.extname(filePath);
  
  // Content-Typeを設定
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // ファイルを読み込んでレスポンスとして送信
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // ファイルが見つからない場合
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(NOT_FOUND_PAGE);
      } else {
        // サーバーエラー
        res.writeHead(500);
        res.end(`サーバーエラー: ${err.code}`);
      }
    } else {
      // 成功
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// サーバーを起動
server.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`📂 配信ディレクトリ: ${BUILD_DIR}`);
  console.log('サーバーを停止するには、Ctrl+C を押してください');
});
