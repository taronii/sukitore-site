import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import mainLogo from '../assets/images/mainlogo.png';

const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    // 基本的な検証
    if (!email.trim() || !password.trim() || !confirmPassword.trim() || !passphrase.trim()) {
      setError('すべての項目を入力してください');
      setIsLoading(false);
      return;
    }
    
    // パスワード一致確認
    if (password !== confirmPassword) {
      setError('パスワードが一致しません');
      setIsLoading(false);
      return;
    }
    
    try {
      // 登録処理 - async関数を正しく呼び出す
      const result = await register(email, password, passphrase);
      
      if (result.success) {
        setSuccess(result.message);
        // 登録成功したら3秒後にホームページにリダイレクト
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('登録エラー:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に登録されています');
      } else {
        setError(`登録中にエラーが発生しました: ${error.message || '不明なエラー'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="password-gate bg-gradient-to-b from-background to-primary min-h-screen flex justify-center items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src={mainLogo} alt="SUKITORE" className="h-16 mx-auto mb-4" />
          <p className="text-textLight text-lg">新規会員登録</p>
        </div>
        
        <div className="bg-primary rounded-card shadow-card p-8">
          <h2 className="text-xl font-bold text-textLight mb-6 text-center">会員登録フォーム</h2>
          
          {success && (
            <div className="mb-6 p-3 bg-green-900 text-green-100 rounded-lg">
              {success}
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
                placeholder="6文字以上のパスワード"
                required
                minLength={6}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-textLight text-sm font-medium mb-2">
                パスワード（確認用）*
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                placeholder="パスワードを再入力"
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
              {isLoading ? '処理中...' : '登録する'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-textDark text-sm">
              既に登録済みの方は
              <Link to="/login" className="text-secondary hover:underline ml-1">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
