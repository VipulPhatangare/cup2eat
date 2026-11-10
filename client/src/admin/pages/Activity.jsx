import { useState } from 'react';
import { adm } from '../api';
import { Card, Empty, ErrorBox, PageTitle, Pager, Spinner, fmtDate, useLoad } from '../ui';
import { actionLabel } from './Dashboard';

export default function Activity() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useLoad(() => adm.get(`/activity?page=${page}`), [page]);

  return (
    <>
      <PageTitle title="Activity" subtitle="Who changed what, and when." />
      {loading && !data ? <Spinner /> : error ? <ErrorBox error={error} onRetry={reload} /> : data.items.length === 0 ? <Empty title="No activity yet" /> : (
        <Card className="!p-0">
          <ul className="divide-y divide-forest/10">
            {data.items.map((a) => (
              <li key={a._id} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 py-3.5 text-sm">
                <p><span className="font-semibold">{actionLabel(a.action)}</span>{a.target ? ` · ${a.target}` : ''}{a.detail ? <span className="text-choco/60"> ({a.detail})</span> : null}</p>
                <p className="text-xs text-choco/55">{a.adminName} · {fmtDate(a.createdAt)}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <Pager page={data?.page || 1} pages={data?.pages || 1} onPage={setPage} />
    </>
  );
}
