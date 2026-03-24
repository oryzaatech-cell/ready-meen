import { useState, useEffect, useMemo, useCallback } from 'react';
import { Copy, Share2, Check, Settings, LogOut, ChevronUp, ClipboardList, IndianRupee, Hash, MapPin, Store } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PageLayout from '../../components/layout/PageLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import formatCurrency from '../../shared/formatCurrency';
import InstallBanner from '../../components/InstallBanner';

export default function VendorDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', shop_name: '', location: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const { get } = useApi();
  const { user, signOut, saveProfile } = useAuth();

  const vendorCode = user?.vendor_code;
  const customerAppUrl =
    import.meta.env.VITE_CUSTOMER_APP_URL ||
    (window.location.port ? window.location.origin.replace(/:\d+/, ':3000') : 'http://localhost:3000');
  const inviteLink = vendorCode ? `${customerAppUrl}/join/${vendorCode}` : '';
  const commissionRate = Number(user?.commission_rate) || 0;

  const loadData = useCallback(async () => {
    try {
      const ordersRes = await get('/orders?limit=100');
      setOrders(ordersRes.orders || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        shop_name: user.shop_name || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const { PullIndicator } = usePullToRefresh(loadData);

  const { todayOrderCount, todayEarnings } = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let count = 0;
    let earnings = 0;
    for (const o of orders) {
      if (!o.created_at) continue;
      if (o.created_at.slice(0, 10) === todayStr) {
        count++;
        if (o.status === 'delivered') earnings += Number(o.total_amt) || 0;
      }
    }
    return { todayOrderCount: count, todayEarnings: earnings };
  }, [orders]);

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyCode() { await copyToClipboard(vendorCode); }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join my store on Ready Meen', text: `Use my code ${vendorCode} to order fresh fish!`, url: inviteLink });
      } catch { /* cancelled */ }
    } else {
      await copyToClipboard(inviteLink);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    setSaveMsg('');
    try {
      await saveProfile({ name: profileForm.name, shop_name: profileForm.shop_name, location: profileForm.location });
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err) {
      setSaveMsg(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <PageLayout><DashboardSkeleton /></PageLayout>;
  }

  const displayName = user?.shop_name || user?.name || 'Vendor';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <PageLayout>
      {/* Greeting Header */}
      <div className="flex items-center justify-between mb-6 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
            <span className="text-white text-sm font-bold">{initials}</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-surface-900 leading-tight">{displayName}</h1>
            <p className="text-[11px] text-surface-400 mt-0.5">Welcome back</p>
          </div>
        </div>
        <button
          onClick={() => setProfileOpen(v => !v)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
            profileOpen
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25 rotate-180'
              : 'bg-white/80 text-surface-400 hover:text-surface-600 shadow-sm ring-1 ring-surface-100/80 hover:ring-surface-200'
          }`}
        >
          {profileOpen ? <ChevronUp size={18} /> : <Settings size={17} />}
        </button>
      </div>

      <PullIndicator />

      {/* Share Code Card — Hero */}
      {vendorCode && (
        <div className="animate-slide-up stagger-1 mb-6">
          <div className="relative overflow-hidden rounded-2xl noise-overlay" style={{ background: 'linear-gradient(135deg, #121820 0%, #0d534f 50%, #003332 100%)' }}>
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/15 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-primary-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary-300/8 rounded-full blur-2xl" />

            <div className="relative p-5 md:p-6">
              <p className="text-[11px] text-primary-300/80 font-semibold mb-4 text-center uppercase tracking-wider">
                Your Invite Code · കസ്റ്റമേഴ്‌സിന് ഷെയർ ചെയ്യൂ
              </p>

              {/* Code display */}
              <div className="relative bg-white/[0.07] backdrop-blur-sm rounded-2xl px-6 py-5 text-center ring-1 ring-white/[0.08] mb-5">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
                <span className="font-mono text-3xl md:text-4xl font-bold tracking-[0.35em] text-white select-all vendor-code relative">
                  {vendorCode}
                </span>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/[0.08] ring-1 ring-white/[0.08] hover:bg-white/[0.15] active:bg-white/[0.2] transition-all text-sm font-semibold text-white/90 active:scale-[0.98]"
                >
                  {copied ? (
                    <><Check size={16} className="text-primary-300" /><span className="text-primary-300">Copied!</span></>
                  ) : (
                    <><Copy size={15} className="text-white/60" />Copy Code</>
                  )}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-500/40 active:scale-[0.98] transition-all text-sm font-semibold"
                >
                  <Share2 size={15} />
                  Share Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Today's Summary */}
      <div className="animate-slide-up stagger-2 mb-6">
        <h2 className="text-[11px] font-bold text-surface-400 mb-3 uppercase tracking-wider">
          Today · ഇന്നത്തെ സംഗ്രഹം
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 stat-shine" glow={todayOrderCount > 0}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center ring-1 ring-blue-100">
                <ClipboardList size={15} className="text-blue-600" />
              </div>
              <span className="text-[11px] font-semibold text-surface-400">Orders</span>
            </div>
            <p className="text-3xl font-extrabold text-surface-900 tracking-tight leading-none">{todayOrderCount}</p>
            <p className="text-[10px] text-surface-400 mt-1">ഇന്നത്തെ ഓർഡറുകൾ</p>
          </Card>
          <Card className="p-4 stat-shine" glow={todayEarnings > 0}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-100">
                <IndianRupee size={15} className="text-emerald-600" />
              </div>
              <span className="text-[11px] font-semibold text-surface-400">Earnings</span>
            </div>
            <p className="text-3xl font-extrabold text-surface-900 tracking-tight leading-none">{formatCurrency(todayEarnings)}</p>
            <p className="text-[10px] text-surface-400 mt-1">വരുമാനം</p>
          </Card>
        </div>
      </div>

      {/* Profile Section (collapsible) */}
      {profileOpen && (
        <div className="animate-slide-up mb-6">
          <Card className="overflow-hidden">
            {/* Profile banner */}
            <div className="relative h-16 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 noise-overlay">
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>

            <div className="px-5 pb-5">
              {/* Avatar overlapping banner */}
              <div className="-mt-6 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 ring-3 ring-white">
                  <Store size={20} className="text-white" />
                </div>
              </div>

              <h2 className="font-bold text-surface-900 mb-4">Profile · പ്രൊഫൈൽ</h2>

              <div className="space-y-3">
                <Input label="Name" value={profileForm.name} onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
                <Input label="Shop Name" value={profileForm.shop_name} onChange={(e) => setProfileForm(f => ({ ...f, shop_name: e.target.value }))} placeholder="Your shop name" />
                <Input label="Location" value={profileForm.location} onChange={(e) => setProfileForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Fort Kochi" />
              </div>

              {/* Info badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {vendorCode && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-semibold ring-1 ring-primary-100">
                    <Hash size={11} /><span className="font-mono tracking-wider">{vendorCode}</span>
                  </span>
                )}
                {user?.location && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-50 text-surface-600 text-xs font-medium ring-1 ring-surface-100">
                    <MapPin size={11} />{user.location}
                  </span>
                )}
                {commissionRate > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-medium ring-1 ring-amber-100">
                    {commissionRate}% fee
                  </span>
                )}
              </div>

              {saveMsg && (
                <p className={`text-xs font-semibold mt-3 ${saveMsg === 'Saved!' ? 'text-primary-600' : 'text-red-600'}`}>{saveMsg}</p>
              )}

              <div className="mt-4 space-y-2.5">
                <Button onClick={handleSaveProfile} loading={saving} className="w-full">Save Profile</Button>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-[0.98]"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* PWA Install Banner */}
      <InstallBanner />
    </PageLayout>
  );
}
