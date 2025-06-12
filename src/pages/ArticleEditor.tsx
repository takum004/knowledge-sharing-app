import React, { useState, useEffect } from 'react';
import { ArticleManager, Article } from '../utils/storage';
import { parseBacklogWiki, getWikiTemplates } from '../utils/backlogWikiParser';

/**
 * 記事エディターページのプロパティ
 */
interface ArticleEditorProps {
  /** 編集モード（新規作成 or 編集） */
  mode?: 'create' | 'edit';
  /** 編集する記事のID（編集モードの場合） */
  articleId?: number;
  /** 保存完了ハンドラー */
  onSave?: () => void;
}

/**
 * 記事作成・編集ページコンポーネント
 * 
 * @example
 * <ArticleEditor mode="create" onSave={() => console.log('保存完了')} />
 * <ArticleEditor mode="edit" articleId={1} onSave={() => console.log('保存完了')} />
 * 
 * 入力: ArticleEditorProps（モード、記事ID、保存ハンドラー）
 * 出力: 記事エディターページ（タイトル、カテゴリ、タグ、本文入力、画像アップロード）
 */
const ArticleEditor: React.FC<ArticleEditorProps> = ({ mode = 'create', articleId, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [author, setAuthor] = useState('');
  const [readTime, setReadTime] = useState<number>(5);
  const [publishedAt, setPublishedAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const categories = [
    'AI・機械学習',
    'テクノロジー',
    '心理学',
    'プログラミング',
    'データサイエンス',
    'デザイン',
    'ビジネス',
    'その他'
  ];

  /**
   * 編集モードの場合、記事データを読み込む
   */
  useEffect(() => {
    if (mode === 'edit' && articleId) {
      setIsLoading(true);
      try {
        const article = ArticleManager.getById(articleId);
        if (article) {
          setTitle(article.title);
          setDescription(article.description);
          setCategory(article.category);
          setTags(article.tags || []);
          setContent(article.content || '');
          setImageUrl(article.imageUrl);
          // 既存の画像URLがある場合、プレビューとして設定
          if (article.imageUrl) {
            setImagePreview(article.imageUrl);
          }
          setAuthor(article.author || '');
          setReadTime(article.readTime || 5);
          setPublishedAt(article.publishedAt || new Date().toISOString().split('T')[0]);
        }
      } catch (error) {
        console.error('記事の読み込みに失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [mode, articleId]);

  /**
   * 読了時間を自動計算（文字数ベース）
   */
  useEffect(() => {
    if (content) {
      // 日本語の場合、1分間に約400文字読めると仮定
      const estimatedTime = Math.max(1, Math.ceil(content.length / 400));
      setReadTime(estimatedTime);
    }
  }, [content]);

  /**
   * タグを追加する
   */
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  /**
   * タグを削除する
   */
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  /**
   * Enterキーでタグを追加
   */
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  /**
   * フォームのバリデーション
   */
  const validateForm = (): boolean => {
    if (!title.trim()) {
      alert('タイトルを入力してください。');
      return false;
    }
    if (!description.trim()) {
      alert('記事の説明を入力してください。');
      return false;
    }
    if (!category) {
      alert('カテゴリを選択してください。');
      return false;
    }
    if (!content.trim()) {
      alert('記事の本文を入力してください。');
      return false;
    }
    if (!imageUrl.trim()) {
      alert('メイン画像をアップロードしてください。');
      return false;
    }
    return true;
  };

  /**
   * 下書き保存
   */
  const saveDraft = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const articleData: Omit<Article, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        category,
        tags,
        author: author.trim() || 'Anonymous',
        publishedAt: publishedAt,
        readTime
        // likes と views は削除（動的に管理されるため）
      };

      if (mode === 'edit' && articleId) {
        ArticleManager.update(articleId, articleData);
        alert('記事を更新しました！');
      } else {
        ArticleManager.add(articleData);
        alert('記事を下書き保存しました！');
      }

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('保存に失敗しました:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 記事を公開
   */
  const publishArticle = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      const articleData: Omit<Article, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim(),
        category,
        tags,
        author: author.trim() || 'Anonymous',
        publishedAt: publishedAt,
        readTime
        // likes と views は削除（動的に管理されるため）
      };

      if (mode === 'edit' && articleId) {
        ArticleManager.update(articleId, articleData);
        alert('記事を更新・公開しました！');
      } else {
        ArticleManager.add(articleData);
        alert('記事を公開しました！');
      }

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('公開に失敗しました:', error);
      alert('公開に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 画像ファイルの選択処理
   * 
   * @example
   * handleImageUpload(event)
   * 
   * 入力: ファイル選択イベント
   * 出力: 画像プレビューとBase64データの設定
   */
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    processImageFile(file);
  };

  /**
   * ドラッグ&ドロップでの画像アップロード処理
   * 
   * @example
   * handleDrop(event)
   * 
   * 入力: ドロップイベント
   * 出力: 画像プレビューとBase64データの設定
   */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    processImageFile(file);
  };

  /**
   * ドラッグオーバー時の処理
   */
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  /**
   * 画像ファイルの処理（共通関数）
   * 
   * @example
   * processImageFile(file)
   * 
   * 入力: ファイルオブジェクト
   * 出力: 画像プレビューとBase64データの設定
   */
  const processImageFile = (file: File) => {
    // ファイルタイプの検証
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    // ファイルサイズの検証（5MB制限）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('ファイルサイズが大きすぎます。5MB以下の画像を選択してください。');
      return;
    }

    setIsProcessingImage(true);
    setSelectedFile(file);

    // FileReaderでファイルを読み込み、Base64に変換
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      setImageUrl(result); // Base64データをimageUrlとして保存
      setIsProcessingImage(false);
    };
    reader.onerror = () => {
      alert('画像の読み込みに失敗しました。');
      setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  /**
   * ファイル選択ダイアログを開く
   */
  const openFileDialog = () => {
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  /**
   * 画像を削除する
   * 
   * @example
   * removeImage()
   * 
   * 入力: なし
   * 出力: 画像関連の状態をリセット
   */
  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setImageUrl('');
  };

  /**
   * テンプレート挿入機能
   * 
   * @example
   * insertTemplate('table')
   * 
   * 入力: テンプレート種類（'table', 'codeBlock', 'inlineCode', 'combined'）
   * 出力: テキストエリアにテンプレートが挿入される
   */
  const insertTemplate = (templateType: keyof ReturnType<typeof getWikiTemplates>) => {
    const templates = getWikiTemplates();
    const template = templates[templateType];
    
    // カーソル位置にテンプレートを挿入
    const textarea = document.querySelector('textarea[placeholder*="記事の本文"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = content;
      
      // 前の文字が改行でない場合は改行を追加
      const prefix = start > 0 && currentContent[start - 1] !== '\n' ? '\n\n' : '';
      // 後の文字が改行でない場合は改行を追加
      const suffix = end < currentContent.length && currentContent[end] !== '\n' ? '\n\n' : '';
      
      const newContent = 
        currentContent.substring(0, start) + 
        prefix + template + suffix + 
        currentContent.substring(end);
      
      setContent(newContent);
      
      // カーソル位置を調整
      setTimeout(() => {
        const newPosition = start + prefix.length + template.length + suffix.length;
        textarea.focus();
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  /**
   * プレビュー用のHTMLを生成
   */
  const getPreviewHtml = () => {
    if (!content) return '';
    return parseBacklogWiki(content);
  };

  return (
    <div className="px-4 md:px-8 lg:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        
        {/* ローディング状態 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-[#49739c]">
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              記事を読み込み中...
            </div>
          </div>
        )}
        
        {/* ページヘッダー */}
        <div className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-[24px] md:text-[32px] font-bold text-[#0d141c] mb-2">
                {mode === 'create' ? '新しい記事を作成' : '記事を編集'}
              </h1>
              <p className="text-[#49739c] text-sm">
                記事の内容を入力して、下書き保存または公開してください。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button 
                onClick={saveDraft}
                disabled={isSaving || isLoading}
                className="px-4 md:px-6 py-3 rounded-lg border border-[#e7edf4] text-[#49739c] font-medium hover:bg-[#f8fafc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">保存中...</span>
                    <span className="sm:hidden">保存中</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">{mode === 'edit' ? '更新' : '下書き保存'}</span>
                    <span className="sm:hidden">{mode === 'edit' ? '更新' : '下書き'}</span>
                  </>
                )}
              </button>
              <button 
                onClick={publishArticle}
                disabled={isSaving || isLoading}
                className="bg-primary text-white px-4 md:px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="hidden sm:inline">公開中...</span>
                    <span className="sm:hidden">公開中</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">{mode === 'edit' ? '更新・公開' : '公開する'}</span>
                    <span className="sm:hidden">{mode === 'edit' ? '公開' : '公開'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* エディターフォーム */}
        <div className="p-4 space-y-6">
          
          {/* タイトル入力 */}
          <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
            <label className="block text-sm font-medium text-[#0d141c] mb-2">
              記事タイトル *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="記事のタイトルを入力してください"
              className="w-full px-4 py-3 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
            />
          </div>

          {/* 説明文入力 */}
          <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
            <label className="block text-sm font-medium text-[#0d141c] mb-2">
              記事の説明 *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="記事の概要や要約を入力してください（検索結果やカード表示で使用されます）"
              rows={3}
              className="w-full px-4 py-3 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c] resize-y"
            />
            <div className="mt-2 text-xs text-[#49739c]">
              文字数: {description.length}
            </div>
          </div>

          {/* カテゴリとタグ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* カテゴリ選択 */}
            <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                カテゴリ *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
              >
                <option value="">カテゴリを選択してください</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* タグ入力 */}
            <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                タグ
              </label>
              
              {/* タグ入力エリア */}
              <div className="space-y-3">
                {/* 既存タグ選択 */}
                <div>
                  <label className="block text-xs text-[#49739c] mb-1">既存のタグから選択:</label>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value && !tags.includes(e.target.value)) {
                        setTags([...tags, e.target.value]);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
                  >
                    <option value="">タグを選択してください</option>
                    {ArticleManager.getPopularTags(20).filter(tag => !tags.includes(tag)).map((tag) => (
                      <option key={tag} value={tag}>#{tag}</option>
                    ))}
                  </select>
                </div>
                
                {/* 新規タグ作成 */}
                <div>
                  <label className="block text-xs text-[#49739c] mb-1">新しいタグを作成:</label>
                  <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                      placeholder="新しいタグ名を入力"
                      className="flex-1 px-3 py-2 text-sm border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
                />
                <button
                  onClick={addTag}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                      type="button"
                >
                  追加
                </button>
              </div>
                </div>
                
                {/* 選択されたタグ表示 */}
                {tags.length > 0 && (
                  <div>
                    <label className="block text-xs text-[#49739c] mb-2">選択中のタグ:</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                            className="text-primary hover:text-primary/70 ml-1"
                            type="button"
                            title="タグを削除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
                  </div>
                )}
              </div>
              
              <p className="mt-2 text-xs text-[#49739c]">
                記事に関連するタグを追加してください。検索時に役立ちます。
              </p>
            </div>
          </div>

          {/* 著者、読了時間、投稿日付 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 著者入力 */}
            <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                著者名
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="著者名を入力してください"
                className="w-full px-4 py-3 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
              />
              <p className="mt-2 text-xs text-[#49739c]">
                空白の場合は「Anonymous」として表示されます
              </p>
            </div>

            {/* 読了時間 */}
            <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                読了時間（分）
              </label>
              <input
                type="number"
                value={readTime}
                onChange={(e) => setReadTime(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="120"
                className="w-full px-4 py-3 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
              />
              <p className="mt-2 text-xs text-[#49739c]">
                本文の文字数から自動計算されます
              </p>
            </div>

            {/* 投稿日付 */}
            <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                投稿日付
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-4 py-3 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c]"
              />
              <p className="mt-2 text-xs text-[#49739c]">
                設定しない場合は今日の日付が使用されます
              </p>
            </div>
          </div>

          {/* 画像アップロード */}
          <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
            <label className="block text-sm font-medium text-[#0d141c] mb-2">
              メイン画像アップロード
            </label>
            
            {!imagePreview ? (
              <div 
                className="border-2 border-dashed border-[#e7edf4] rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={openFileDialog}
              >
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-[#49739c]" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="mb-4">
                  <span className="text-primary font-medium hover:text-primary/80">ファイルを選択</span>
                  <span className="text-[#49739c]"> または ドラッグ&ドロップ</span>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isProcessingImage}
                  />
                </div>
                <p className="text-xs text-[#49739c]">
                  PNG、JPG、GIF、WebP形式 • 最大5MB
                </p>
                {isProcessingImage && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-primary">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">処理中...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="アップロード画像プレビュー"
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-[#e7edf4]"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    title="画像を削除"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#49739c]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                  </svg>
                  <span>{selectedFile?.name}</span>
                  <span>({((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button 
                  onClick={openFileDialog}
                  className="text-primary font-medium hover:text-primary/80 text-sm"
                >
                  画像を変更
                </button>
                <input
                  id="image-upload-replace"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isProcessingImage}
                />
              </div>
            )}
          </div>

          {/* 本文入力 */}
          <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
            <label className="block text-sm font-medium text-[#0d141c] mb-2">
              記事本文 *
            </label>
            
            {/* Wiki記法ツールバー */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3 p-3 bg-[#f8fafc] rounded-lg">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">テンプレート挿入:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => insertTemplate('table')}
                  className="px-3 py-1 text-xs bg-white border border-[#e7edf4] rounded-md hover:bg-gray-50 transition-colors"
                  title="テーブルを挿入"
                >
                  📊 表
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('codeBlock')}
                  className="px-3 py-1 text-xs bg-white border border-[#e7edf4] rounded-md hover:bg-gray-50 transition-colors"
                  title="コードブロックを挿入"
                >
                  💻 コード
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('inlineCode')}
                  className="px-3 py-1 text-xs bg-white border border-[#e7edf4] rounded-md hover:bg-gray-50 transition-colors"
                  title="インラインコードを挿入"
                >
                  📝 行内
                </button>
                <button
                  type="button"
                  onClick={() => insertTemplate('combined')}
                  className="px-3 py-1 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  title="サンプル（API仕様書）を挿入"
                >
                  📋 サンプル
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-xs text-[#49739c] leading-relaxed">
                <strong>以下の形式が使用できます：</strong><br/>
                • <code className="break-all">||ヘッダー||</code> <code>|データ|</code> テーブル<br/>
                • <code className="break-all">{'{code:言語}コード{/code}'}</code> コードブロック<br/>
                • <code>&code(コード);</code> インラインコード<br/>
                • <code># ## ###</code> 見出し、<code>- </code> リスト、<code>**太字**</code>
              </p>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`# API仕様書

## エンドポイント一覧

||メソッド||エンドポイント||説明||
|GET|/api/users|ユーザー一覧取得|
|POST|/api/users|ユーザー作成|
|PUT|/api/users/:id|ユーザー更新|

## サンプルコード

{code:javascript}
const response = await fetch('/api/users', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
});
const users = await response.json();
{/code}

実装時は &code(try-catch); を使用してエラーハンドリングを行ってください。`}
              rows={20}
              className="w-full px-4 py-3 border border-[#e7edf4] rounded-b-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-[#0d141c] font-mono text-xs md:text-sm leading-relaxed resize-y"
            />
            <div className="mt-2 text-xs text-[#49739c]">
              文字数: {content.length}
            </div>
          </div>

          {/* プレビューセクション */}
          {content && (
            <div className="bg-white rounded-lg border border-[#e7edf4] p-6">
              <h3 className="text-lg font-bold text-[#0d141c] mb-4">📋 記法プレビュー</h3>
              <div 
                className="backlog-preview border border-gray-200 rounded-lg p-4 min-h-[200px] bg-gray-50"
                dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
              />
              <div className="mt-3 text-xs text-[#49739c]">
                💡 上記が記法に基づいて変換された結果です
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor; 