import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import mainLogo from '../assets/images/mainlogo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');
  const { login, requiresMonthlyAuth, currentUser, monthlyAuthenticate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // リダイレクト元のパスを探す
  React.useEffect(() => {
    // state経由で前のパスが渡されているか確認
    const from = location.state?.from?.pathname || '/';
    setRedirectPath(from);
  }, [location]);

  // 月次認証が必要な場合はメールアドレスを自動入力
  React.useEffect(() => {
    if (requiresMonthlyAuth && currentUser) {
      setEmail(currentUser.email || '');
    }
  }, [requiresMonthlyAuth, currentUser]);

  const handleSubmit = async (e) => {
    console.log("ログイン処理開始: ", { email, passphrase: passphrase.length > 0 ? '入力済み' : '未入力' });
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // 入力検証
    if (!email.trim() || !password.trim() || !passphrase.trim()) {
      console.log('入力エラー: すべての項目が入力されていません');
      setError('すべての項目を入力してください');
      setIsLoading(false);
      return;
    }
    
    // 処理が無限に続くのを防ぐためのタイムアウト設定
    const loginTimeout = setTimeout(() => {
      console.log('ログイン処理がタイムアウトしました');
      setError('ログイン処理に時間がかかりすぎています。ネットワーク接続を確認してください。');
      setIsLoading(false);
    }, 10000); // 10秒でタイムアウト
    
    try {
      console.log('ログイン処理を実行中...');
      
      // 合言葉確認 - 6月の合言葉を明示的に確認
      if (passphrase === 'diet2025june') {
        console.log('6月の合言葉が確認されました');
      }
      
      // 月次認証が必要な場合は別の処理
      if (requiresMonthlyAuth && currentUser) {
        console.log('月次認証を実行中...');
        const result = await monthlyAuthenticate(email, password, passphrase);
        console.log('月次認証結果:', result);
        
        if (result.success) {
          clearTimeout(loginTimeout);
          navigate(redirectPath);
          return;
        } else {
          setError(result.message);
          console.error('月次認証エラー:', result.message);
        }
      } else {
        // 通常のログイン処理
        console.log('通常ログインを実行中...');
        const result = await login(email, password, passphrase);
        console.log('ログイン結果:', result);
        
        if (result.success) {
          clearTimeout(loginTimeout);
          console.log('ログイン成功、リダイレクト先:', redirectPath);
          navigate(redirectPath);
          return;
        } else {
          console.error('ログイン失敗:', result.message);
          setError(result.message);
        }
      }
    } catch (error) {
      console.error('ログイン例外エラー:', error);
      setError('ログイン処理中にエラーが発生しました: ' + (error.message || '不明なエラー'));
    } finally {
      clearTimeout(loginTimeout);
      console.log("ログイン処理終了");
      setIsLoading(false);
    }
  };

  return (
    <div className="password-gate bg-gradient-to-b from-background to-primary min-h-screen flex justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src={mainLogo} alt="SUKITORE" className="h-16 mx-auto mb-4" />
          <p className="text-textLight text-lg">
            {requiresMonthlyAuth ? '月次認証が必要です' : 'ログイン'}
          </p>
        </div>
        
        <div className="bg-primary rounded-card shadow-card p-8">
          <h2 className="text-xl font-bold text-textLight mb-6 text-center">
            {requiresMonthlyAuth ? '月次認証' : 'ログイン'}
          </h2>
          
          {requiresMonthlyAuth && (
            <div className="mb-6 p-4 bg-blue-900 text-blue-100 rounded-lg">
              <p>新しい月になりました。継続利用のために再認証が必要です。</p>
              <p className="text-sm mt-2">※ 月に一度の認証で、月末まで継続的にご利用いただけます</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-3 bg-red-900 text-red-100 rounded-lg">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-textLight text-sm font-medium mb-2">
                メールアドレス *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                placeholder="example@mail.com"
                required
                disabled={requiresMonthlyAuth} // 月次認証時は編集不可
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-textLight text-sm font-medium mb-2">
                パスワード *
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                placeholder="パスワード"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="passphrase" className="block text-textLight text-sm font-medium mb-2">
                今月の合言葉 *
              </label>
              <input
                type="password"
                id="passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                placeholder="今月の合言葉"
                required
              />
              <p className="text-textDark text-xs mt-1">
                合言葉がわからない方は担当者にお問い合わせください
              </p>
            </div>
            
            <button
              type="submit"
              className={`btn-primary w-full ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : requiresMonthlyAuth ? '認証する' : 'ログイン'}
            </button>
            {isLoading && (
              <p className="text-xs text-blue-300 mt-2 text-center animate-pulse">
                サーバーに接続中です。しばらくお待ちください...
              </p>
            )}
          </form>
          
          {!requiresMonthlyAuth && (
            <div className="mt-6 text-center">
              <p className="text-textDark text-sm">
                アカウントをお持ちでない方は
                <Link to="/register" className="text-secondary hover:underline ml-1">
                  新規登録
                </Link>
              </p>
            </div>
          )}
          
          <div className="mt-4 text-center">
            <Link
              to="/password"
              className="text-secondary hover:underline text-sm"
            >
              合言葉のみでログイン（簡易モード）
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
