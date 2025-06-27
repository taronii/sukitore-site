const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

// ディレクトリパス設定
const SRC_DIR = path.join(__dirname, 'src');
const BUILD_DIR = path.join(__dirname, 'build');

// ビルド済みのCSSディレクトリが存在することを確認
const CSS_DIR = path.join(BUILD_DIR, 'static', 'css');
if (!fs.existsSync(CSS_DIR)) {
  fs.mkdirSync(CSS_DIR, { recursive: true });
}

// TailwindCSSを処理する関数
async function processTailwindCSS() {
  console.log('🎨 Tailwind CSSを処理中...');
  
  try {
    // ソースCSSファイルを読み込む
    const css = fs.readFileSync(path.join(SRC_DIR, 'assets', 'css', 'index.css'), 'utf8');
    
    // PostCSSでTailwindを処理
    const result = await postcss([
      tailwindcss(path.join(__dirname, 'tailwind.config.js')),
      autoprefixer
    ]).process(css, {
      from: path.join(SRC_DIR, 'assets', 'css', 'index.css'),
      to: path.join(CSS_DIR, 'styles.css')
    });
    
    // 処理されたCSSを保存
    fs.writeFileSync(path.join(CSS_DIR, 'styles.css'), result.css);
    console.log('✅ Tailwind CSSの処理が完了しました');
    
    return path.join(CSS_DIR, 'styles.css');
  } catch (error) {
    console.error('❌ Tailwind CSSの処理中にエラーが発生しました:', error);
    throw error;
  }
}

module.exports = { processTailwindCSS };
