import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// ページコンポーネントのインポート
import PasswordGate from './pages/PasswordGate';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import NewContentPage from './pages/NewContentPage';
import FeaturedContentPage from './pages/FeaturedContentPage';
import PopularContentPage from './pages/PopularContentPage';
import ContentDetailPage from './pages/ContentDetailPage';
import ViewHistoryPage from './pages/ViewHistoryPage';
import MyPage from './pages/MyPage';
import AdminPage from './pages/AdminPage';
import FirebaseInitPage from './pages/FirebaseInitPage';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';

// 認証が必要なルートを保護するためのコンポーネント
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, requiresMonthlyAuth, loading } = useAuth();
  const location = useLocation();
  
  // ローディング中は何も表示しない
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-secondary">Loading...</div>
    </div>;
  }
  
  // 月次認証が必要な場合
  if (requiresMonthlyAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!isAuthenticated) {
    // リダイレクト時に元のパス情報を渡す
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// 管理者ルートを保護するためのコンポーネント (より厳格な認証が必要な場合に拡張可能)
const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // ローディング中は何も表示しない
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-secondary">Loading...</div>
    </div>;
  }
  
  if (!isAuthenticated) {
    // リダイレクト時に元のパス情報を渡す
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

function App() {
  return (
    <Routes>
      {/* ランディングページ（認証不要） */}
      <Route path="/landing" element={<LandingPage />} />
      
      {/* 認証ページ */}
      <Route path="/password" element={<PasswordGate />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* 認証が必要な会員ページ */}
      <Route path="/member" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<HomePage />} />
        <Route path="new" element={<NewContentPage />} />
        <Route path="featured" element={<FeaturedContentPage />} />
        <Route path="popular" element={<PopularContentPage />} />
        <Route path="content/:id" element={<ContentDetailPage />} />
        <Route path="history" element={<ViewHistoryPage />} />
        <Route path="mypage" element={<MyPage />} />
      </Route>
      
      {/* 管理者ページ */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      } />
      
      {/* Firebase初期化ページ */}
      <Route path="/firebase-init" element={
        <AdminRoute>
          <FirebaseInitPage />
        </AdminRoute>
      } />
      
      {/* 直接コンテンツへのアクセスルート - 認証が必要 */}
      <Route path="/" element={<Navigate to="/member" replace />} />
      
      {/* 認証が必要なメインコンテンツへの直接アクセス */}
      <Route path="/home" element={<Navigate to="/member" replace />} />
      <Route path="/new" element={<Navigate to="/member/new" replace />} />
      <Route path="/featured" element={<Navigate to="/member/featured" replace />} />
      <Route path="/popular" element={<Navigate to="/member/popular" replace />} />
      <Route path="/content/:id" element={<Navigate to="/member/content/:id" replace />} />
      <Route path="/history" element={<Navigate to="/member/history" replace />} />
      <Route path="/mypage" element={<Navigate to="/member/mypage" replace />} />
      
      {/* 未定義のパスはメインコンテンツページへリダイレクト */}
      <Route path="*" element={<Navigate to="/member" replace />} />
    </Routes>
  );
}

export default App;
