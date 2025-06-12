import React, { useState } from 'react';
import { UserManager } from '../utils/storage';

/**
 * ログイン画面のプロパティ
 */
interface AdminLoginProps {
  /** ログイン成功時のコールバック */
  onLoginSuccess?: (username: string, password: string, isRegister?: boolean, displayName?: string) => boolean;
}

/**
 * ログイン・登録画面コンポーネント
 * 管理者ログイン、ユーザーログイン、新規ユーザー登録機能を提供
 * 
 * @example
 * <AdminLogin onLoginSuccess={(username, password, isRegister) => handleAuth(username, password, isRegister)} />
 * 
 * 入力: AdminLoginProps（ログイン成功コールバック）
 * 出力: ログイン・登録フォーム
 */
const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /**
   * ログイン処理
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('ユーザー名とパスワードを入力してください');
      setSuccess('');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // 認証処理をシミュレート
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // UserManagerで認証
      const user = UserManager.authenticate(username, password);
      
      if (user) {
        if (onLoginSuccess) {
          const loginSuccess = onLoginSuccess(username, password, false);
          if (!loginSuccess) {
            setError('ログイン処理に失敗しました');
          } else {
            setSuccess('ログインしました');
          }
        }
      } else {
        setError('ユーザー名またはパスワードが正しくありません');
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      setError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * ユーザー登録処理
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('ユーザー名とパスワードを入力してください');
      setSuccess('');
      return;
    }

    if (username.length < 3) {
      setError('ユーザー名は3文字以上で入力してください');
      setSuccess('');
      return;
    }

    if (password.length < 4) {
      setError('パスワードは4文字以上で入力してください');
      setSuccess('');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // 登録処理をシミュレート
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('登録処理開始:', { username, displayName: displayName || username });
      
      // onLoginSuccess で登録処理を実行（displayNameも渡す）
      if (onLoginSuccess) {
        const registerSuccess = onLoginSuccess(username, password, true, displayName || username);
        if (!registerSuccess) {
          setError('登録処理に失敗しました。既に同じユーザー名が存在する可能性があります。');
        } else {
          setSuccess('アカウントが正常に作成され、ログインしました！');
        }
      }
    } catch (error: any) {
      console.error('登録エラー:', error);
      setError(error.message || '登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * モード切り替え
   */
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setDisplayName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#0d141c]">Bloggr</h1>
          </div>
          <h2 className="text-xl font-semibold text-[#0d141c] mb-2">
            {mode === 'login' ? 'ログイン' : '新規登録'}
          </h2>
          <p className="text-[#49739c] text-sm">
            {mode === 'login' 
              ? 'アカウントにログインしてください' 
              : '新しいアカウントを作成してください'
            }
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-red-500">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* 成功メッセージ */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
              </svg>
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
          
          {/* ユーザー名入力 */}
          <div>
            <label className="block text-sm font-medium text-[#0d141c] mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={mode === 'register' ? '3文字以上の英数字' : 'ユーザー名を入力'}
              className="w-full px-4 py-3 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
            {mode === 'register' && (
              <p className="text-xs text-[#49739c] mt-1">
                英数字で3文字以上入力してください
              </p>
            )}
          </div>

          {/* 表示名入力（登録時のみ） */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                表示名（任意）
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="表示名を入力"
                className="w-full px-4 py-3 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isLoading}
              />
            </div>
          )}

          {/* パスワード入力 */}
          <div>
            <label className="block text-sm font-medium text-[#0d141c] mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? '4文字以上のパスワード' : 'パスワードを入力'}
              className="w-full px-4 py-3 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isLoading}
            />
            {mode === 'register' && (
              <p className="text-xs text-[#49739c] mt-1">
                4文字以上のパスワードを入力してください
              </p>
            )}
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'login' ? 'ログイン中...' : '登録中...'}
              </>
            ) : (
              mode === 'login' ? 'ログイン' : '新規登録'
            )}
          </button>
        </form>

        {/* モード切り替え */}
        <div className="mt-6 text-center">
          <p className="text-[#49739c] text-sm">
            {mode === 'login' ? 'アカウントをお持ちでない方は' : '既にアカウントをお持ちの方は'}
            <button
              onClick={toggleMode}
              className="text-primary font-medium hover:underline ml-1"
              disabled={isLoading}
            >
              {mode === 'login' ? '新規登録' : 'ログイン'}
            </button>
          </p>
        </div>

        {/* 管理者ログインの案内 */}
        {mode === 'login' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">管理者の方へ</h3>
            <p className="text-xs text-blue-700 mb-2">
              管理者アカウント：<br />
              ユーザー名: <code className="bg-blue-100 px-1 rounded">admin</code><br />
              パスワード: <code className="bg-blue-100 px-1 rounded">admin123</code>
            </p>
          </div>
        )}

        {/* 新規登録の案内 */}
        {mode === 'register' && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="text-sm font-medium text-green-900 mb-2">新規ユーザー登録について</h3>
            <p className="text-xs text-green-700">
              • ユーザー名は3文字以上で、他の人が使用していない名前を選んでください<br />
              • パスワードは4文字以上で設定してください<br />
              • 表示名は任意で、他のユーザーに表示される名前です
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin; 