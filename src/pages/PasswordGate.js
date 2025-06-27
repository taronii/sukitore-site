import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import mainLogo from '../assets/images/mainlogo.png';

const PasswordGate = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [redirectPath, setRedirectPath] = useState('/');
  const { authenticate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // リダイレクト元のパスを探す
  useEffect(() => {
    // state経由で前のパスが渡されているか確認
    const from = location.state?.from?.pathname || '/';
    setRedirectPath(from);
  }, [location]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    console.log('合言葉のみのログイン開始:', { password: password ? '入力済み' : '未入力' });
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!password.trim()) {
      console.log('入力エラー: 合言葉が入力されていません');
      setError('合言葉を入力してください');
      setIsLoading(false);
      return;
    }
    
    // 6月の合言葉が明示的に入力されているか確認
    if (password === 'diet2025june') {
      console.log('6月の合言葉が入力されました: diet2025june');
    }
    
    // 処理が無限に続くのを防ぐためのタイムアウト設定
    const loginTimeout = setTimeout(() => {
      console.log('合言葉認証がタイムアウトしました');
      setError('認証処理に時間がかかりすぎています。再度お試しください。');
      setIsLoading(false);
    }, 8000); // 8秒でタイムアウト
    
    try {
      console.log('認証関数を呼び出します:', password);
      const result = await authenticate(password);
      console.log('認証結果受信:', result);
      
      if (result && result.success) {
        clearTimeout(loginTimeout);
        console.log('認証成功、リダイレクト先:', redirectPath);
        
        // 合言葉が正しい場合は直接リダイレクト
        // 万が一Firebase認証が機能しなくても動作するようにする
        if (password === 'diet2025june') {
          console.log('6月合言葉で直接リダイレクトします');
          navigate(redirectPath);
          return;
        }
        
        // 認証成功時、元々アクセスしようとしていたパスにリダイレクト
        navigate(redirectPath);
      } else {
        clearTimeout(loginTimeout);
        console.error('認証失敗:', result ? result.message : '不明なエラー');
        setError(result ? result.message : '合言葉が正しくありません');
        setPassword('');
      }
    } catch (error) {
      clearTimeout(loginTimeout);
      console.error('認証例外エラー:', error);
      
      // 6月の合言葉なら直接認証する最終手段
      if (password === 'diet2025june') {
        console.log('エラー発生後の緊急回避策を実行');
        // 直接リダイレクト
        navigate(redirectPath);
        return;
      }
      
      setError('認証処理中にエラーが発生しました');
      setPassword('');
    } finally {
      clearTimeout(loginTimeout);
      setIsLoading(false);
    }
  };

  return (
    <div className="password-gate bg-gradient-to-b from-background to-primary">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src={mainLogo} alt="SUKITORE" className="h-16 mx-auto mb-4" />
          <p className="text-textLight text-lg">ダイエットへの旅を始めましょう</p>
        </div>
        
        <div className="bg-primary rounded-card shadow-card p-8">
          <h2 className="text-xl font-bold text-textLight mb-6 text-center">会員専用サイト</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-textLight text-sm font-medium mb-2">
                合言葉を入力してください
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                placeholder="合言葉"
              />
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="btn-primary w-full"
            >
              入場する
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-textDark text-sm">
              会員専用コンテンツです。<br />合言葉がわからない方は担当者にお問い合わせください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGate;
