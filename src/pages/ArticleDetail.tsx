import React, { useState, useEffect } from 'react';
import { ArticleManager, BookmarkManager, ReadLaterManager, LikesManager, ViewsManager, Article } from '../utils/storage';
import { parseBacklogWiki } from '../utils/backlogWikiParser';

/**
 * 記事詳細ページのプロパティ
 */
interface ArticleDetailProps {
  /** 記事ID（URLパラメータから取得） */
  articleId?: number;
  /** ユーザーID */
  userId: string;
  /** 戻るボタンのハンドラー */
  onBack?: () => void;
}

/**
 * 記事詳細ページコンポーネント
 * 
 * @example
 * <ArticleDetail articleId={1} userId="user123" onBack={() => console.log('戻る')} />
 * 
 * 入力: ArticleDetailProps（記事ID、ユーザーID、戻るハンドラー）
 * 出力: 記事詳細ページ（タイトル、画像、本文、ブックマーク機能）
 */
const ArticleDetail: React.FC<ArticleDetailProps> = ({ articleId = 1, userId, onBack }) => {
  // 記事データ状態管理
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ブックマーク状態管理
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isReadLater, setIsReadLater] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  /**
   * 記事データを読み込む
   */
  useEffect(() => {
    const loadArticle = () => {
      try {
        setLoading(true);
        const articleData = ArticleManager.getById(articleId);
        
        if (articleData) {
          setArticle(articleData);
          // ブックマーク状態を初期化
          setIsBookmarked(BookmarkManager.isBookmarked(articleId, userId));
          setIsReadLater(ReadLaterManager.isInReadLater(articleId, userId));
          setIsLiked(LikesManager.isLiked(articleId, userId));
          
          // いいね数と閲覧数を取得
          setLikeCount(LikesManager.getCount(articleId));
          setViewCount(ViewsManager.getCount(articleId));
          
          // 閲覧記録を追加（24時間以内の重複は除外）
          ViewsManager.addView(articleId, userId);
          // 閲覧数を更新（新しい閲覧が追加された可能性があるため）
          setViewCount(ViewsManager.getCount(articleId));
          setError(null);
        } else {
          setError('記事が見つかりませんでした');
        }
      } catch (err) {
        console.error('記事の読み込みエラー:', err);
        setError('記事の読み込み中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId, userId]);

  /**
   * ブックマーク状態を切り替える
   */
  const toggleBookmark = () => {
    try {
      if (isBookmarked) {
        BookmarkManager.remove(articleId, userId);
        setIsBookmarked(false);
        console.log('ブックマークを削除しました');
      } else {
        BookmarkManager.add(articleId, userId);
        setIsBookmarked(true);
        console.log('ブックマークに追加しました');
      }
    } catch (error) {
      console.error('ブックマーク操作エラー:', error);
    }
  };

  /**
   * あとで見る状態を切り替える
   */
  const toggleReadLater = () => {
    try {
      if (isReadLater) {
        ReadLaterManager.remove(articleId, userId);
        setIsReadLater(false);
        console.log('あとで見るから削除しました');
      } else {
        ReadLaterManager.add(articleId, userId);
        setIsReadLater(true);
        console.log('あとで見るに追加しました');
      }
    } catch (error) {
      console.error('あとで見る操作エラー:', error);
    }
  };

  /**
   * いいね状態を切り替える
   */
  const toggleLike = () => {
    const newIsLiked = LikesManager.toggle(articleId, userId);
    setIsLiked(newIsLiked);
    setLikeCount(LikesManager.getCount(articleId));
    
    console.log(newIsLiked ? 'いいねしました' : 'いいねを取り消しました');
  };

  /**
   * シェア機能
   */
  const handleShare = () => {
    if (article) {
      // Web Share APIを使用（対応ブラウザの場合）
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.description,
          url: window.location.href,
        }).catch(console.error);
      } else {
        // フォールバック: URLをクリップボードにコピー
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('記事のURLをクリップボードにコピーしました');
        }).catch(() => {
          console.log('記事をシェアしました');
        });
      }
    }
  };

  /**
   * Backlog Wiki記法でコンテンツをHTMLに変換
   * 
   * @example
   * formatContent("||見出し||値||\n|データ1|データ2|")
   * 
   * 入力: Backlog Wiki記法のテキスト
   * 出力: HTMLに変換された文字列
   */
  const formatContent = (content: string): string => {
    if (!content) return '';
    return parseBacklogWiki(content);
  };

  // ローディング状態
  if (loading) {
    return (
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-[#49739c]">記事を読み込み中...</div>
          </div>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error || !article) {
    return (
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          {onBack && (
            <div className="px-4 py-2">
              <button 
                onClick={onBack}
                className="flex items-center gap-2 text-[#49739c] hover:text-[#0d141c] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                </svg>
                戻る
              </button>
            </div>
          )}
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-[#49739c] text-lg mb-4">{error || '記事が見つかりませんでした'}</p>
              {onBack && (
                <button 
                  onClick={onBack}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  一覧に戻る
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        
        {/* 戻るボタン */}
        {onBack && (
          <div className="px-4 py-2">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-[#49739c] hover:text-[#0d141c] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
              </svg>
              戻る
            </button>
          </div>
        )}
        
        {/* 記事ヘッダー */}
        <div className="article-header">
          <h1 className="text-[#0d141c] tracking-light text-[28px] font-bold leading-tight px-4 text-left pb-3 pt-5">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 px-4 pb-3 pt-1">
            <p className="text-[#49739c] text-sm font-normal leading-normal">
              {article.publishedAt}
            </p>
            <span className="inline-block bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
              {article.category}
            </span>
            {article.author && (
              <p className="text-[#49739c] text-sm font-normal leading-normal">
                著者: {article.author}
              </p>
            )}
          </div>
          
          {/* 記事説明 */}
          {article.description && (
            <div className="px-4 pb-4">
              <p className="text-[#49739c] text-base leading-normal">
                {article.description}
              </p>
            </div>
          )}
        </div>
        
        {/* 記事メイン画像 */}
        <div className="flex w-full grow bg-slate-50 py-3">
          <div className="w-full gap-1 overflow-hidden bg-slate-50 aspect-[3/2] flex">
            <div 
              className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-lg flex-1"
              style={{
                backgroundImage: `url("${article.imageUrl}")`
              }}
            ></div>
          </div>
        </div>
        
        {/* 記事本文 */}
        <div className="article-content py-4">
          {article.content ? (
            <div 
              className="backlog-preview px-4"
              dangerouslySetInnerHTML={{ __html: formatContent(article.content) }}
            />
          ) : (
            <p className="text-[#49739c] text-base leading-normal px-4">
              記事の本文がありません。
            </p>
          )}
        </div>
        
        {/* 記事アクション */}
        <div className="flex items-center justify-between px-4 py-6 border-t border-[#e7edf4]">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked 
                  ? 'bg-red-500 text-white' 
                  : 'bg-[#e7edf4] hover:bg-red-500 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d={isLiked 
                  ? "M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32Z"
                  : "M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.69,146.26,196.16,128,206.8Z"
                }></path>
              </svg>
              いいね ({likeCount})
            </button>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e7edf4] hover:bg-primary hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M237.66,117.66l-80,80A8,8,0,0,1,144,192V152H64a8,8,0,0,1,0-16h80V96a8,8,0,0,1,13.66-5.66l80,80A8,8,0,0,1,237.66,117.66Z"></path>
              </svg>
              シェア
            </button>
            
            {/* 統計情報 */}
            <div className="flex items-center gap-4 text-sm text-[#49739c]">
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                </svg>
                <span>{viewCount.toLocaleString()} 閲覧</span>
              </div>
              {article.readTime && (
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                  </svg>
                  <span>{article.readTime} 分で読めます</span>
                </div>
              )}
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68A16,16,0,0,0,243.31,136Zm-96,96L48,132.69V48h84.69L232,147.31ZM96,84A12,12,0,1,1,84,72,12,12,0,0,1,96,84Z"></path>
                  </svg>
                  <span>{article.tags.slice(0, 2).map(tag => `#${tag}`).join(' ')}</span>
                  {article.tags.length > 2 && <span>...</span>}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleReadLater}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isReadLater 
                  ? 'bg-orange-500 text-white' 
                  : 'border border-[#e7edf4] hover:bg-orange-500 hover:text-white hover:border-orange-500'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
              </svg>
              {isReadLater ? 'あとで見る済み' : 'あとで見る'}
            </button>
            
            <button 
              onClick={toggleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-primary text-white' 
                  : 'border border-[#e7edf4] hover:bg-primary hover:text-white hover:border-primary'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                <path d={isBookmarked 
                  ? "M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.76,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Z"
                  : "M184,32H72A16,16,0,0,0,56,48V224a8,8,0,0,0,12.24,6.78L128,193.43l59.76,37.35A8,8,0,0,0,200,224V48A16,16,0,0,0,184,32Zm0,177.57-51.76-32.35a8,8,0,0,0-8.48,0L72,209.57V48H184Z"
                }></path>
              </svg>
              {isBookmarked ? 'ブックマーク済み' : 'ブックマーク'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail; 