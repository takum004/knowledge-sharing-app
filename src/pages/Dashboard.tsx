import React, { useState, useEffect, useCallback } from 'react';
import { ArticleManager, BookmarkManager, LikesManager, ViewsManager } from '../utils/storage';

/**
 * ダッシュボードページのプロパティ
 */
interface DashboardProps {
  /** ユーザーID（管理者の場合は全体統計、一般ユーザーの場合は個人統計） */
  userId?: string;
}

/**
 * ダッシュボードページコンポーネント
 * マスター向けの統計情報と概要を表示
 * 
 * @example
 * <Dashboard userId="admin123" />
 * 
 * 入力: DashboardProps（ユーザーID）
 * 出力: ダッシュボードページ（統計情報、最近の活動、人気記事）
 */
const Dashboard: React.FC<DashboardProps> = ({ userId }) => {
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalBookmarks: 0,
    monthlyViews: 0,
    monthlyLikes: 0
  });

  const [popularArticles, setPopularArticles] = useState<any[]>([]);
  const [likedArticles, setLikedArticles] = useState<any[]>([]);

  /**
   * 統計データを読み込む
   */
  const loadStats = useCallback(() => {
    const articles = ArticleManager.getAll();
    
    // 管理者の場合は全体統計、一般ユーザーの場合は個人統計
    let bookmarkCount = 0;
    
    if (userId) {
      // 個人統計
      bookmarkCount = BookmarkManager.getCount(userId);
    } else {
      // 全体統計（管理者用）
      const allUsers = ['admin', 'user1', 'user2']; // 実際の実装では全ユーザーを取得
      bookmarkCount = allUsers.reduce((total, uid) => total + BookmarkManager.getCount(uid), 0);
    }
    
    // 記事ごとの実際のいいね数・閲覧数を使用
    const articlesWithStats = articles.map(article => ({
      ...article,
      views: ViewsManager.getCount(article.id),
      likes: LikesManager.getCount(article.id)
    }));

    const totalViews = articlesWithStats.reduce((sum, article) => sum + article.views, 0);
    const totalLikes = articlesWithStats.reduce((sum, article) => sum + article.likes, 0);

    setStats({
      totalArticles: articles.length,
      publishedArticles: articles.length, // 現在は全て公開中として扱う
      draftArticles: 0,
      totalViews,
      totalLikes,
      totalBookmarks: bookmarkCount,
      monthlyViews: Math.floor(totalViews * 0.35), // 月間は総数の35%と仮定
      monthlyLikes: Math.floor(totalLikes * 0.26)  // 月間は総数の26%と仮定
    });

    // 人気記事（閲覧数順）
    const topArticles = articlesWithStats
      .sort((a, b) => b.views - a.views)
      .slice(0, 3)
      .map((article, index) => ({
        id: article.id,
        title: article.title,
        views: article.views,
        likes: article.likes,
        category: article.category
      }));

    setPopularArticles(topArticles);

    // いいねランキング（いいね数順）
    const topLikedArticles = articlesWithStats
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 3)
      .map((article, index) => ({
        id: article.id,
        title: article.title,
        views: article.views,
        likes: article.likes,
        category: article.category
      }));

    setLikedArticles(topLikedArticles);
  }, [userId]);

  /**
   * コンポーネントマウント時にデータを読み込み
   */
  useEffect(() => {
    loadStats();
  }, [userId, loadStats]);

  const recentActivities = [
    {
      id: 1,
      type: 'like',
      message: '「機械学習の基礎：初心者向けガイド」がいいねされました',
      time: '2時間前'
    },
    {
      id: 2,
      type: 'bookmark',
      message: '「React TypeScriptでモダンなWebアプリ開発」がブックマークされました',
      time: '4時間前'
    },
    {
      id: 3,
      type: 'view',
      message: '「認知心理学入門」が100回閲覧されました',
      time: '6時間前'
    },
    {
      id: 4,
      type: 'like',
      message: '「データサイエンス実践ガイド」がいいねされました',
      time: '8時間前'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
              <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32Z"></path>
            </svg>
          </div>
        );
      case 'bookmark':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
              <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.76,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"></path>
            </svg>
          </div>
        );
      case 'view':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
              <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="px-4 md:px-8 lg:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        
        {/* ページヘッダー */}
        <div className="p-4">
          <h1 className="text-[24px] md:text-[32px] font-bold text-[#0d141c] mb-2">
            ダッシュボード
          </h1>
          <p className="text-[#49739c] text-sm">
            記事の統計情報と最近の活動を確認できます。
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          <div className="bg-white rounded-lg p-6 border border-[#e7edf4] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#0d141c]">{stats.totalArticles}</div>
                <div className="text-sm text-[#49739c]">総記事数</div>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-primary">
                  <path d="M208,24H72A32,32,0,0,0,40,56V224a8,8,0,0,0,11.58,7.16L88,216.43l36.42,14.57a8,8,0,0,0,5.16,0L166,216.43l36.42,14.57A8,8,0,0,0,216,224V56A32,32,0,0,0,208,24ZM200,204.57l-28.42-11.37a8,8,0,0,0-5.16,0L130,208.43,93.58,193.2a8,8,0,0,0-5.16,0L56,204.57V56A16,16,0,0,1,72,40H208a16,16,0,0,1,16,16Z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-[#e7edf4] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#0d141c]">{stats.totalViews.toLocaleString()}</div>
                <div className="text-sm text-[#49739c]">総閲覧数</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-green-600">
                  <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-[#e7edf4] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#0d141c]">{stats.totalLikes}</div>
                <div className="text-sm text-[#49739c]">総いいね数</div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
                  <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32Z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-[#e7edf4] hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-[#0d141c]">{stats.totalBookmarks}</div>
                <div className="text-sm text-[#49739c]">総ブックマーク数</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
                  <path d="M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.76,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
          
          {/* 最近の活動 */}
          <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
            <h3 className="text-lg font-bold text-[#0d141c] mb-4">最近の活動</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-sm text-[#0d141c]">{activity.message}</p>
                    <p className="text-xs text-[#49739c] mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 人気記事（閲覧数順） */}
          <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
            <h3 className="text-lg font-bold text-[#0d141c] mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-green-600">
                <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
              </svg>
              人気記事
            </h3>
            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <div key={article.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-[#0d141c] line-clamp-2 mb-1">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-[#49739c]">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
                          <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                        </svg>
                        {article.views.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
                          <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32Z"></path>
                        </svg>
                        {article.likes}
                      </span>
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* いいねランキング */}
          <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
            <h3 className="text-lg font-bold text-[#0d141c] mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
                <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32Z"></path>
              </svg>
              いいねランキング
            </h3>
            <div className="space-y-4">
              {likedArticles.map((article, index) => (
                <div key={article.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-500 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-[#0d141c] line-clamp-2 mb-1">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-[#49739c]">
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
                          <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32Z"></path>
                        </svg>
                        {article.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
                          <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                        </svg>
                        {article.views.toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-500 px-2 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 月間統計 */}
        <div className="p-4">
          <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
            <h3 className="text-lg font-bold text-[#0d141c] mb-4">今月の統計</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats.monthlyViews.toLocaleString()}
                </div>
                <div className="text-sm text-[#49739c]">月間閲覧数</div>
                <div className="text-xs text-green-600 mt-1">+15% 先月比</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stats.monthlyLikes}
                </div>
                <div className="text-sm text-[#49739c]">月間いいね数</div>
                <div className="text-xs text-green-600 mt-1">+8% 先月比</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 