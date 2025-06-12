import React, { useState, useEffect } from 'react';
import { UserManager, User } from '../utils/storage';

/**
 * ユーザー管理ページのプロパティ
 */
interface UserManagementProps {
  /** 現在のユーザーID（管理者のみアクセス可能） */
  currentUserId?: string;
}

/**
 * ユーザー管理ページコンポーネント
 * 管理者向けのユーザーアカウント管理機能を提供
 * 
 * @example
 * <UserManagement currentUserId="admin123" />
 * 
 * 入力: UserManagementProps（現在のユーザーID）
 * 出力: ユーザー管理ページ（ユーザー一覧、権限変更、削除など）
 */
const UserManagement: React.FC<UserManagementProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');

  /**
   * ユーザーデータを読み込み
   */
  const loadUsers = () => {
    try {
      const allUsers = UserManager.getAll();
      setUsers(allUsers);
    } catch (error) {
      console.error('ユーザーデータの読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * コンポーネントマウント時にユーザーを読み込み
   */
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * ユーザーの権限を変更
   */
  const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
    try {
      const users = UserManager.getAll();
      const userIndex = users.findIndex(user => user.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].role = newRole;
        // 直接ローカルストレージを更新
        localStorage.setItem('knowledge_sharing_users', JSON.stringify(users));
        loadUsers(); // データを再読み込み
        
        console.log(`ユーザー ${userId} の権限を ${newRole} に変更しました`);
      }
    } catch (error) {
      console.error('権限変更エラー:', error);
    }
  };

  /**
   * ユーザー削除の確認ダイアログを表示
   */
  const confirmDeleteUser = (userId: string) => {
    if (userId === currentUserId) {
      alert('自分のアカウントは削除できません');
      return;
    }
    setDeleteUserId(userId);
    setShowDeleteConfirm(true);
  };

  /**
   * ユーザーを削除
   */
  const handleDeleteUser = () => {
    if (!deleteUserId) return;

    try {
      const users = UserManager.getAll();
      const filteredUsers = users.filter(user => user.id !== deleteUserId);
      // 直接ローカルストレージを更新
      localStorage.setItem('knowledge_sharing_users', JSON.stringify(filteredUsers));
      loadUsers(); // データを再読み込み
      
      console.log(`ユーザー ${deleteUserId} を削除しました`);
    } catch (error) {
      console.error('ユーザー削除エラー:', error);
    } finally {
      setShowDeleteConfirm(false);
      setDeleteUserId(null);
    }
  };

  /**
   * フィルタリングされたユーザーリストを取得
   */
  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    });
  };

  /**
   * 役割のバッジスタイルを取得
   */
  const getRoleBadgeStyle = (role: 'admin' | 'user') => {
    return role === 'admin'
      ? 'bg-red-100 text-red-800'
      : 'bg-blue-100 text-blue-800';
  };

  /**
   * 作成日時をフォーマット
   */
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '不明';
    }
  };

  if (loading) {
    return (
      <div className="px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-[#49739c]">ユーザーデータを読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        
        {/* ページヘッダー */}
        <div className="p-4">
          <h1 className="text-[32px] font-bold text-[#0d141c] mb-2">
            ユーザー管理
          </h1>
          <p className="text-[#49739c] text-sm">
            登録されているユーザーアカウントの管理を行えます。
          </p>
        </div>

        {/* 検索・フィルターエリア */}
        <div className="p-4 bg-white rounded-lg border border-[#e7edf4] mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* 検索バー */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                ユーザー検索
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ユーザー名または表示名で検索"
                  className="w-full px-4 py-2 pl-10 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#49739c]">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
            </div>

            {/* 役割フィルター */}
            <div className="md:w-48">
              <label className="block text-sm font-medium text-[#0d141c] mb-2">
                役割でフィルター
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'user')}
                className="w-full px-4 py-2 border border-[#e7edf4] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">すべて</option>
                <option value="admin">管理者</option>
                <option value="user">一般ユーザー</option>
              </select>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mt-4 flex gap-4 text-sm text-[#49739c]">
            <span>総ユーザー数: <strong className="text-[#0d141c]">{users.length}</strong></span>
            <span>管理者: <strong className="text-red-600">{users.filter(u => u.role === 'admin').length}</strong></span>
            <span>一般ユーザー: <strong className="text-blue-600">{users.filter(u => u.role === 'user').length}</strong></span>
          </div>
        </div>

        {/* ユーザー一覧テーブル */}
        <div className="bg-white rounded-lg border border-[#e7edf4] overflow-hidden">
          {filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8f9fa] border-b border-[#e7edf4]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#49739c] uppercase tracking-wider">
                      ユーザー情報
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#49739c] uppercase tracking-wider">
                      役割
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#49739c] uppercase tracking-wider">
                      作成日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#49739c] uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7edf4]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#f8f9fa] transition-colors">
                      
                      {/* ユーザー情報 */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {(user.displayName || user.username).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#0d141c]">
                              {user.displayName || user.username}
                            </div>
                            <div className="text-xs text-[#49739c]">
                              @{user.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 役割 */}
                      <td className="px-6 py-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                          disabled={user.id === currentUserId}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getRoleBadgeStyle(user.role)} ${
                            user.id === currentUserId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                          }`}
                        >
                          <option value="user">一般ユーザー</option>
                          <option value="admin">管理者</option>
                        </select>
                      </td>

                      {/* 作成日時 */}
                      <td className="px-6 py-4 text-sm text-[#49739c]">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* 操作 */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            詳細
                          </button>
                          {user.id !== currentUserId && (
                            <button
                              onClick={() => confirmDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-800 text-sm font-medium ml-2"
                            >
                              削除
                            </button>
                          )}
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
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#0d141c] mb-2">
                {searchTerm || filterRole !== 'all' 
                  ? '該当するユーザーが見つかりません' 
                  : 'ユーザーがまだ登録されていません'
                }
              </h3>
              <p className="text-[#49739c] text-sm">
                {searchTerm || filterRole !== 'all'
                  ? '検索条件を変更して再度お試しください。'
                  : 'ユーザーが登録されると、ここに表示されます。'
                }
              </p>
            </div>
          )}
        </div>

        {/* ユーザー詳細モーダル */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[#0d141c]">ユーザー詳細</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-[#49739c] hover:text-[#0d141c]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    {(selectedUser.displayName || selectedUser.username).charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-[#0d141c]">{selectedUser.displayName || selectedUser.username}</h4>
                  <p className="text-sm text-[#49739c]">@{selectedUser.username}</p>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#49739c]">ユーザーID:</span>
                    <span className="font-mono text-xs">{selectedUser.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#49739c]">役割:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(selectedUser.role)}`}>
                      {selectedUser.role === 'admin' ? '管理者' : '一般ユーザー'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#49739c]">作成日時:</span>
                    <span>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-[#e7edf4] text-[#0d141c] rounded-lg hover:bg-[#cedbe8] transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 削除確認モーダル */}
        {showDeleteConfirm && deleteUserId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="text-red-600">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm-8-80V80a8,8,0,0,1,16,0v56a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,172Z"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0d141c]">ユーザー削除の確認</h3>
                  <p className="text-sm text-[#49739c]">この操作は取り消せません</p>
                </div>
              </div>
              
              <p className="text-[#0d141c] mb-6">
                このユーザーを削除してもよろしいですか？<br />
                削除されたユーザーのデータは完全に失われます。
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-[#e7edf4] text-[#0d141c] rounded-lg hover:bg-[#cedbe8] transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;