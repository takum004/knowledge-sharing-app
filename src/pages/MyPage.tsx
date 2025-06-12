import React, { useState, useEffect, useCallback } from 'react';
import ArticleCard from '../components/ArticleCard';
import { useAuth } from '../hooks/useAuth';
import { BookmarkManager, ReadLaterManager, ArticleManager, Article } from '../utils/storage';

/**
 * マイページのプロパティ
 */
interface MyPageProps {
  /** ユーザーID */
  userId: string;
  /** 記事詳細ページへの移動ハンドラー */
  onViewArticle?: (articleId: number) => void;
  /** ログアウトハンドラー */
  onLogout?: () => void;
}

/**
 * ブックマーク記事の型定義
 */
interface BookmarkedArticle extends Article {
  bookmarkedAt: string;
}

/**
 * あとで見る記事の型定義
 */
interface ReadLaterArticle extends Article {
  addedAt: string;
}

/**
 * マイページコンポーネント
 * ブックマークした記事と「あとで見る」記事を表示
 * 
 * @example
 * <MyPage userId="user123" onViewArticle={(id) => console.log('記事ID:', id)} onLogout={handleLogout} />
 * 
 * 入力: MyPageProps（ユーザーID、記事詳細移動ハンドラー、ログアウトハンドラー）
 * 出力: マイページ（ブックマーク、あとで見る記事一覧、アカウント管理）
 */
const MyPage: React.FC<MyPageProps> = ({ userId, onViewArticle, onLogout }) => {
  const { userRole, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'readLater'>('bookmarks');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<BookmarkedArticle[]>([]);
  const [readLaterArticles, setReadLaterArticles] = useState<ReadLaterArticle[]>([]);
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [readLaterCount, setReadLaterCount] = useState(0);

  /**
   * データを読み込む
   */
  const loadData = useCallback(() => {
    // ユーザー別のブックマークデータを取得
    const bookmarks = BookmarkManager.getUserBookmarks(userId);
    const bookmarkedData: BookmarkedArticle[] = bookmarks
      .map(bookmark => {
        const article = ArticleManager.getById(bookmark.articleId);
        if (article) {
          return {
            ...article,
            bookmarkedAt: new Date(bookmark.addedAt).toLocaleDateString('ja-JP')
          };
        }
        return null;
      })
      .filter((item): item is BookmarkedArticle => item !== null)
      .sort((a, b) => new Date(b.bookmarkedAt).getTime() - new Date(a.bookmarkedAt).getTime());

    // ユーザー別のあとで見るデータを取得
    const readLaterItems = ReadLaterManager.getUserItems(userId);
    const readLaterData: ReadLaterArticle[] = readLaterItems
      .map(item => {
        const article = ArticleManager.getById(item.articleId);
        if (article) {
          return {
            ...article,
            addedAt: new Date(item.addedAt).toLocaleDateString('ja-JP')
          };
        }
        return null;
      })
      .filter((item): item is ReadLaterArticle => item !== null)
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());

    setBookmarkedArticles(bookmarkedData);
    setReadLaterArticles(readLaterData);
    setBookmarkCount(BookmarkManager.getCount(userId));
    setReadLaterCount(ReadLaterManager.getCount(userId));
  }, [userId]);

  /**
   * コンポーネントマウント時にデータを読み込み
   */
  useEffect(() => {
    loadData();
  }, [userId, loadData]);

  /**
   * ログアウト処理
   */
  const handleLogout = () => {
    if (window.confirm('ログアウトしますか？')) {
      if (onLogout) {
        onLogout();
      }
    }
  };

  /**
   * ブックマークを削除
   */
  const handleRemoveBookmark = (articleId: number) => {
    if (window.confirm('ブックマークを削除しますか？')) {
      BookmarkManager.remove(articleId, userId);
      loadData(); // データを再読み込み
    }
  };

  /**
   * あとで見るから削除
   */
  const handleRemoveReadLater = (articleId: number) => {
    if (window.confirm('「あとで見る」から削除しますか？')) {
      ReadLaterManager.remove(articleId, userId);
      loadData(); // データを再読み込み
    }
  };

  const currentArticles = activeTab === 'bookmarks' ? bookmarkedArticles : readLaterArticles;

  return (
    <div className="px-4 md:px-8 lg:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        
        {/* ページタイトルとアカウント情報セクション */}
        <div className="p-4">
          {/* ページタイトル */}
          <div className="mb-6">
            <h1 className="text-[24px] md:text-[32px] font-bold text-[#0d141c] mb-2">
              マイページ
            </h1>
            <p className="text-[#49739c] text-sm">
              ブックマークした記事や後で読む記事を管理できます。
            </p>
          </div>
          
          {/* アカウント情報カード */}
          <div className="bg-white rounded-lg border border-[#e7edf4] p-4 md:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-16 sm:size-12 mx-auto sm:mx-0"
                style={{
                  backgroundImage: 'url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face")'
                }}
              ></div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-semibold text-[#0d141c] text-lg sm:text-base">
                  {user?.displayName || user?.username || 'ユーザー'}
                </h3>
                <p className="text-sm text-[#49739c] mt-1">
                  {userRole === 'admin' ? '全ての機能にアクセス可能' : '記事の閲覧・ブックマークが可能'}
                </p>
                
                {/* 権限バッジ */}
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    userRole === 'admin' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userRole === 'admin' ? '管理者権限' : 'ユーザー権限'}
                  </span>
                </div>
              </div>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#f8fafc] rounded-lg p-4 text-center">
                <div className="text-2xl sm:text-lg font-bold text-[#0d141c]">{bookmarkCount}</div>
                <div className="text-sm sm:text-xs text-[#49739c] mt-1">ブックマーク</div>
              </div>
              <div className="bg-[#f8fafc] rounded-lg p-4 text-center">
                <div className="text-2xl sm:text-lg font-bold text-[#0d141c]">{readLaterCount}</div>
                <div className="text-sm sm:text-xs text-[#49739c] mt-1">あとで見る</div>
              </div>
            </div>

            {/* ログアウトボタン */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"></path>
              </svg>
              ログアウト
            </button>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-[#cedbe8] px-4">
          <div className="flex gap-4 sm:gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`pb-3 pt-2 flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
                activeTab === 'bookmarks'
                  ? 'border-b-[3px] border-primary text-[#0d141c] font-bold'
                  : 'text-[#49739c] font-bold hover:text-[#0d141c]'
              } transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"></path>
              </svg>
              ブックマーク ({bookmarkCount})
            </button>
            <button
              onClick={() => setActiveTab('readLater')}
              className={`pb-3 pt-2 flex items-center gap-2 ${
                activeTab === 'readLater'
                  ? 'border-b-[3px] border-primary text-[#0d141c] font-bold'
                  : 'text-[#49739c] font-bold hover:text-[#0d141c]'
              } transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
              </svg>
              あとで見る ({readLaterCount})
            </button>
          </div>
        </div>

        {/* 記事リスト */}
        <div className="p-4">
          {currentArticles.length > 0 ? (
            <div className="space-y-4">
              {currentArticles.map((article) => (
                <div key={article.id} className="relative">
                  <ArticleCard
                    id={article.id}
                    title={article.title}
                    description={article.description}
                    imageUrl={article.imageUrl}
                    publishedAt={article.publishedAt}
                    category={article.category}
                    userId={userId}
                    onViewArticle={onViewArticle}
                  />
                  
                  {/* モバイル用アクションバー */}
                  <div className="md:hidden flex items-center justify-between bg-white border-t border-[#e7edf4] px-4 py-2 rounded-b-lg -mt-1">
                    <div className="text-xs text-[#49739c]">
                      {activeTab === 'bookmarks' 
                        ? `ブックマーク: ${(article as BookmarkedArticle).bookmarkedAt}`
                        : `追加: ${(article as ReadLaterArticle).addedAt}`
                      }
                    </div>
                    <button 
                      onClick={() => activeTab === 'bookmarks' 
                        ? handleRemoveBookmark(article.id) 
                        : handleRemoveReadLater(article.id)
                      }
                      className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                      </svg>
                      削除
                    </button>
                  </div>
                  
                  {/* デスクトップ用オーバーレイ */}
                  <div className="hidden md:block">
                    {/* 追加日時表示 */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1 text-xs text-[#49739c]">
                      {activeTab === 'bookmarks' 
                        ? `ブックマーク: ${(article as BookmarkedArticle).bookmarkedAt}`
                        : `追加: ${(article as ReadLaterArticle).addedAt}`
                      }
                    </div>
                    {/* 削除ボタン */}
                    <button 
                      onClick={() => activeTab === 'bookmarks' 
                        ? handleRemoveBookmark(article.id) 
                        : handleRemoveReadLater(article.id)
                      }
                      className="absolute top-4 right-20 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-[#49739c] hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-[#49739c] mb-4">
                {activeTab === 'bookmarks' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto mb-4">
                    <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.77,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32ZM184,208.43l-51.77-32.35a8,8,0,0,0-8.46,0L72,208.43V48H184Z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto mb-4">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-[#0d141c] mb-2">
                {activeTab === 'bookmarks' ? 'ブックマークした記事がありません' : 'あとで見る記事がありません'}
              </h3>
              <p className="text-[#49739c] text-sm">
                {activeTab === 'bookmarks' 
                  ? '気になる記事をブックマークして、いつでも簡単にアクセスできます。'
                  : '後で読みたい記事を追加して、時間があるときに読み返しましょう。'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage; 