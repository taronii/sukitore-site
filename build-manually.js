/**
 * 手動ビルドスクリプト - SUKITORE会員サイト
 * 
 * このスクリプトは、react-scriptsのビルドプロセスが機能しない場合に
 * 最低限の静的ファイルを生成するためのものです。
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 設定
const BUILD_DIR = path.join(__dirname, 'build');
const PUBLIC_DIR = path.join(__dirname, 'public');
const SRC_DIR = path.join(__dirname, 'src');

// ビルドディレクトリを作成/クリーン
console.log('📁 ビルドディレクトリを準備中...');
if (fs.existsSync(BUILD_DIR)) {
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}
fs.mkdirSync(BUILD_DIR);
fs.mkdirSync(path.join(BUILD_DIR, 'static'));
fs.mkdirSync(path.join(BUILD_DIR, 'static/js'));
fs.mkdirSync(path.join(BUILD_DIR, 'static/css'));
fs.mkdirSync(path.join(BUILD_DIR, 'static/media'));

// publicディレクトリからファイルをコピー
console.log('📋 静的ファイルをコピー中...');
const publicFiles = fs.readdirSync(PUBLIC_DIR);
publicFiles.forEach(file => {
  if (file !== 'index.html') { // index.htmlは後で特別に処理
    const srcPath = path.join(PUBLIC_DIR, file);
    const destPath = path.join(BUILD_DIR, file);
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✓ ${file} をコピーしました`);
  }
});

// index.htmlを処理（%PUBLIC_URL%の置換）
console.log('🔄 index.htmlを処理中...');
let indexHtml = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
indexHtml = indexHtml.replace(/%PUBLIC_URL%/g, '.');
fs.writeFileSync(path.join(BUILD_DIR, 'index.html'), indexHtml);
console.log('  ✓ index.html を処理しました');

// JSバンドルを作成（簡易版）
console.log('📦 JavaScriptバンドルを生成中...');
fs.writeFileSync(
  path.join(BUILD_DIR, 'static/js/main.js'),
  `// SUKITORE会員サイト - バンドルJS (${new Date().toISOString()})
document.addEventListener('DOMContentLoaded', function() {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = \`
      <div style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: sans-serif; color: #fff; background-color: #0A192F; min-height: 100vh;">
        <h1 style="color: #64FFDA; text-align: center; margin-bottom: 2rem;">SUKITORE</h1>
        <div style="background-color: #172a46; padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
          <h2 style="color: #64FFDA; margin-bottom: 1rem;">お知らせ</h2>
          <p style="line-height: 1.6;">ビルドプロセスに問題が発生しました。完全な機能を復元するまでの間、ベーシックな情報ページを表示しています。</p>
        </div>
        <div style="background-color: #172a46; padding: 2rem; border-radius: 8px;">
          <h2 style="color: #64FFDA; margin-bottom: 1rem;">SUKITOREとは</h2>
          <p style="line-height: 1.6;">40〜50代女性向けのダイエット系会員サイト。高級感のあるデザインと使いやすいインターフェースで、効果的なダイエット情報を提供しています。</p>
          <ul style="margin-top: 1rem; line-height: 1.6;">
            <li>コンテンツカテゴリ: 新着、注目、人気</li>
            <li>合言葉: sukitore2025</li>
            <li>最適化: スマートフォン対応</li>
          </ul>
        </div>
      </div>
    \`;
  }
});
`
);
console.log('  ✓ main.js を生成しました');

// CSSを生成（簡易版）
console.log('🎨 スタイルシートを生成中...');
fs.writeFileSync(
  path.join(BUILD_DIR, 'static/css/main.css'),
  `/* SUKITORE会員サイト - メインCSS (${new Date().toISOString()}) */
body {
  margin: 0;
  padding: 0;
  background-color: #0F1624;
  color: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

#root {
  min-height: 100vh;
}

a {
  color: #64FFDA;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
`
);
console.log('  ✓ main.css を生成しました');

// index.htmlにJSとCSSの参照を追加
console.log('🔗 リソースの参照を追加中...');
indexHtml = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
indexHtml = indexHtml.replace(
  '</head>',
  '  <link rel="stylesheet" href="./static/css/main.css" />\n</head>'
);
indexHtml = indexHtml.replace(
  '</body>',
  '  <script src="./static/js/main.js"></script>\n</body>'
);
fs.writeFileSync(path.join(BUILD_DIR, 'index.html'), indexHtml);
console.log('  ✓ リソース参照を追加しました');

// .htaccessファイルがあればコピー
if (fs.existsSync(path.join(PUBLIC_DIR, '.htaccess'))) {
  fs.copyFileSync(
    path.join(PUBLIC_DIR, '.htaccess'),
    path.join(BUILD_DIR, '.htaccess')
  );
  console.log('  ✓ .htaccess をコピーしました');
}

console.log('✅ ビルド完了!');
console.log(`ビルドディレクトリ: ${BUILD_DIR}`);
console.log('注意: これは簡易ビルドです。実際のReactアプリケーションの機能は含まれていません。');
