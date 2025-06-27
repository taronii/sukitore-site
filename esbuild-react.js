/**
 * esbuildを使用したReactアプリケーション用バンドラー
 * Node.js v22と互換性のある代替ビルドプロセス
 */

const esbuild = require('esbuild');
const { copy } = require('esbuild-plugin-copy');
const fs = require('fs');
const path = require('path');

// 設定
const SRC_DIR = path.join(__dirname, 'src');
const BUILD_DIR = path.join(__dirname, 'build');
const PUBLIC_DIR = path.join(__dirname, 'public');

// ビルドディレクトリを準備
if (fs.existsSync(BUILD_DIR)) {
  console.log('🧹 既存のビルドディレクトリを削除中...');
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}

console.log('📁 ビルドディレクトリを作成中...');
fs.mkdirSync(BUILD_DIR, { recursive: true });

// publicディレクトリのファイル（index.htmlを含む）を処理するカスタムプラグイン
const processPublicFiles = {
  name: 'process-public-files',
  setup(build) {
    build.onEnd(() => {
      console.log('📋 公開ファイルを処理中...');
      const files = fs.readdirSync(PUBLIC_DIR);
      
      for (const file of files) {
        if (file === '.DS_Store') continue;
        
        const srcPath = path.join(PUBLIC_DIR, file);
        const destPath = path.join(BUILD_DIR, file);
        
        if (fs.statSync(srcPath).isFile()) {
          // index.htmlは特別に処理
          if (file === 'index.html') {
            console.log(`  🔄 ${file} を処理中...`);
            let content = fs.readFileSync(srcPath, 'utf8');
            
            // %PUBLIC_URL%を置換
            content = content.replace(/%PUBLIC_URL%\//g, '');
            content = content.replace(/%PUBLIC_URL%/g, '');
            
            // バンドルしたJSとCSSへの参照を追加
            if (!content.includes('static/js/bundle.js')) {
              content = content.replace('</body>', '  <script src="static/js/bundle.js"></script>\n</body>');
            }
            
            // Tailwind CSSへのリンクを追加
            if (!content.includes('static/css/styles.css')) {
              content = content.replace('</head>', '  <link rel="stylesheet" href="static/css/styles.css">\n</head>');
            }
            
            fs.writeFileSync(destPath, content);
            console.log(`  ✅ ${file} を保存しました`);
          } else {
            // その他のファイルはそのままコピー
            fs.copyFileSync(srcPath, destPath);
            console.log(`  ✓ ${file} をコピーしました`);
          }
        }
      }
    });
  }
};

// Tailwind CSS処理モジュールをインポート
    const { processTailwindCSS } = require('./build-css');

// esbuildでReactアプリをバンドル
(async () => {
  try {
    console.log('🚀 esbuildでReactアプリケーションをバンドル中...');

    // Tailwind CSSを先に処理
    const cssPath = await processTailwindCSS();
    
    // 画像ディレクトリを作成
    const fs = require('fs');
    const IMAGES_DIR = path.join(BUILD_DIR, 'static', 'media');
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }
    
    // 画像ファイルを直接コピー
    console.log('🖼️ 画像ファイルをコピー中...');
    const IMAGES_SRC_DIR = path.join(SRC_DIR, 'assets', 'images');
    if (fs.existsSync(IMAGES_SRC_DIR)) {
      const imageFiles = fs.readdirSync(IMAGES_SRC_DIR);
      imageFiles.forEach(file => {
        const srcPath = path.join(IMAGES_SRC_DIR, file);
        const destPath = path.join(IMAGES_DIR, file);
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`  ✓ ${file} をコピーしました`);
        }
      });
    }
    
    await esbuild.build({
      entryPoints: [path.join(SRC_DIR, 'index.js')],
      bundle: true,
      minify: true,
      sourcemap: true,
      target: ['es6'],
      outfile: path.join(BUILD_DIR, 'static', 'js', 'bundle.js'),
      publicPath: '/',
      assetNames: 'static/media/[name]',
      loader: {
        '.js': 'jsx',
        '.css': 'css',
        '.png': 'file',
        '.jpg': 'file',
        '.jpeg': 'file',
        '.gif': 'file',
        '.svg': 'file',
        '.woff': 'file',
        '.woff2': 'file',
        '.ttf': 'file',
        '.eot': 'file',
      },
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      plugins: [
        processPublicFiles,
      ],
    });
    
    console.log('✅ ビルドが成功しました！');
    console.log(`📂 ビルドディレクトリ: ${BUILD_DIR}`);
  } catch (error) {
    console.error('❌ ビルド中にエラーが発生しました:', error);
    process.exit(1);
  }
})();
