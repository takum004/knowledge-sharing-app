import React, { useState, useEffect, useCallback } from 'react';
import ArticleCard from '../components/ArticleCard';
import { ArticleManager, Article } from '../utils/storage';

/**
 * 記事一覧ページのプロパティ
 */
interface ArticleListProps {
  /** ユーザーID */
  userId: string;
  /** 記事詳細ページへの移動ハンドラー */
  onViewArticle?: (articleId: number) => void;
}

/**
 * 記事一覧ページコンポーネント
 * 
 * @example
 * <ArticleList userId="user123" onViewArticle={(id) => console.log('記事ID:', id)} />
 * 
 * 入力: ArticleListProps（ユーザーID、記事詳細移動ハンドラー）
 * 出力: 記事一覧ページ（最新記事カード、ページネーション）
 */
const ArticleList: React.FC<ArticleListProps> = ({ userId, onViewArticle }) => {
  const [articles, setArticles] = useState<Article[]>([]);

  /**
   * 記事データを読み込み、最新順にソートする
   * 
   * @example
   * loadArticles()
   * 
   * 入力: なし
   * 出力: 最新順ソート済み記事リストの設定
   */
  const loadArticles = useCallback(() => {
    const allArticles = ArticleManager.getAll();
    
    // 公開中の記事のみをフィルタリング
    const publishedArticles = allArticles.filter(article => 
      (article.status || 'published') === 'published'
    );
    
    // 最新順にソート（公開日時の降順）
    const sortedArticles = publishedArticles.sort((a, b) => {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
    
    setArticles(sortedArticles);
  }, []);

  /**
   * コンポーネントマウント時に記事を読み込み
   */
  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        
        {/* ページタイトルセクション */}
        <div className="p-4">
          <h1 className="text-[32px] font-bold text-[#0d141c] mb-2">
            ホーム
          </h1>
          <p className="text-[#49739c] text-sm">
            最新の記事やおすすめのコンテンツをご覧ください。
          </p>
        </div>

        {/* 記事カードリスト */}
        <div className="p-4">
          {articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  description={article.description}
                  imageUrl={article.imageUrl}
                  publishedAt={article.publishedAt}
                  category={article.category}
                  userId={userId}
                  onViewArticle={onViewArticle}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-[#49739c] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto mb-4">
                  <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM40,56H216V88H40ZM40,200V104H216v96Z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0d141c] mb-2">
                記事がまだありません
              </h3>
              <p className="text-[#49739c] text-sm">
                管理者が記事を投稿すると、ここに表示されます。
              </p>
            </div>
          )}
        </div>

        {/* ページネーション（記事がある場合のみ表示） */}
        {articles.length > 0 && (
          <div className="flex justify-center p-4">
            <nav className="flex items-center gap-2">
              <button className="flex items-center justify-center rounded-lg h-10 px-3 text-[#49739c] hover:bg-[#e7edf4] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                </svg>
                前へ
              </button>
              
              <button className="bg-[#e7edf4] rounded-full size-10 flex items-center justify-center font-bold text-[#0d141c]">
                1
              </button>
              
              <button className="flex items-center justify-center rounded-lg h-10 px-3 text-[#49739c] hover:bg-[#e7edf4] transition-colors">
                次へ
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleList; 