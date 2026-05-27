import { useState } from 'react';
import { useAdminUsers, useToggleBanUser } from '../../hooks/useAdmin';
import { useDebounce } from '../../hooks/useDebounce';
import { TableSkeleton, EmptyState, ErrorState, Pagination } from '../../components/admin/AdminTable';
import { formatTimeAgo } from '../../utils/formatTimeAgo';

const LIMIT = 20;

export default function AdminUsersPage() {
  const [page,   setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError, refetch } = useAdminUsers({
    page,
    limit: LIMIT,
    search: debouncedSearch,
  });

  const toggleBan = useToggleBanUser();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleToggleBan = (user) => {
    const action = user.isBanned ? 'Unban' : 'Ban';
    const msg    = user.isBanned
      ? `Unban ${user.name}? They will be able to log in again.`
      : `Ban ${user.name}? They will not be able to log in.`;
    if (!window.confirm(msg)) return;
    toggleBan.mutate(user._id);
  };

  const users      = data?.users ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Users</h1>
        {data?.total != null && (
          <span className="text-sm text-gray-500">{data.total.toLocaleString()} total</span>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isError ? (
          <div className="p-6">
            <ErrorState message="Failed to load users." onRetry={refetch} />
          </div>
        ) : isLoading ? (
          <div className="p-4">
            <TableSkeleton cols={7} rows={5} />
          </div>
        ) : users.length === 0 ? (
          <EmptyState message={search ? 'No users match your search.' : 'No users yet.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Campus ID', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[140px] truncate">
                      {user.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {user.campusId ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Student'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatTimeAgo(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.isBanned
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleBan(user)}
                          disabled={toggleBan.isPending}
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
                            user.isBanned
                              ? 'border-green-200 text-green-700 hover:bg-green-50'
                              : 'border-red-200 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {user.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && users.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPrev={() => setPage(p => Math.max(1, p - 1))}
              onNext={() => setPage(p => Math.min(totalPages, p + 1))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
