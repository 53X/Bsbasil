import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { isEmail } from '@/lib/restock-messages';
import { peekPendingNotify, savePendingNotify, takePendingNotify } from '@/lib/pending-notify';

const CONFIRMED = 'You will be notified once the product is back in stock.';

function accountEmail(email: string | undefined): string | null {
  const value = email?.trim().toLowerCase() ?? '';
  return isEmail(value) ? value : null;
}

export default function NotifyMe({
  handle,
  variantId,
  selection,
}: {
  handle: string;
  variantId: string;
  selection: string;
}) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const requestAlert = async (email: string) => {
    setBusy(true);
    try {
      const response = await fetch('/api/restock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, variantId, selection, email }),
      });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (response.ok) {
        setNotice(CONFIRMED);
        return;
      }
      setNotice(payload.error || 'Could not save this request.');
    } catch {
      setNotice('Could not save this request.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!ready || !user) return;
    const pending = peekPendingNotify();
    if (!pending || pending.handle !== handle) return;
    const email = accountEmail(user.email);
    if (!email) return;
    takePendingNotify();
    void requestAlert(email);
    // Resume a notify click that waited on sign-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, ready, user]);

  const onClick = () => {
    if (!ready || busy) return;
    const path = window.location.pathname;
    const email = accountEmail(user?.email);
    if (!user || !email) {
      savePendingNotify({ handle, variantId, selection, path });
      navigate(`/sign-in?next=${encodeURIComponent(path)}`);
      return;
    }
    void requestAlert(email);
  };

  return (
    <div className="mb-base">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 px-xl py-sm rounded-full font-semibold border disabled:opacity-60"
        style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--brand-ink))' }}
      >
        <Bell size={16} aria-hidden="true" />
        Notify me
      </button>
      {notice ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(20, 40, 30, 0.35)' }}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notify-confirm"
            className="w-full max-w-sm rounded-2xl p-5 shadow-lg"
            style={{ background: 'hsl(var(--background))' }}
          >
            <p id="notify-confirm" className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{notice}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              className="mt-4 w-full py-2.5 rounded-full font-semibold"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
