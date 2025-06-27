import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiClock, FiStar, FiTrendingUp, FiUser, FiLogOut, FiList } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import mainLogo from '../assets/images/mainlogo.png';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  
  // 現在のパスに基づいてアクティブタブを決定
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background relative pb-16">
      {/* ヘッダータブ */}
      <header className="sticky top-0 z-10 bg-primary shadow-md">
        <div className="px-4 py-3 flex items-center justify-center">
          <NavLink to="/member" className="cursor-pointer transition-transform hover:scale-105">
            <img src={mainLogo} alt="SUKITORE" className="h-10" />
          </NavLink>
        </div>
        <div className="overflow-x-auto whitespace-nowrap px-2 border-b border-primary-light">
          <NavLink to="/member" 
            className={({ isActive }) => 
              isActive ? "tab-button-active" : "tab-button"
            }
          >
            トップ
          </NavLink>
          <NavLink to="/member/new" 
            className={({ isActive }) => 
              isActive ? "tab-button-active" : "tab-button"
            }
          >
            新着
          </NavLink>
          <NavLink to="/member/featured" 
            className={({ isActive }) => 
              isActive ? "tab-button-active" : "tab-button"
            }
          >
            注目
          </NavLink>
          <NavLink to="/member/popular" 
            className={({ isActive }) => 
              isActive ? "tab-button-active" : "tab-button"
            }
          >
            人気
          </NavLink>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <main className="flex-grow px-4 py-4">
        <Outlet />
      </main>
      
      {/* フッターナビゲーション */}
      <footer className="fixed bottom-0 left-0 right-0 bg-primary border-t border-primary-light shadow-lg z-10">
        <nav className="flex justify-around items-center h-16">
          <NavLink to="/member" className="flex flex-col items-center justify-center w-1/5 p-2">
            <FiHome className={isActive('/member') ? "nav-icon-active" : "nav-icon"} />
            <span className={`text-xs mt-1 ${isActive('/member') ? 'text-secondary' : 'text-textDark'}`}>ホーム</span>
          </NavLink>
          <NavLink to="/member/new" className="flex flex-col items-center justify-center w-1/5 p-2">
            <FiClock className={isActive('/member/new') ? "nav-icon-active" : "nav-icon"} />
            <span className={`text-xs mt-1 ${isActive('/member/new') ? 'text-secondary' : 'text-textDark'}`}>新着</span>
          </NavLink>
          <NavLink to="/member/featured" className="flex flex-col items-center justify-center w-1/5 p-2">
            <FiStar className={isActive('/member/featured') ? "nav-icon-active" : "nav-icon"} />
            <span className={`text-xs mt-1 ${isActive('/member/featured') ? 'text-secondary' : 'text-textDark'}`}>注目</span>
          </NavLink>
          <NavLink to="/member/popular" className="flex flex-col items-center justify-center w-1/5 p-2">
            <FiTrendingUp className={isActive('/member/popular') ? "nav-icon-active" : "nav-icon"} />
            <span className={`text-xs mt-1 ${isActive('/member/popular') ? 'text-secondary' : 'text-textDark'}`}>人気</span>
          </NavLink>
          <NavLink to="/member/mypage" className="relative flex flex-col items-center justify-center w-1/5 p-2 group">
            <FiUser className={isActive('/member/mypage') || isActive('/member/history') ? "nav-icon-active" : "nav-icon"} />
            <span className={`text-xs mt-1 ${isActive('/member/mypage') || isActive('/member/history') ? 'text-secondary' : 'text-textDark'}`}>マイページ</span>
            
            {/* ドロップダウンメニュー */}
            <div className="hidden group-hover:block absolute top-full left-1/2 transform -translate-x-1/2 w-40 mt-2 bg-primary-dark shadow-lg rounded-lg overflow-hidden z-20">
              <div className="p-2 border-b border-primary-light text-center text-xs text-textLight">
                {currentUser?.email || 'ゲスト'}
              </div>
              <div 
                onClick={() => navigate('/member/history')} 
                className="block p-3 text-sm text-textLight hover:bg-primary flex items-center cursor-pointer"
              >
                <FiList className="mr-2" />
                閲覧履歴
              </div>
              <button 
                onClick={() => {
                  logout();
                  navigate('/landing');
                }}
                className="block w-full text-left p-3 text-sm text-red-400 hover:bg-primary flex items-center"
              >
                <FiLogOut className="mr-2" />
                ログアウト
              </button>
            </div>
          </NavLink>
        </nav>
      </footer>
    </div>
  );
};

export default Layout;
