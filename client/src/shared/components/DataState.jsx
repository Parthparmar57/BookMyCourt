import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 py-10 text-slate-400 text-sm">
    <Loader2 className="w-4 h-4 animate-spin" />
    {label}
  </div>
);

export const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
    <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold">
      <AlertCircle className="w-4 h-4" />
      {message}
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl px-4 py-2 transition-colors"
      >
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ message = 'Nothing here yet.' }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400 text-sm">
    <Inbox className="w-5 h-5" />
    {message}
  </div>
);

/**
 * Standardized wrapper around a React Query result.
 *
 *   <QueryState query={membersQuery} emptyWhen={(d) => !d?.items?.length}>
 *     {(data) => <Table rows={data.items} />}
 *   </QueryState>
 *
 * `children` may be a render function (receives data) or plain nodes.
 */
export const QueryState = ({ query, children, loading, empty, emptyWhen }) => {
  if (query.isLoading) return loading ?? <Spinner />;
  if (query.isError) return <ErrorState message={query.error?.message} onRetry={query.refetch} />;
  if (emptyWhen && emptyWhen(query.data)) return empty ?? <EmptyState />;
  return typeof children === 'function' ? children(query.data) : children;
};

export default QueryState;
