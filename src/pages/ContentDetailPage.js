import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiTag, FiStar } from 'react-icons/fi';
import mockData from '../utils/mockData';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

const ContentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const { addToViewHistory, isAuthenticated, isFavorite, addToFavorites, removeFromFavorites } = useAuth();
  
  // 実際のアプリケーションではAPIからデータを取得
  // お気に入り状態を確認する関数
  const checkFavoriteStatus = async (contentId) => {
    if (isAuthenticated) {
      try {
        const result = await isFavorite(contentId);
        setIsFav(result);
      } catch (error) {
        console.error('お気に入り状態の確認に失敗:', error);
      }
    }
  };

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Firestoreからドキュメントを取得
        const contentRef = doc(db, 'contents', id);
        const contentSnap = await getDoc(contentRef);
        
        if (contentSnap.exists()) {
          const foundContent = {
            ...contentSnap.data(),
            id: contentSnap.id, // 文字列のドキュメントID
            date: contentSnap.data().date ? 
              new Date(contentSnap.data().date.toDate()).toISOString() : 
              new Date().toISOString()
          };
          
          // 閲覧数を増やす処理（Firestoreに更新）
          try {
            await updateDoc(contentRef, {
              viewCount: increment(1)
            });
            
            // ローカルのデータも更新
            foundContent.viewCount = (foundContent.viewCount || 0) + 1;
          } catch (error) {
            console.error('View count update failed:', error);
          }
          
          // ユーザーが認証済みの場合、閲覧履歴に追加
          if (isAuthenticated) {
            addToViewHistory(
              foundContent.id,
              foundContent.title,
              foundContent.thumbnail
            );
          }
          
          setContent(foundContent);
          setLoading(false);
          
          // お気に入り状態を確認
          if (isAuthenticated) {
            checkFavoriteStatus(foundContent.id);
          }
        } else {
          console.log('コンテンツが見つかりません: ', id);
          // データが見つからない場合はモックデータを試す
          const mockContent = mockData.find(item => item.id.toString() === id);
          
          if (mockContent) {
            setContent(mockContent);
            setLoading(false);
          } else {
            // コンテンツが見つからない場合はホームに戻る
            navigate('/');
          }
        }
      } catch (error) {
        console.error('コンテンツ読み込みエラー:', error);
        setLoading(false);
        navigate('/');
      }
    };
    
    fetchContent();
  }, [id, navigate, isAuthenticated]);
  
  // お気に入りの切り替え
  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/content/${id}` } } });
      return;
    }
    
    setFavLoading(true);
    try {
      if (isFav) {
        // お気に入りから削除
        await removeFromFavorites(content.id);
        setIsFav(false);
      } else {
        // お気に入りに追加
        await addToFavorites({
          contentId: content.id,
          title: content.title,
          description: content.description || '',
          thumbnail: content.thumbnail
        });
        setIsFav(true);
      }
    } catch (error) {
      console.error('お気に入り操作エラー:', error);
    } finally {
      setFavLoading(false);
    }
  };
  
  // 日付フォーマット
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ja-JP', options);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-secondary">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* ヘッダー */}
      <div className="mb-4">
        <button
          className="flex items-center text-secondary mb-4"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft className="mr-1" />
          戻る
        </button>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-textLight">
            {content.title}
          </h1>
          <button 
            className={`p-2 rounded-full transition-colors ${isFav ? 'text-yellow-400 hover:bg-primary-light' : 'text-textDark hover:text-yellow-400 hover:bg-primary-light'}`}
            onClick={toggleFavorite}
            disabled={favLoading}
          >
            <FiStar size={24} className={favLoading ? 'animate-pulse' : ''} />
          </button>
        </div>
        <div className="flex items-center text-textDark text-sm mb-4">
          <div className="flex items-center mr-4">
            <FiClock className="mr-1" />
            <span>{formatDate(content.date)}</span>
          </div>
          <div className="flex items-center">
            <FiTag className="mr-1" />
            <span>{content.category}</span>
          </div>
        </div>
      </div>
      
      {/* コンテンツ本体 */}
      <div className="content-card mb-6">
        {content.type === 'video' ? (
          // 動画コンテンツの場合
          <div className="aspect-video mb-4">
            <iframe
              className="w-full h-full rounded-lg"
              src={content.videoUrl}
              title={content.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          // 記事コンテンツの場合
          <div className="mb-4">
            <img
              src={content.thumbnail}
              alt={content.title}
              className="w-full rounded-lg mb-4"
            />
          </div>
        )}
        
        {/* コンテンツの本文 */}
        <div className="text-textLight leading-relaxed article-content">
          {content.type === 'article' ? (
            <div dangerouslySetInnerHTML={{ __html: content.content }} />
          ) : (
            content.content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))
          )}
        </div>
      </div>
      
      {/* 関連コンテンツセクション（オプション） */}
      <div>
        <h2 className="section-title mb-4">関連コンテンツ</h2>
        <div className="content-grid">
          {mockData
            .filter(item => 
              item.category === content.category && 
              item.id !== content.id
            )
            .slice(0, 2)
            .map(relatedContent => (
              <div 
                key={relatedContent.id} 
                className="content-card cursor-pointer"
                onClick={() => {
                  navigate(`/content/${relatedContent.id}`);
                  window.scrollTo(0, 0);
                }}
              >
                <div className="thumbnail">
                  <img 
                    src={relatedContent.thumbnail} 
                    alt={relatedContent.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="content-title">{relatedContent.title}</h3>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ContentDetailPage;
