import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { 
  initializeMonthlyPassphrases, 
  createAdminUser, 
  migrateContentsToFirestore,
  initializeFirebaseData
} from '../scripts/initializeFirebase';

const FirebaseInitPage = () => {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({
    passphrases: { done: false, error: null },
    admin: { done: false, error: null },
    contents: { done: false, error: null },
    all: { done: false, error: null }
  });

  // 月次合言葉を初期化
  const handleInitializePassphrases = async () => {
    setIsLoading(true);
    try {
      const result = await initializeMonthlyPassphrases();
      setStatus(prev => ({
        ...prev,
        passphrases: { done: result, error: result ? null : '初期化に失敗しました' }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        passphrases: { done: false, error: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 管理者ユーザーを作成
  const handleCreateAdmin = async () => {
    if (!adminEmail || !adminPassword) {
      setStatus(prev => ({
        ...prev,
        admin: { done: false, error: 'メールアドレスとパスワードを入力してください' }
      }));
      return;
    }

    setIsLoading(true);
    try {
      const result = await createAdminUser(adminEmail, adminPassword);
      setStatus(prev => ({
        ...prev,
        admin: { done: result, error: result ? null : '作成に失敗しました' }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        admin: { done: false, error: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // コンテンツをFirestoreに移行
  const handleMigrateContents = async () => {
    setIsLoading(true);
    try {
      const result = await migrateContentsToFirestore();
      setStatus(prev => ({
        ...prev,
        contents: { done: result, error: result ? null : '移行に失敗しました' }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        contents: { done: false, error: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // すべてのデータを初期化
  const handleInitializeAll = async () => {
    if (!adminEmail || !adminPassword) {
      setStatus(prev => ({
        ...prev,
        all: { done: false, error: '管理者のメールアドレスとパスワードを入力してください' }
      }));
      return;
    }

    setIsLoading(true);
    try {
      const result = await initializeFirebaseData(adminEmail, adminPassword);
      setStatus(prev => ({
        ...prev,
        all: { done: result, error: result ? null : '初期化に失敗しました' }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        all: { done: false, error: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <button
          className="flex items-center text-secondary mb-6"
          onClick={() => navigate(-1)}
        >
          <FiArrowLeft className="mr-1" />
          戻る
        </button>

        <div className="bg-primary rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-textLight mb-6 border-b border-primary-light pb-3">
            Firebase初期化ツール
          </h1>

          <div className="mb-8 p-4 bg-red-900/30 rounded-lg border border-red-800">
            <div className="flex items-start">
              <FiAlertTriangle className="text-red-500 text-xl mr-2 mt-1" />
              <div>
                <h3 className="text-red-400 font-medium">注意：本番環境設定ツール</h3>
                <p className="text-red-300 text-sm mt-1">
                  このツールは本番環境のFirebaseにデータを初期化・移行するためのものです。
                  一度実行すると元に戻せない操作があります。十分に注意して使用してください。
                </p>
              </div>
            </div>
          </div>

          {/* 管理者アカウント情報入力 */}
          <div className="mb-6">
            <h2 className="text-xl text-textLight mb-3">管理者アカウント情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="adminEmail" className="block text-textLight mb-1">
                  管理者メールアドレス
                </label>
                <input
                  type="email"
                  id="adminEmail"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label htmlFor="adminPassword" className="block text-textLight mb-1">
                  管理者パスワード
                </label>
                <input
                  type="password"
                  id="adminPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-primary-light border border-primary text-textLight focus:outline-none focus:border-secondary"
                  placeholder="6文字以上のパスワード"
                />
              </div>
            </div>
          </div>

          {/* 初期化操作ボタン */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-primary-light p-4 rounded-lg">
              <h3 className="text-textLight font-medium mb-2">
                1. 月次合言葉の初期化
                {status.passphrases.done && <FiCheck className="inline text-green-500 ml-2" />}
              </h3>
              <p className="text-textDark text-sm mb-3">
                2025年5月から7月までの合言葉をFirestoreに設定します
              </p>
              <button
                onClick={handleInitializePassphrases}
                disabled={isLoading || status.passphrases.done}
                className={`w-full py-2 rounded-lg ${
                  isLoading || status.passphrases.done
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-secondary text-primary hover:bg-secondary-light'
                } transition-colors`}
              >
                {isLoading ? '処理中...' : '合言葉を初期化'}
              </button>
              {status.passphrases.error && (
                <p className="text-red-500 text-xs mt-1">{status.passphrases.error}</p>
              )}
            </div>

            <div className="bg-primary-light p-4 rounded-lg">
              <h3 className="text-textLight font-medium mb-2">
                2. 管理者アカウント作成
                {status.admin.done && <FiCheck className="inline text-green-500 ml-2" />}
              </h3>
              <p className="text-textDark text-sm mb-3">
                Firebaseに管理者権限を持つユーザーを作成します
              </p>
              <button
                onClick={handleCreateAdmin}
                disabled={isLoading || status.admin.done}
                className={`w-full py-2 rounded-lg ${
                  isLoading || status.admin.done
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-secondary text-primary hover:bg-secondary-light'
                } transition-colors`}
              >
                {isLoading ? '処理中...' : '管理者を作成'}
              </button>
              {status.admin.error && (
                <p className="text-red-500 text-xs mt-1">{status.admin.error}</p>
              )}
            </div>

            <div className="bg-primary-light p-4 rounded-lg">
              <h3 className="text-textLight font-medium mb-2">
                3. コンテンツの移行
                {status.contents.done && <FiCheck className="inline text-green-500 ml-2" />}
              </h3>
              <p className="text-textDark text-sm mb-3">
                ローカルストレージのコンテンツをFirestoreに移行します
              </p>
              <button
                onClick={handleMigrateContents}
                disabled={isLoading || status.contents.done}
                className={`w-full py-2 rounded-lg ${
                  isLoading || status.contents.done
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-secondary text-primary hover:bg-secondary-light'
                } transition-colors`}
              >
                {isLoading ? '処理中...' : 'コンテンツを移行'}
              </button>
              {status.contents.error && (
                <p className="text-red-500 text-xs mt-1">{status.contents.error}</p>
              )}
            </div>

            <div className="bg-primary-light p-4 rounded-lg">
              <h3 className="text-textLight font-medium mb-2">
                一括初期化
                {status.all.done && <FiCheck className="inline text-green-500 ml-2" />}
              </h3>
              <p className="text-textDark text-sm mb-3">
                上記のすべての操作を一括で実行します
              </p>
              <button
                onClick={handleInitializeAll}
                disabled={isLoading || status.all.done}
                className={`w-full py-2 rounded-lg ${
                  isLoading || status.all.done
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-red-600 text-white hover:bg-red-500'
                } transition-colors`}
              >
                {isLoading ? '処理中...' : 'すべて初期化'}
              </button>
              {status.all.error && (
                <p className="text-red-500 text-xs mt-1">{status.all.error}</p>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-primary-light pt-4">
            <p className="text-textDark text-sm">
              初期化が完了したら、管理者アカウントでログインして動作確認してください。
              また、このページは本番環境設定後は削除するか、アクセス制限することをお勧めします。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseInitPage;
