import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const ViewHistoryPage = () => {
  const navigate = useNavigate();
  const { getViewHistory } = useAuth();
  const viewHistory = getViewHistory();
  
  // 日付フォーマット
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
  };

  return (
    <div className="pb-10">
      {/* ヘッダー */}
      <div className="mb-6">
        <button
          className="flex items-center text-secondary mb-4"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft className="mr-1" />
          戻る
        </button>
        <h1 className="text-2xl font-bold text-textLight mb-2">
          閲覧履歴
        </h1>
        <p className="text-textDark">
          最近閲覧したコンテンツを確認できます（最大20件）
        </p>
      </div>
      
      {/* 閲覧履歴リスト */}
      {viewHistory.length > 0 ? (
        <div className="space-y-4">
          {viewHistory.map((item, index) => (
            <div 
              key={index} 
              className="bg-primary p-4 rounded-lg flex flex-col sm:flex-row items-start gap-4 cursor-pointer hover:bg-primary-light transition-colors"
              onClick={() => navigate(`/content/${item.contentId}`)}
            >
              <div className="w-full sm:w-1/4">
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-textLight mb-1">
                  {item.title}
                </h3>
                <div className="flex items-center text-textDark text-sm">
                  <FiClock className="mr-1" />
                  <span>閲覧日時: {formatDate(item.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-primary-dark p-8 rounded-lg text-center">
          <p className="text-textLight mb-2">閲覧履歴がありません</p>
          <p className="text-textDark text-sm">コンテンツを閲覧すると、ここに履歴が表示されます</p>
        </div>
      )}
    </div>
  );
};

export default ViewHistoryPage;
