import React, { useState, useEffect } from 'react';
import { ArticleManager, LikesManager, ViewsManager, Article } from '../utils/storage';

/**
 * 記事管理ページのプロパティ
 */
interface ArticleManagementProps {
  /** 新しい記事作成ハンドラー */
  onCreateArticle?: () => void;
  /** 記事編集ハンドラー */
  onEditArticle?: (articleId: number) => void;
}

/**
 * 記事データの拡張型（管理用）
 */
interface ManagementArticle extends Article {
  status: 'published' | 'draft';
  views: number;
  likes: number;
}

/**
 * 記事管理ページコンポーネント
 * マスター専用の記事管理機能を提供
 * 
 * @example
 * <ArticleManagement 
 *   onCreateArticle={() => console.log('記事作成')}
 *   onEditArticle={(id) => console.log('記事編集:', id)}
 * />
 * 
 * 入力: ArticleManagementProps（記事作成・編集ハンドラー）
 * 出力: 記事管理ページ（記事一覧、編集、削除機能）
 */
const ArticleManagement: React.FC<ArticleManagementProps> = ({ onCreateArticle, onEditArticle }) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'published' | 'draft'>('all');
  const [articles, setArticles] = useState<ManagementArticle[]>([]);

  /**
   * 記事データを読み込む
   */
  const loadArticles = () => {
    const allArticles = ArticleManager.getAll();
    // 管理用データに変換（statusがない場合はpublishedとして扱う）
    const managementArticles: ManagementArticle[] = allArticles.map(article => ({
      ...article,
      status: (article.status || 'published') as 'published' | 'draft',
      views: ViewsManager.getCount(article.id),  // 実際の閲覧数を使用
      likes: LikesManager.getCount(article.id)   // 実際のいいね数を使用
    }));
    
    setArticles(managementArticles);
  };

  /**
   * コンポーネントマウント時に記事を読み込み
   */
  useEffect(() => {
    loadArticles();
  }, []);

  /**
   * 記事削除処理
   */
  const handleDeleteArticle = (articleId: number) => {
    if (window.confirm('この記事を削除しますか？この操作は取り消せません。')) {
      const success = ArticleManager.delete(articleId);
      if (success) {
        loadArticles(); // データを再読み込み
        console.log(`記事 ${articleId} を削除しました`);
      } else {
        alert('記事の削除に失敗しました');
      }
    }
  };

  /**
   * 記事ステータス切り替え処理
   */
  const handleToggleStatus = (articleId: number, currentStatus: 'published' | 'draft') => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const statusText = newStatus === 'published' ? '公開' : '非公開';
    
    if (window.confirm(`この記事を${statusText}にしますか？`)) {
      const success = ArticleManager.update(articleId, { status: newStatus });
      if (success) {
        loadArticles(); // データを再読み込み
        console.log(`記事 ${articleId} のステータスを${statusText}に変更しました`);
      } else {
        alert('ステータスの変更に失敗しました');
      }
    }
  };

  const filteredArticles = articles.filter(article => {
    if (selectedTab === 'published') return article.status === 'published';
    if (selectedTab === 'draft') return article.status === 'draft';
    return true; // all
  });

  const getStatusBadge = (status: string, articleId: number) => {
    if (status === 'published') {
      return (
        <button
          onClick={() => handleToggleStatus(articleId, 'published')}
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors cursor-pointer"
          title="クリックして非公開にする"
        >
          公開中
        </button>
      );
    } else {
      return (
        <button
          onClick={() => handleToggleStatus(articleId, 'draft')}
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors cursor-pointer"
          title="クリックして公開する"
        >
          非公開
        </button>
      );
    }
  };

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        
        {/* ページヘッダー */}
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#0d141c] mb-2">
              記事管理
            </h1>
            <p className="text-[#49739c] text-sm">
              投稿した記事の管理と編集を行えます。
            </p>
          </div>
          <button 
            onClick={onCreateArticle}
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            新しい記事を作成
          </button>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-4 gap-4 p-4">
          <div className="bg-white rounded-lg p-4 border border-[#e7edf4]">
            <div className="text-2xl font-bold text-[#0d141c]">{articles.length}</div>
            <div className="text-sm text-[#49739c]">総記事数</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#e7edf4]">
            <div className="text-2xl font-bold text-[#0d141c]">
              {articles.filter(a => a.status === 'published').length}
            </div>
            <div className="text-sm text-[#49739c]">公開中</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#e7edf4]">
            <div className="text-2xl font-bold text-[#0d141c]">
              {articles.filter(a => a.status === 'draft').length}
            </div>
            <div className="text-sm text-[#49739c]">下書き</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#e7edf4]">
            <div className="text-2xl font-bold text-[#0d141c]">
              {articles.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
            </div>
            <div className="text-sm text-[#49739c]">総閲覧数</div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-[#cedbe8] px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setSelectedTab('all')}
              className={`pb-3 pt-2 ${
                selectedTab === 'all'
                  ? 'border-b-[3px] border-primary text-[#0d141c] font-bold'
                  : 'text-[#49739c] font-bold hover:text-[#0d141c]'
              } transition-colors`}
            >
              すべて ({articles.length})
            </button>
            <button
              onClick={() => setSelectedTab('published')}
              className={`pb-3 pt-2 ${
                selectedTab === 'published'
                  ? 'border-b-[3px] border-primary text-[#0d141c] font-bold'
                  : 'text-[#49739c] font-bold hover:text-[#0d141c]'
              } transition-colors`}
            >
              公開中 ({articles.filter(a => a.status === 'published').length})
            </button>
            <button
              onClick={() => setSelectedTab('draft')}
              className={`pb-3 pt-2 ${
                selectedTab === 'draft'
                  ? 'border-b-[3px] border-primary text-[#0d141c] font-bold'
                  : 'text-[#49739c] font-bold hover:text-[#0d141c]'
              } transition-colors`}
            >
              下書き ({articles.filter(a => a.status === 'draft').length})
            </button>
          </div>
        </div>

        {/* 記事テーブル */}
        <div className="p-4">
          {filteredArticles.length > 0 ? (
            <div className="bg-white rounded-lg border border-[#e7edf4] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#f8fafc] border-b border-[#e7edf4]">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-[#49739c] text-sm">タイトル</th>
                    <th className="text-left py-3 px-4 font-medium text-[#49739c] text-sm">ステータス</th>
                    <th className="text-left py-3 px-4 font-medium text-[#49739c] text-sm">カテゴリ</th>
                    <th className="text-left py-3 px-4 font-medium text-[#49739c] text-sm">公開日</th>
                    <th className="text-left py-3 px-4 font-medium text-[#49739c] text-sm">閲覧数</th>
                    <th className="text-left py-3 px-4 font-medium text-[#49739c] text-sm">いいね</th>
                    <th className="text-left py-3 px-4 font-medium text-[#49739c] text-sm">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="border-b border-[#e7edf4] hover:bg-[#f8fafc] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#0d141c] line-clamp-2">
                          {article.title}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(article.status, article.id)}
                      </td>
                      <td className="py-3 px-4 text-[#49739c] text-sm">
                        {article.category}
                      </td>
                      <td className="py-3 px-4 text-[#49739c] text-sm">
                        {article.publishedAt}
                      </td>
                      <td className="py-3 px-4 text-[#49739c] text-sm">
                        {article.views.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-[#49739c] text-sm">
                        {article.likes}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditArticle && onEditArticle(article.id)}
                            className="p-2 text-[#49739c] hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="編集"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M227.31,73.37,182.63,28.69a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.69,147.31,64l24-24L216,84.69Z"></path>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="p-2 text-[#49739c] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="削除"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                              <path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-[#49739c] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto mb-4">
                  <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V88H40ZM40,200V104H216v96Z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0d141c] mb-2">
                {selectedTab === 'all' ? '記事がまだありません' : 
                 selectedTab === 'published' ? '公開中の記事がありません' : 
                 '下書きの記事がありません'}
              </h3>
              <p className="text-[#49739c] text-sm mb-4">
                新しい記事を作成して、知識を共有しましょう。
              </p>
              <button 
                onClick={onCreateArticle}
                className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                記事を作成する
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleManagement; 