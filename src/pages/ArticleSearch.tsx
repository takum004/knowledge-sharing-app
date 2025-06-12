import React, { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import { ArticleManager, Article } from '../utils/storage';

/**
 * 記事検索ページのプロパティ
 */
interface ArticleSearchProps {
  /** ユーザーID */
  userId: string;
  /** 記事詳細ページへの移動ハンドラー */
  onViewArticle?: (articleId: number) => void;
}

/**
 * 記事検索ページコンポーネント
 * キーワード、カテゴリ、タグで記事を検索
 * 
 * @example
 * <ArticleSearch userId="user123" onViewArticle={(id) => console.log('記事表示:', id)} />
 * 
 * 入力: ArticleSearchProps（ユーザーID、記事表示ハンドラー）
 * 出力: 記事検索ページ（検索フォーム、フィルター、記事一覧）
 */
const ArticleSearch: React.FC<ArticleSearchProps> = ({ userId, onViewArticle }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'likes'>('newest');
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<{ tag: string; count: number }[]>([]);

  /**
   * データを読み込む
   */
  useEffect(() => {
    const loadData = () => {
      const allArticles = ArticleManager.getAll();
      setArticles(allArticles);
      
      // 実際のカテゴリとタグを取得
      setAvailableCategories(ArticleManager.getAllCategories());
      setAvailableTags(ArticleManager.getAllTags());
  };

    loadData();
  }, []);

  /**
   * フィルタリング処理
   */
  useEffect(() => {
    let filtered = [...articles];

    // キーワード検索
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(term) ||
        article.description.toLowerCase().includes(term) ||
        (article.content && article.content.toLowerCase().includes(term)) ||
        (article.author && article.author.toLowerCase().includes(term))
      );
    }

    // カテゴリフィルター
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // タグフィルター
    if (selectedTag) {
      filtered = filtered.filter(article =>
        article.tags && article.tags.some(tag =>
          tag.toLowerCase() === selectedTag.toLowerCase()
        )
      );
    }

    // ソート処理
    filtered.sort((a, b) => {
    switch (sortBy) {
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'views':
          return (b.views || 0) - (a.views || 0);
        case 'likes':
          return (b.likes || 0) - (a.likes || 0);
      case 'newest':
      default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    }
    });

    setFilteredArticles(filtered);
  }, [articles, searchTerm, selectedCategory, selectedTag, sortBy]);

  /**
   * フィルターをリセット
   */
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    setSortBy('newest');
  };

  /**
   * 人気タグをクリックした時の処理
   */
  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
  };

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        
        {/* ページヘッダー */}
        <div className="p-4">
          <h1 className="text-[32px] font-bold text-[#0d141c] mb-2">
            記事を検索
          </h1>
          <p className="text-[#49739c] text-sm">
            キーワード、カテゴリ、タグで記事を検索できます。
          </p>
        </div>

        {/* 検索フォーム */}
        <div className="bg-white rounded-lg border border-[#e7edf4] p-6 mx-4 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
            <input
              type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="キーワードを入力してください（タイトル、内容、著者名で検索）"
                className="w-full px-4 py-3 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
              />
            </div>
            <button
              onClick={resetFilters}
              className="px-6 py-3 border border-[#e7edf4] text-[#49739c] rounded-lg hover:bg-[#f8fafc] transition-colors"
            >
              フィルターをリセット
            </button>
        </div>

        {/* フィルター */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* カテゴリフィルター */}
            <div>
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                カテゴリ
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
              >
                <option value="">すべてのカテゴリ</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* タグフィルター */}
            <div>
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                タグ
              </label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
              >
                <option value="">すべてのタグ</option>
                {availableTags.map((tagItem) => (
                  <option key={tagItem.tag} value={tagItem.tag}>
                    {tagItem.tag} ({tagItem.count})
                  </option>
                ))}
              </select>
            </div>

            {/* 並び順 */}
            <div>
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                並び順
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
              >
                <option value="newest">新しい順</option>
                <option value="oldest">古い順</option>
                <option value="views">閲覧数順</option>
                <option value="likes">いいね順</option>
              </select>
            </div>
          </div>
        </div>

        {/* 検索結果サマリー */}
        <div className="px-4 mb-4">
          <p className="text-[#49739c] text-sm">
            {filteredArticles.length > 0 
              ? `${filteredArticles.length}件の記事が見つかりました` 
              : '条件に一致する記事が見つかりませんでした'
            }
          </p>
        </div>

        {/* 人気タグ */}
        {availableTags.length > 0 && (
          <div className="px-4 mb-6">
            <h2 className="text-lg font-bold text-[#0d141c] mb-3">人気のタグ</h2>
          <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 10).map((tagItem) => (
              <button
                  key={tagItem.tag}
                  onClick={() => handleTagClick(tagItem.tag)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    selectedTag === tagItem.tag
                    ? 'bg-primary text-white'
                    : 'bg-[#e7edf4] text-[#49739c] hover:bg-primary hover:text-white'
                }`}
              >
                  #{tagItem.tag}
                  <span className="bg-white/20 px-1 rounded-full text-xs">
                    {tagItem.count}
                  </span>
              </button>
            ))}
          </div>
        </div>
        )}

        {/* 検索結果 */}
        <div className="px-4">
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
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
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0d141c] mb-2">記事が見つかりませんでした</h3>
              <p className="text-[#49739c] text-sm mb-4">
                検索条件を変更してもう一度お試しください。
              </p>
              <button 
                onClick={resetFilters}
                className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                フィルターをリセット
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleSearch; 