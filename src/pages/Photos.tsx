import React, { useState, useEffect } from 'react';
import { ArticleManager, Article } from '../utils/storage';

/**
 * 写真ページのプロパティ
 */
interface PhotosProps {
  /** 記事詳細ページへの移動ハンドラー */
  onViewArticle?: (articleId: number) => void;
}

/**
 * 写真ページコンポーネント
 * 記事の画像をギャラリー形式で表示
 * 
 * @example
 * <Photos onViewArticle={(id) => console.log('記事表示:', id)} />
 * 
 * 入力: PhotosProps（記事表示ハンドラー）
 * 出力: 写真ギャラリーページ
 */
const Photos: React.FC<PhotosProps> = ({ onViewArticle }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  /**
   * 記事データを読み込む
   */
  const loadArticles = () => {
    const allArticles = ArticleManager.getAll();
    setArticles(allArticles);
  };

  /**
   * コンポーネントマウント時に記事を読み込み
   */
  useEffect(() => {
    loadArticles();
  }, []);

  /**
   * カテゴリ一覧を取得
   */
  const categories = ['all', ...Array.from(new Set(articles.map(article => article.category)))];

  /**
   * フィルタリングされた記事を取得
   */
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  /**
   * 記事カードをクリックした時の処理
   */
  const handleArticleClick = (articleId: number) => {
    if (onViewArticle) {
      onViewArticle(articleId);
    }
  };

  return (
    <div className="px-4 md:px-8 lg:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        
        {/* ページヘッダー */}
        <div className="p-4">
          <h1 className="text-[24px] md:text-[32px] font-bold text-[#0d141c] mb-2">
            写真
          </h1>
          <p className="text-[#49739c] text-sm">
            記事の画像をギャラリー形式で閲覧できます。
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
          <div className="bg-white rounded-lg p-4 border border-[#e7edf4]">
            <div className="text-2xl font-bold text-[#0d141c]">{articles.length}</div>
            <div className="text-sm text-[#49739c]">総記事数</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#e7edf4]">
            <div className="text-2xl font-bold text-[#0d141c]">{categories.length - 1}</div>
            <div className="text-sm text-[#49739c]">カテゴリ数</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-[#e7edf4]">
            <div className="text-2xl font-bold text-[#0d141c]">{filteredArticles.length}</div>
            <div className="text-sm text-[#49739c]">表示中の記事</div>
          </div>
        </div>

        {/* 検索・フィルター */}
        <div className="p-4 space-y-4">
          {/* 検索バー */}
          <div className="relative">
            <input
              type="text"
              placeholder="記事を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              fill="currentColor" 
              viewBox="0 0 256 256"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#49739c]"
            >
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
            </svg>
          </div>

          {/* カテゴリフィルター */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-[#f8fafc] text-[#49739c] hover:bg-[#e7edf4]'
                }`}
              >
                {category === 'all' ? 'すべて' : category}
              </button>
            ))}
          </div>
        </div>

        {/* 写真ギャラリー */}
        <div className="p-4">
          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="bg-white rounded-lg border border-[#e7edf4] overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
                >
                  {/* 画像 */}
                  <div className="relative overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                    
                    {/* カテゴリバッジ */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                        {article.category}
                      </span>
                    </div>

                    {/* 閲覧アイコン */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 p-2 rounded-full">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          fill="currentColor" 
                          viewBox="0 0 256 256"
                          className="text-[#0d141c]"
                        >
                          <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 記事情報 */}
                  <div className="p-4">
                    <h3 className="font-bold text-[#0d141c] text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-[#49739c] text-sm mb-3 line-clamp-2">
                      {article.description}
                    </p>
                    
                    {/* メタ情報 */}
                    <div className="flex items-center justify-between text-xs text-[#49739c]">
                      <div className="flex items-center gap-4">
                        <span>{article.publishedAt}</span>
                        {article.author && <span>by {article.author}</span>}
                      </div>
                      {article.readTime && (
                        <span>{article.readTime}分で読める</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-[#49739c] mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 256 256" className="mx-auto mb-4">
                  <path d="M216,40H72A16,16,0,0,0,56,56V72H40A16,16,0,0,0,24,88V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V184h16a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM72,56H216V152L192,128a16,16,0,0,0-22.63,0L144,153.37,121.37,130.74a16,16,0,0,0-22.63,0L72,157.37ZM184,200H40V88H56v80a16,16,0,0,0,16,16H184Zm32-32H72V173l32-32,22.63,22.63a8,8,0,0,0,11.32,0L160,141.25,189.25,170.5A8,8,0,0,0,200,168V56h16ZM144,96a16,16,0,1,1,16,16A16,16,0,0,1,144,96Z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0d141c] mb-2">
                {searchTerm || selectedCategory !== 'all' 
                  ? '条件に一致する記事が見つかりません' 
                  : '記事がまだありません'}
              </h3>
              <p className="text-[#49739c] text-sm">
                {searchTerm || selectedCategory !== 'all'
                  ? '検索条件やフィルターを変更してみてください。'
                  : '記事が投稿されると、ここに画像が表示されます。'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Photos; 