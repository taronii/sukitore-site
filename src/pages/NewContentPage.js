import React, { useState, useEffect } from 'react';
import ContentCard from '../components/ContentCard';
import mockData from '../utils/mockData';

const NewContentPage = () => {
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [activeCategory, setActiveCategory] = useState('すべて');
  const [categories, setCategories] = useState(['すべて']);
  
  // 実際のアプリケーションではAPIからデータを取得
  useEffect(() => {
    // ローカルストレージからデータを取得するか、なければモックデータを使用
    const savedContents = localStorage.getItem('sukitoreContents');
    const contentsData = savedContents ? JSON.parse(savedContents) : mockData;
    
    // 投稿日時の新しい順に並び替えて最新コンテンツを取得
    // 実際のアプリでは、当月内や過去30日以内などの期間でフィルタリングすることもあり得ます
    const sortedByDate = [...contentsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const newContents = sortedByDate.slice(0, 20); // 最新の20件を表示
    
    setContents(newContents);
    setFilteredContents(newContents);
    
    // カテゴリーのリストを生成（重複なし）
    const uniqueCategories = ['すべて', ...new Set(newContents.map(item => item.category))];
    setCategories(uniqueCategories);
  }, []);
  
  // カテゴリーでフィルタリング
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === 'すべて') {
      setFilteredContents(contents);
    } else {
      setFilteredContents(contents.filter(item => item.category === category));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-textLight mb-4">新着コンテンツ</h1>
      
      {/* カテゴリータブ */}
      <div className="overflow-x-auto whitespace-nowrap pb-3 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            className={
              activeCategory === category
                ? "category-tab-active"
                : "category-tab"
            }
            onClick={() => handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* コンテンツグリッド */}
      {filteredContents.length > 0 ? (
        <div className="content-grid">
          {filteredContents.map(content => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-textDark">このカテゴリーにはまだコンテンツがありません</p>
        </div>
      )}
    </div>
  );
};

export default NewContentPage;
