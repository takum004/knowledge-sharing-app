import React, { useState, useEffect } from 'react';
import { BookmarkManager, ReadLaterManager } from '../utils/storage';

/**
 * 記事カードのプロパティ
 */
interface ArticleCardProps {
  /** 記事ID */
  id: number;
  /** 記事タイトル */
  title: string;
  /** 記事の説明文 */
  description: string;
  /** 記事の画像URL */
  imageUrl: string;
  /** 投稿日 */
  publishedAt: string;
  /** カテゴリ名 */
  category: string;
  /** ユーザーID */
  userId: string;
  /** 記事詳細ページへの移動ハンドラー */
  onViewArticle?: (articleId: number) => void;
}

/**
 * 記事カードコンポーネント
 * 
 * @example
 * <ArticleCard 
 *   id={1}
 *   title="AIの基礎知識"
 *   description="人工知能の基本概念について学びましょう"
 *   imageUrl="https://example.com/image.jpg"
 *   publishedAt="2024年1月15日"
 *   category="AI・機械学習"
 *   userId="user123"
 *   onViewArticle={(id) => console.log('記事ID:', id)}
 * />
 * 
 * 入力: ArticleCardProps（記事情報、ユーザーID、記事詳細移動ハンドラー）
 * 出力: 記事カード要素（ブックマーク機能付き）
 */
const ArticleCard: React.FC<ArticleCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  publishedAt,
  category,
  userId,
  onViewArticle
}) => {
  // ブックマーク状態管理
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReadLater, setIsReadLater] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);

  /**
   * コンポーネントマウント時に初期状態を読み込み
   */
  useEffect(() => {
    setIsBookmarked(BookmarkManager.isBookmarked(id, userId));
    setIsReadLater(ReadLaterManager.isInReadLater(id, userId));
    setCurrentImageUrl(imageUrl);
  }, [id, userId, imageUrl]);

  /**
   * 画像読み込みエラー時のフォールバック処理
   */
  const handleImageError = () => {
    // デフォルト画像に切り替え
    setCurrentImageUrl(`data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
        <rect width="800" height="400" fill="#f0f2f5"/>
        <text x="400" y="200" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af">記事画像</text>
      </svg>
    `)}`);
  };

  /**
   * ブックマーク状態を切り替える
   */
  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); // カード全体のクリックイベントを防ぐ
    
    if (isBookmarked) {
      BookmarkManager.remove(id, userId);
      setIsBookmarked(false);
      console.log(`記事 ${id} をブックマークから削除しました`);
    } else {
      BookmarkManager.add(id, userId);
      setIsBookmarked(true);
      console.log(`記事 ${id} をブックマークに追加しました`);
    }
  };

  /**
   * あとで見る状態を切り替える
   */
  const toggleReadLater = (e: React.MouseEvent) => {
    e.stopPropagation(); // カード全体のクリックイベントを防ぐ
    
    if (isReadLater) {
      ReadLaterManager.remove(id, userId);
      setIsReadLater(false);
      console.log(`記事 ${id} をあとで見るから削除しました`);
    } else {
      ReadLaterManager.add(id, userId);
      setIsReadLater(true);
      console.log(`記事 ${id} をあとで見るに追加しました`);
    }
  };

  /**
   * 記事詳細ページへの遷移
   */
  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewArticle) {
      onViewArticle(id);
    }
  };

  return (
    <div className="article-card relative flex flex-col md:flex-row gap-4 rounded-lg p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer bg-white border border-[#e7edf4]">
      
      {/* モバイル用画像（上部） */}
      <div className="md:hidden w-full aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2">
        <img 
          src={currentImageUrl} 
          alt={title}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* 記事情報 */}
      <div className="flex-1 md:flex-[2_2_0px] flex flex-col justify-between">
        <div>
          {/* カテゴリバッジ */}
          <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full mb-2">
            {category}
          </span>
          
          {/* 記事タイトル */}
          <h3 className="text-base md:text-base font-bold text-[#0d141c] mb-2 line-clamp-2">
            {title}
          </h3>
          
          {/* 記事説明 */}
          <p className="text-[#49739c] text-sm mb-3 line-clamp-2 md:line-clamp-3">
            {description}
          </p>
          
          {/* 投稿日情報 */}
          <p className="text-[#49739c] text-xs mb-4">
            {publishedAt}
          </p>
        </div>
        
        {/* アクションボタン群 */}
        <div className="flex items-center justify-between gap-3">
          {/* 読むボタン */}
          <button 
            className="bg-primary text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors flex-1 min-w-0"
            onClick={handleReadMore}
          >
            続きを読む
          </button>
          
          {/* アクションボタングループ */}
          <div className="flex items-center gap-2">
            {/* あとで見るボタン */}
            <button
              onClick={toggleReadLater}
              className={`p-2.5 rounded-lg transition-colors min-w-[40px] h-[40px] flex items-center justify-center ${
                isReadLater 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-500 hover:text-white'
              }`}
              title={isReadLater ? 'あとで見るから削除' : 'あとで見るに追加'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
              </svg>
            </button>
            
            {/* ブックマークボタン */}
            <button
              onClick={toggleBookmark}
              className={`p-2.5 rounded-lg transition-colors min-w-[40px] h-[40px] flex items-center justify-center ${
                isBookmarked 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white'
              }`}
              title={isBookmarked ? 'ブックマークから削除' : 'ブックマークに追加'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                <path d={isBookmarked 
                  ? "M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.76,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"
                  : "M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.76,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.76-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z"
                }></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* デスクトップ用画像（右側） */}
      <div className="hidden md:block flex-1 min-w-[120px] max-w-[200px] aspect-video rounded-lg overflow-hidden bg-gray-100">
        <img 
          src={currentImageUrl} 
          alt={title}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default ArticleCard; 