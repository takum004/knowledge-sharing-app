import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLogin from './components/AdminLogin';
import ArticleList from './pages/ArticleList';
import ArticleSearch from './pages/ArticleSearch';
import ArticleDetail from './pages/ArticleDetail';
import MyPage from './pages/MyPage';
import ArticleManagement from './pages/ArticleManagement';
import Dashboard from './pages/Dashboard';
import ArticleEditor from './pages/ArticleEditor';
import Photos from './pages/Photos';
import UserManagement from './pages/UserManagement';
import { useAuth } from './hooks/useAuth';
import { addGensparkArticle, addGoogleAIArticle, addClaude4Article, addGoogleIO2025Article, addAIComparisonArticle, ArticleManager, UserManager } from './utils/storage';
import './App.css';

/**
 * メインアプリケーションコンポーネント
 * 
 * @example
 * <App />
 * 
 * 入力: なし
 * 出力: 完全なアプリケーション（認証、ヘッダー、メインコンテンツ、フッター）
 */
function App() {
  const { userRole, isAdmin, isLoggedIn, userId, user, login, register, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<'list' | 'search' | 'management' | 'dashboard' | 'mypage' | 'detail' | 'editor' | 'photos' | 'user-management'>('list');
  const [previousPage, setPreviousPage] = useState<'list' | 'search' | 'management' | 'dashboard' | 'mypage' | 'detail' | 'editor' | 'photos' | 'user-management'>('list');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');

  /**
   * アプリケーション初期化時にサンプル記事とデフォルト管理者を追加
   */
  useEffect(() => {
    // デフォルト管理者を初期化
    UserManager.initializeDefaultAdmin();

    const articles = ArticleManager.getAll();
    
    // Gensparkの記事がまだ存在しない場合のみ追加
    const gensparkExists = articles.some(article => 
      article.title.includes('Genspark') || article.title.includes('スーパーエージェント')
    );
    
    if (!gensparkExists) {
      addGensparkArticle();
    }

    // GoogleのAI記事がまだ存在しない場合のみ追加
    const googleAIExists = articles.some(article => 
      article.title.includes('Google') && article.title.includes('Gemini 2.5')
    );
    
    if (!googleAIExists) {
      addGoogleAIArticle();
    }

    // Claude 4の記事がまだ存在しない場合のみ追加
    const claude4Exists = articles.some(article => 
      article.title.includes('Claude 4') || article.title.includes('Anthropic')
    );
    
    if (!claude4Exists) {
      addClaude4Article();
    }

    // Google I/O 2025記事の追加
    const hasGoogleIO2025Article = articles.some(article => 
      article.title.includes('Google I/O 2025')
    );
    if (!hasGoogleIO2025Article) {
      addGoogleIO2025Article();
    }

    // AI比較記事の追加
    const hasAIComparisonArticle = articles.some(article => 
      article.title.includes('ChatGPT・Claude・Gemini')
    );
    if (!hasAIComparisonArticle) {
      addAIComparisonArticle();
    }
  }, []);

  /**
   * ログイン状態が変更された時の処理
   * ログアウト時にページ状態をリセット
   */
  useEffect(() => {
    if (!isLoggedIn) {
      // ログアウト時にページ状態をリセット
      setCurrentPage('list');
      setPreviousPage('list');
      setSelectedArticleId(null);
      setEditorMode('create');
    }
  }, [isLoggedIn]);

  /**
   * ログアウト処理（ページ状態リセット付き）
   */
  const handleLogout = () => {
    logout();
    // 状態を即座にリセット
    setCurrentPage('list');
    setPreviousPage('list');
    setSelectedArticleId(null);
    setEditorMode('create');
  };

  /**
   * ページ移動ハンドラー（権限チェック付き）
   */
  const handleNavigate = (page: string) => {
    // 管理者専用ページの権限チェック
    if ((page === 'management' || page === 'dashboard' || page === 'editor' || page === 'user-management') && !isAdmin) {
      console.warn('管理者権限が必要です');
      return;
    }

    // 現在のページを前のページとして保存（詳細ページ以外）
    if (currentPage !== 'detail') {
      setPreviousPage(currentPage);
    }

    switch (page) {
      case 'list':
        setCurrentPage('list');
        break;
      case 'search':
        setCurrentPage('search');
        break;
      case 'management':
        setCurrentPage('management');
        break;
      case 'dashboard':
        setCurrentPage('dashboard');
        break;
      case 'user-management':
        setCurrentPage('user-management');
        break;
      case 'mypage':
        setCurrentPage('mypage');
        break;
      case 'editor':
        setCurrentPage('editor');
        setEditorMode('create');
        break;
      case 'photos':
        setCurrentPage('photos');
        break;
      default:
        setCurrentPage('list');
    }
  };

  /**
   * 記事詳細ページへの移動
   */
  const handleViewArticle = (articleId: number) => {
    // 現在のページを前のページとして保存
    setPreviousPage(currentPage);
    setSelectedArticleId(articleId);
    setCurrentPage('detail');
  };

  /**
   * 記事詳細ページから戻る
   */
  const handleBackFromDetail = () => {
    setCurrentPage(previousPage);
    setSelectedArticleId(null);
  };

  /**
   * 記事編集ページへの移動（管理者のみ）
   */
  const handleEditArticle = (articleId: number) => {
    if (!isAdmin) {
      console.warn('管理者権限が必要です');
      return;
    }
    setSelectedArticleId(articleId);
    setEditorMode('edit');
    setCurrentPage('editor');
  };

  /**
   * ログイン成功時の処理
   */
  const handleLoginSuccess = (username: string, password: string, isRegister: boolean = false, displayName?: string) => {
    let success = false;
    
    if (isRegister) {
      success = register(username, password, displayName);
    } else {
      success = login(username, password);
    }
    
    if (success) {
      // ログイン成功時のページ遷移
      // 少し遅延してページ遷移（成功メッセージを見せるため）
      setTimeout(() => {
        const currentUser = UserManager.authenticate(username, password);
        console.log('ページ遷移判定:', { currentUser, role: currentUser?.role });
        if (currentUser?.role === 'admin') {
          setCurrentPage('dashboard');
        } else {
          setCurrentPage('list');
        }
      }, 1500);
    }
    
    return success;
  };

  const renderMainContent = () => {
    // ユーザーIDが必要なページでは、ログイン状態をチェック
    if (!userId) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-[#49739c]">ログインが必要です</p>
        </div>
      );
    }

    switch (currentPage) {
      case 'search':
        return <ArticleSearch userId={userId} onViewArticle={handleViewArticle} />;
      case 'management':
        return isAdmin ? (
          <ArticleManagement onCreateArticle={() => handleNavigate('editor')} onEditArticle={handleEditArticle} />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-[#49739c]">管理者権限が必要です</p>
          </div>
        );
      case 'dashboard':
        return isAdmin ? (
          <Dashboard userId={userId || undefined} />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-[#49739c]">管理者権限が必要です</p>
          </div>
        );
      case 'user-management':
        return isAdmin ? (
          <UserManagement currentUserId={userId || undefined} />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-[#49739c]">管理者権限が必要です</p>
          </div>
        );
      case 'mypage':
        return <MyPage userId={userId} onViewArticle={handleViewArticle} onLogout={handleLogout} />;
      case 'detail':
        return <ArticleDetail articleId={selectedArticleId || 1} userId={userId} onBack={handleBackFromDetail} />;
      case 'editor':
        return isAdmin ? (
          <ArticleEditor mode={editorMode} articleId={selectedArticleId || undefined} onSave={() => setCurrentPage('management')} />
        ) : (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-[#49739c]">管理者権限が必要です</p>
          </div>
        );
      case 'photos':
        return <Photos onViewArticle={handleViewArticle} />;
      case 'list':
      default:
        return <ArticleList userId={userId} onViewArticle={handleViewArticle} />;
    }
  };

  // ログインしていない場合はログイン画面を表示
  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* ヘッダー */}
        <Header 
          onNavigate={handleNavigate} 
          currentPage={currentPage} 
          userRole={userRole}
          user={user}
          onLogout={handleLogout}
        />
        
        {/* メインコンテンツエリア */}
        <main className="flex-1">
          {renderMainContent()}
        </main>
        
        {/* フッター */}
        <Footer />
      </div>
    </div>
  );
}

export default App;
