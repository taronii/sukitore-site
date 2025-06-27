import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiCheck, FiHome, FiHeart, FiMessageSquare, FiInfo } from 'react-icons/fi';
import mainLogo from '../assets/images/mainlogo.png';
import heroImage from '../assets/images/hero-image.png';
import serviceLiveLesson from '../assets/images/service-live-lesson.png';
import serviceDietKnowledge from '../assets/images/service-diet-knowledge.png';
import serviceCommunity from '../assets/images/service-community.png';
import testimonialUser1 from '../assets/images/testimonial-user1.png';
import testimonialUser2 from '../assets/images/testimonial-user2.png';
import testimonialUser3 from '../assets/images/testimonial-user3.png';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* ヘッダー */}
      <header className="py-4 px-4 bg-black bg-opacity-40 sticky top-0 z-10 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="h-10">
            <img src={mainLogo} alt="スキトレ部" className="h-full" />
          </div>
          <a href="https://mosh.jp/services/200374" target="_blank" rel="noopener noreferrer" className="bg-secondary px-4 py-2 rounded-full text-primary font-medium text-sm transition-all hover:bg-opacity-90">
            入部する
          </a>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section id="home" className="py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="w-full mb-8 flex items-center justify-center">
            <img src={heroImage} alt="スキトレ部" className="w-full max-w-lg rounded-lg shadow-lg" />
          </div>
          <p className="text-lg mb-6">
            スキマ時間にスキな場所で<br />自分をスキになるためのトレーニング
          </p>
          <a href="https://mosh.jp/services/200374" target="_blank" rel="noopener noreferrer" className="inline-block bg-secondary text-primary font-bold px-8 py-3 rounded-full text-lg transition-transform hover:scale-105 shadow-lg">
            今すぐ始める
          </a>
        </div>
      </section>

      {/* お悩みセクション */}
      <section id="problems" className="py-8 px-4 bg-gray-800">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold mb-6 text-center">こんなお悩みありませんか？</h3>
          <div className="space-y-4">
            {[
              'ダイエットを始めたけどなかなか続かない',
              '運動のやる気も出ない',
              '毎日同じようなルーティンの生活が続いている',
              'ダイエット友達が一人もいない',
              '一人でやるとモチベーションが続かない'
            ].map((concern, index) => (
              <div key={index} className="flex items-start p-3 bg-gray-700 rounded-lg">
                <FiCheck className="text-secondary mr-3 mt-1 flex-shrink-0" size={20} />
                <p>{concern}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* サービス紹介セクション */}
      <section id="services" className="py-8 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            <span className="text-secondary">充実した</span>サービス内容
          </h2>
          <p className="text-center mb-8">スキトレ部では、以下の6つのサービスがあります</p>
          
          <div className="space-y-6">
            {/* サービス1 */}
            <div className="bg-gray-700 bg-opacity-50 p-5 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <span className="bg-secondary text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-3">1</span>
                ZOOM実技ライブレッスン
              </h3>
              <div className="w-full mb-4">
                <img src={serviceLiveLesson} alt="ZOOM実技ライブレッスン" className="w-full rounded-md shadow-md" />
              </div>
              <p className="mb-3">毎週水曜21時からライブ配信。ストレッチや筋トレ、有酸素運動などの実技レッスンを実施。顔出し不要で参加できます。</p>
              <p className="text-secondary font-medium">月4回のライブ配信＋いつでも見られるアーカイブ動画</p>
            </div>
            
            {/* サービス2 */}
            <div className="bg-gray-700 bg-opacity-50 p-5 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <span className="bg-secondary text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-3">2</span>
                科学的根拠に基づくダイエット知識
              </h3>
              <div className="w-full mb-4">
                <img src={serviceDietKnowledge} alt="科学的根拠に基づくダイエット知識" className="w-full rounded-md shadow-md" />
              </div>
              <p className="mb-3">「痩せるための正しい知識」を手に入れるための「座学レッスン動画」を配信。科学的に正しいアプローチを学べます。</p>
              <p className="text-secondary font-medium">自分に合ったダイエット方法を見つけられる</p>
            </div>
            
            {/* サービス3 */}
            <div className="bg-gray-700 bg-opacity-50 p-5 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <span className="bg-secondary text-primary rounded-full w-7 h-7 inline-flex items-center justify-center mr-3">3</span>
                オンラインコミュニティ
              </h3>
              <div className="w-full mb-4">
                <img src={serviceCommunity} alt="オンラインコミュニティ" className="w-full rounded-md shadow-md" />
              </div>
              <p className="mb-3">BANDを活用したダイエット特化のコミュニティ。質問や意見交換ができ、みんなで楽しく継続できます。</p>
              <p className="text-secondary font-medium">1人では続けにくいダイエットも仲間と一緒に</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a href="https://mosh.jp/services/200374" target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-secondary font-bold">
              その他のサービスを見る <FiChevronRight className="ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* お客様の声セクション */}
      <section id="reviews" className="py-8 px-4 bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">お客様の声</h2>
          
          <div className="space-y-4">
            {/* 声1 */}
            <div className="bg-gray-700 p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img src={testimonialUser1} alt="A.Kさん" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold">A.Kさん (46歳)</p>
                  <p className="text-sm text-gray-300">会員歴：6ヶ月</p>
                </div>
              </div>
              <p className="text-gray-200 italic">
                "一人では続かなかったダイエットも、スキトレ部の仲間と一緒だから楽しく続けられています。3ヶ月で5kgのダイエットに成功しました！"
              </p>
            </div>
            
            {/* 声2 */}
            <div className="bg-gray-700 p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img src={testimonialUser2} alt="M.Sさん" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold">M.Sさん (52歳)</p>
                  <p className="text-sm text-gray-300">会員歴：1年</p>
                </div>
              </div>
              <p className="text-gray-200 italic">
                "科学的な知識が学べるので、無駄なダイエット法に惑わされなくなりました。体重よりも体脂肪率が下がり、健康的に痩せられています。"
              </p>
            </div>

            {/* 声3 */}
            <div className="bg-gray-700 p-5 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img src={testimonialUser3} alt="K.Tさん" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold">K.Tさん (49歳)</p>
                  <p className="text-sm text-gray-300">会員歴：3ヶ月</p>
                </div>
              </div>
              <p className="text-gray-200 italic">
                "コミュニティで質問できる環境がとても心強いです。同年代の女性が多く、悩みを共有できて孤独感がなくなりました。実技レッスンも初心者向けで無理なく続けられています。"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA（行動喚起）セクション */}
      <section className="py-10 px-4 bg-gradient-to-b from-gray-800 to-black text-center">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-3">
            <span className="text-secondary">今すぐ</span>スキトレ部に参加しませんか？
          </h2>
          <p className="mb-6">孤独なダイエットを終わらせる<br />心と身体の健康のためのコミュニティ</p>
          <a href="https://mosh.jp/services/200374" target="_blank" rel="noopener noreferrer" className="inline-block bg-secondary text-primary font-bold px-8 py-3 rounded-full text-lg transition-transform hover:scale-105 shadow-lg mb-4">
            会員登録はこちら
          </a>
        </div>
      </section>

      {/* フッター */}
      <footer className="pt-6 pb-20 px-4 bg-black">
        <div className="container mx-auto text-center">
          <p className="text-secondary font-bold text-xl mb-2">スキトレ部</p>
          <p className="text-sm text-gray-400 mb-4">孤独なダイエットを終わらせるコミュニティ</p>
          <p className="text-xs text-gray-500">© 2024 スキトレ部 All Rights Reserved.</p>
        </div>
      </footer>
      
      {/* フッターナビゲーション */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 shadow-lg z-10">
        <nav className="flex justify-around items-center h-16">
          <a href="#home" className="flex flex-col items-center justify-center w-1/4 p-2">
            <FiHome className="text-secondary text-xl" />
            <span className="text-xs mt-1 text-gray-300">トップ</span>
          </a>
          <a href="#services" className="flex flex-col items-center justify-center w-1/4 p-2">
            <FiInfo className="text-secondary text-xl" />
            <span className="text-xs mt-1 text-gray-300">サービス</span>
          </a>
          <a href="#reviews" className="flex flex-col items-center justify-center w-1/4 p-2">
            <FiMessageSquare className="text-secondary text-xl" />
            <span className="text-xs mt-1 text-gray-300">お客様の声</span>
          </a>
          <a href="https://mosh.jp/services/200374" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center w-1/4 p-2">
            <FiHeart className="text-secondary text-xl" />
            <span className="text-xs mt-1 text-gray-300">入部する</span>
          </a>
        </nav>
      </div>
    </div>
  );
};

export default LandingPage;
