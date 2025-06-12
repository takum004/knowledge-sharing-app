import React, { useState } from 'react';
import { User } from '../utils/storage';

/**
 * ヘッダーコンポーネントのプロパティ
 */
interface HeaderProps {
  /** ページ移動ハンドラー */
  onNavigate: (page: string) => void;
  /** 現在のページ */
  currentPage: string;
  /** ユーザーの役割 */
  userRole: 'admin' | 'user' | null;
  /** ユーザー情報 */
  user: User | null;
  /** ログアウトハンドラー */
  onLogout: () => void;
}

/**
 * ヘッダーコンポーネント
 * ナビゲーションとユーザー情報を表示
 * 
 * @example
 * <Header 
 *   onNavigate={(page) => setCurrentPage(page)} 
 *   currentPage="list" 
 *   userRole="admin"
 *   user={userObject}
 *   onLogout={handleLogout} 
 * />
 * 
 * 入力: HeaderProps（ナビゲーション、現在ページ、ユーザー役割、ユーザー情報、ログアウト）
 * 出力: ヘッダー（ロゴ、ナビゲーション、ユーザーメニュー）
 */
const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage, userRole, user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  /**
   * ナビゲーションアイテムのスタイルを取得
   */
  const getNavItemStyle = (page: string) => {
    const baseStyle = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors";
    return currentPage === page 
      ? `${baseStyle} bg-primary text-white` 
      : `${baseStyle} text-[#49739c] hover:bg-[#f0f2f5] hover:text-[#0d141c]`;
  };

  /**
   * ユーザーメニューの表示切り替え
   */
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  /**
   * ログアウト処理
   */
  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-4 md:px-10 py-3 bg-white">
      
      {/* ロゴとタイトル */}
      <div className="flex items-center gap-2 md:gap-4 text-[#0d141c]">
        <div className="size-4">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
          </svg>
        </div>
        <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">Bloggr</h2>
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="hidden md:flex items-center gap-2">
        <button 
          onClick={() => onNavigate('list')}
          className={getNavItemStyle('list')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.44,0,1.18,1.18,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
          </svg>
          ホーム
        </button>

        <button 
          onClick={() => onNavigate('search')}
          className={getNavItemStyle('search')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
          </svg>
          検索
        </button>

        <button 
          onClick={() => onNavigate('photos')}
          className={getNavItemStyle('photos')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM156,88a12,12,0,1,1-12,12A12,12,0,0,1,156,88Zm60,112H40V160l52-52a8,8,0,0,1,11.31,0L144,148.69l20-20a8,8,0,0,1,11.31,0L216,169.37V200Z"></path>
          </svg>
          写真
        </button>

        {/* 管理者専用メニュー */}
        {userRole === 'admin' && (
          <>
            <button 
              onClick={() => onNavigate('dashboard')}
              className={getNavItemStyle('dashboard')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM112,192H64V152h48Zm0-56H64V96h48Zm80,56H128V152h64Zm0-56H128V96h64Z"></path>
              </svg>
              ダッシュボード
            </button>

            <button 
              onClick={() => onNavigate('management')}
              className={getNavItemStyle('management')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path>
              </svg>
              記事管理
            </button>

            <button 
              onClick={() => onNavigate('user-management')}
              className={getNavItemStyle('user-management')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
              </svg>
              ユーザー管理
            </button>
          </>
        )}

        <button 
          onClick={() => onNavigate('mypage')}
          className={getNavItemStyle('mypage')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
            <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
          </svg>
          マイページ
        </button>
      </nav>

      {/* モバイルメニューボタン */}
      <button
        onClick={toggleUserMenu}
        className="md:hidden flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f0f2f5] transition-colors"
      >
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face")'
          }}
        ></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-[#49739c]">
          <path d="m213.66,101.66-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
        </svg>
      </button>

      {/* デスクトップ用ユーザーメニュー */}
      <div className="hidden md:block relative">
        <button
          onClick={toggleUserMenu}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f0f2f5] transition-colors"
        >
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face")'
            }}
          ></div>
          <div className="text-left">
            <div className="text-sm font-medium text-[#0d141c]">
              {user?.displayName || user?.username || 'ユーザー'}
            </div>
            <div className="text-xs text-[#49739c]">
              {userRole === 'admin' ? '管理者' : 'ユーザー'}
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-[#49739c]">
            <path d="m213.66,101.66-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
          </svg>
        </button>

        {/* デスクトップ用ドロップダウンメニュー */}
        {showUserMenu && (
          <div className="hidden md:block absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#e7edf4] py-2 z-50">
            <div className="px-4 py-2 border-b border-[#e7edf4]">
              <div className="text-sm font-medium text-[#0d141c]">
                {user?.displayName || user?.username}
              </div>
              <div className="text-xs text-[#49739c]">
                {user?.username && user?.displayName !== user?.username ? `@${user.username}` : ''}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  userRole === 'admin' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userRole === 'admin' ? '管理者' : 'ユーザー'}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowUserMenu(false);
                onNavigate('mypage');
              }}
              className="w-full text-left px-4 py-2 text-sm text-[#0d141c] hover:bg-[#f0f2f5] flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
              </svg>
              プロフィール
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"></path>
              </svg>
              ログアウト
            </button>
          </div>
        )}
      </div>

      {/* モバイル用全画面メニュー */}
      {showUserMenu && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowUserMenu(false)}>
          <div className="bg-white w-full h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* モバイルメニューヘッダー */}
            <div className="flex items-center justify-between p-4 border-b border-[#e7edf4]">
              <h3 className="text-lg font-bold text-[#0d141c]">メニュー</h3>
              <button
                onClick={() => setShowUserMenu(false)}
                className="p-2 rounded-lg hover:bg-[#f0f2f5] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                </svg>
              </button>
            </div>

            {/* ユーザー情報 */}
            <div className="p-4 border-b border-[#e7edf4]">
              <div className="flex items-center gap-3">
                <div 
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                  style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face")'
                  }}
                ></div>
                <div>
                  <div className="text-base font-medium text-[#0d141c]">
                    {user?.displayName || user?.username || 'ユーザー'}
                  </div>
                  <div className="text-sm text-[#49739c]">
                    {user?.username && user?.displayName !== user?.username ? `@${user.username}` : ''}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      userRole === 'admin' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {userRole === 'admin' ? '管理者' : 'ユーザー'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* モバイルナビゲーション */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                <button 
                  onClick={() => { setShowUserMenu(false); onNavigate('list'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    currentPage === 'list' ? 'bg-primary text-white' : 'text-[#49739c] hover:bg-[#f0f2f5]'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.44,0,1.18,1.18,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path>
                  </svg>
                  ホーム
                </button>

                <button 
                  onClick={() => { setShowUserMenu(false); onNavigate('search'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    currentPage === 'search' ? 'bg-primary text-white' : 'text-[#49739c] hover:bg-[#f0f2f5]'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                  </svg>
                  検索
                </button>

                <button 
                  onClick={() => { setShowUserMenu(false); onNavigate('photos'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    currentPage === 'photos' ? 'bg-primary text-white' : 'text-[#49739c] hover:bg-[#f0f2f5]'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM156,88a12,12,0,1,1-12,12A12,12,0,0,1,156,88Zm60,112H40V160l52-52a8,8,0,0,1,11.31,0L144,148.69l20-20a8,8,0,0,1,11.31,0L216,169.37V200Z"></path>
                  </svg>
                  写真
                </button>

                {userRole === 'admin' && (
                  <>
                    <button 
                      onClick={() => { setShowUserMenu(false); onNavigate('dashboard'); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        currentPage === 'dashboard' ? 'bg-primary text-white' : 'text-[#49739c] hover:bg-[#f0f2f5]'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM112,192H64V152h48Zm0-56H64V96h48Zm80,56H128V152h64Zm0-56H128V96h64Z"></path>
                      </svg>
                      ダッシュボード
                    </button>

                    <button 
                      onClick={() => { setShowUserMenu(false); onNavigate('management'); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        currentPage === 'management' ? 'bg-primary text-white' : 'text-[#49739c] hover:bg-[#f0f2f5]'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z"></path>
                      </svg>
                      記事管理
                    </button>

                    <button 
                      onClick={() => { setShowUserMenu(false); onNavigate('user-management'); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        currentPage === 'user-management' ? 'bg-primary text-white' : 'text-[#49739c] hover:bg-[#f0f2f5]'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z"></path>
                      </svg>
                      ユーザー管理
                    </button>
                  </>
                )}

                <button 
                  onClick={() => { setShowUserMenu(false); onNavigate('mypage'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    currentPage === 'mypage' ? 'bg-primary text-white' : 'text-[#49739c] hover:bg-[#f0f2f5]'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                  </svg>
                  マイページ
                </button>
              </div>

              {/* アクションボタン */}
              <div className="p-4 border-t border-[#e7edf4] space-y-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate('mypage');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[#0d141c] hover:bg-[#f0f2f5] rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                  </svg>
                  プロフィール
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"></path>
                  </svg>
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header; 