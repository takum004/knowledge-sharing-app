import { useState, useEffect } from 'react';
import { UserManager, User } from '../utils/storage';

/**
 * ユーザーの役割タイプ
 */
export type UserRole = 'admin' | 'user';

/**
 * 認証状態の型定義
 */
interface AuthState {
  isLoggedIn: boolean;
  userRole: UserRole | null;
  userId: string | null;
  user: User | null;
}

/**
 * 認証フック
 * ユーザー認証状態とユーザー情報を管理
 * 
 * @example
 * const { isLoggedIn, userRole, userId, user, login, logout } = useAuth();
 * 
 * 入力: なし
 * 出力: 認証状態とメソッド（ログイン状態、ユーザー役割、ユーザーID、ユーザー情報、ログイン、ログアウト）
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    userRole: null,
    userId: null,
    user: null
  });

  /**
   * 認証状態をローカルストレージから復元
   */
  useEffect(() => {
    const savedUserId = localStorage.getItem('current_user_id');
    const savedLoginTime = localStorage.getItem('login_time');
    
    if (savedUserId && savedLoginTime) {
      const loginTime = parseInt(savedLoginTime);
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      // 24時間以内かチェック
      if (now - loginTime < twentyFourHours) {
        const user = UserManager.getById(savedUserId);
        if (user) {
          setAuthState({
            isLoggedIn: true,
            userRole: user.role,
            userId: user.id,
            user
          });
          return;
        }
      }
      
      // 期限切れまたはユーザーが見つからない場合はクリア
      localStorage.removeItem('current_user_id');
      localStorage.removeItem('login_time');
    }

    // デフォルト管理者を初期化
    UserManager.initializeDefaultAdmin();
  }, []);

  /**
   * ログイン処理
   */
  const login = (username: string, password: string): boolean => {
    try {
      const user = UserManager.authenticate(username, password);
      
      if (user) {
        setAuthState({
          isLoggedIn: true,
          userRole: user.role,
          userId: user.id,
          user
        });
        
        // ローカルストレージに保存
        localStorage.setItem('current_user_id', user.id);
        localStorage.setItem('login_time', Date.now().toString());
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('ログインエラー:', error);
      return false;
    }
  };

  /**
   * ユーザー登録処理
   */
  const register = (username: string, password: string, displayName?: string): boolean => {
    try {
      const user = UserManager.register(username, password, 'user', displayName);
      
      setAuthState({
        isLoggedIn: true,
        userRole: user.role,
        userId: user.id,
        user
      });
      
      // ローカルストレージに保存
      localStorage.setItem('current_user_id', user.id);
      localStorage.setItem('login_time', Date.now().toString());
      
      console.log('ユーザー登録成功:', { username, displayName: user.displayName });
      return true;
    } catch (error: any) {
      console.error('登録エラー:', error);
      // エラーメッセージをより詳細に
      if (error.message) {
        console.error('エラー詳細:', error.message);
      }
      return false;
    }
  };

  /**
   * ログアウト処理
   */
  const logout = () => {
    setAuthState({
      isLoggedIn: false,
      userRole: null,
      userId: null,
      user: null
    });
    
    // ローカルストレージをクリア
    localStorage.removeItem('current_user_id');
    localStorage.removeItem('login_time');
  };

  return {
    isLoggedIn: authState.isLoggedIn,
    userRole: authState.userRole,
    userId: authState.userId,
    user: authState.user,
    isAdmin: authState.userRole === 'admin',
    login,
    register,
    logout
  };
}; 