import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiLock, FiStar, FiSettings } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const MyPage = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, changePassword, getFavorites, getViewHistory } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // プロフィール編集用の状態
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  
  // パスワード変更用の状態
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // お気に入りリスト
  const [favorites, setFavorites] = useState([]);
  
  // 視聴履歴
  const viewHistory = getViewHistory();
  
  // ユーザー情報の初期化
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || '');
      setDisplayName(currentUser.displayName || '');
      
      // お気に入りを取得
      const loadFavorites = async () => {
        try {
          const favList = await getFavorites();
          setFavorites(favList || []);
        } catch (error) {
          console.error('お気に入り取得エラー:', error);
        }
      };
      
      loadFavorites();
    }
  }, [currentUser, getFavorites]);
  
  // プロフィール更新処理
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateProfile({ displayName, email });
      setMessage({ type: 'success', text: 'プロフィールを更新しました' });
    } catch (error) {
      setMessage({ type: 'error', text: `エラーが発生しました: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };
  
  // パスワード変更処理
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '新しいパスワードと確認用パスワードが一致しません' });
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'パスワードは6文字以上にしてください' });
      setLoading(false);
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'パスワードを変更しました' });
    } catch (error) {
      setMessage({ type: 'error', text: `エラーが発生しました: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };
  
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
          マイページ
        </h1>
        <p className="text-textDark">
          アカウント設定や履歴を確認できます
        </p>
      </div>
      
      {/* タブナビゲーション */}
      <div className="flex overflow-x-auto mb-6 border-b border-primary-light">
        <button 
          className={`px-4 py-2 flex items-center ${activeTab === 'profile' ? 'text-secondary border-b-2 border-secondary' : 'text-textDark'}`}
          onClick={() => setActiveTab('profile')}
        >
          <FiUser className="mr-2" />
          プロフィール
        </button>
        <button 
          className={`px-4 py-2 flex items-center ${activeTab === 'password' ? 'text-secondary border-b-2 border-secondary' : 'text-textDark'}`}
          onClick={() => setActiveTab('password')}
        >
          <FiLock className="mr-2" />
          パスワード変更
        </button>
        <button 
          className={`px-4 py-2 flex items-center ${activeTab === 'favorites' ? 'text-secondary border-b-2 border-secondary' : 'text-textDark'}`}
          onClick={() => setActiveTab('favorites')}
        >
          <FiStar className="mr-2" />
          お気に入り
        </button>
        <button 
          className={`px-4 py-2 flex items-center ${activeTab === 'settings' ? 'text-secondary border-b-2 border-secondary' : 'text-textDark'}`}
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings className="mr-2" />
          設定
        </button>
      </div>
      
      {/* メッセージ表示 */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
          {message.text}
        </div>
      )}
      
      {/* タブコンテンツ */}
      <div className="bg-primary rounded-lg p-6">
        {/* プロフィールタブ */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label className="block text-textLight text-sm font-medium mb-2">
                表示名
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                placeholder="表示名（任意）"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-textLight text-sm font-medium mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                placeholder="メールアドレス"
                required
              />
            </div>
            
            <button
              type="submit"
              className={`btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? '処理中...' : 'プロフィールを更新'}
            </button>
          </form>
        )}
        
        {/* パスワード変更タブ */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordChange}>
            <div className="mb-4">
              <label className="block text-textLight text-sm font-medium mb-2">
                現在のパスワード
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                placeholder="現在のパスワード"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-textLight text-sm font-medium mb-2">
                新しいパスワード
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                placeholder="新しいパスワード（6文字以上）"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-textLight text-sm font-medium mb-2">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                placeholder="新しいパスワード（確認）"
                required
              />
            </div>
            
            <button
              type="submit"
              className={`btn-primary w-full ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? '処理中...' : 'パスワードを変更'}
            </button>
          </form>
        )}
        
        {/* お気に入りタブ */}
        {activeTab === 'favorites' && (
          <div>
            {favorites.length > 0 ? (
              <div className="space-y-4">
                {favorites.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-primary-light p-4 rounded-lg flex flex-col sm:flex-row items-start gap-4 cursor-pointer hover:bg-primary transition-colors"
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
                      <p className="text-textDark text-sm line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-primary-dark p-8 rounded-lg text-center">
                <p className="text-textLight mb-2">お気に入りがありません</p>
                <p className="text-textDark text-sm">コンテンツの★マークをタップすると、ここに追加されます</p>
              </div>
            )}
          </div>
        )}
        
        {/* 設定タブ */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-textLight mb-4">アカウント設定</h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center p-4 bg-primary-light rounded-lg">
                  <div>
                    <p className="text-textLight">閲覧履歴を表示</p>
                    <p className="text-textDark text-sm">最近閲覧したコンテンツを確認</p>
                  </div>
                  <button 
                    className="btn-secondary"
                    onClick={() => navigate('/history')}
                  >
                    履歴を表示
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center p-4 bg-primary-light rounded-lg">
                  <div>
                    <p className="text-textLight">月次認証状態</p>
                    <p className="text-textDark text-sm">
                      {currentUser?.requiresMonthlyAuth 
                        ? '月次認証が必要です' 
                        : '認証済み：今月末まで有効'}
                    </p>
                  </div>
                  <div className={`text-sm px-2 py-1 rounded ${currentUser?.requiresMonthlyAuth ? 'bg-red-900 text-red-100' : 'bg-green-900 text-green-100'}`}>
                    {currentUser?.requiresMonthlyAuth ? '未認証' : '認証済'}
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center p-4 bg-primary-light rounded-lg">
                  <div>
                    <p className="text-textLight">登録情報</p>
                    <p className="text-textDark text-sm">{currentUser?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPage;
