'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type KhuVuc = { id: string; name: string };
type PhuongXa = { id: string; name: string; khuVucId: string; khuVuc?: KhuVuc };
type Branch = { id?: string; name: string; phuongXaId: string; diaChi: string | null };
type Tour = {
  id: string;
  brand: string;
  type: string;
  thuongHieu?: CatalogItem;
  linhVuc?: CatalogItem;
  url: string;
  status: string;
  khuVuc: KhuVuc;
  chiNhanhs: (Branch & { phuongXa: PhuongXa })[];
};
type Stats = {
  total: number;
  active: number;
  paused: number;
  byBrand?: { brand: string; count: number }[];
  byLinhVuc?: { type: string; count: number }[];
};
type CatalogItem = { id: string; name: string; linhVucId?: string | null; _count?: { tours: number } };

type IconName = 'home' | 'list' | 'location' | 'menu' | 'close';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    home: 'M3 10.5 12 3l9 7.5M5.5 9v11h13V9M9 20v-6h6v6',
    list: 'M5 6h14M5 12h14M5 18h14M3 6h.01M3 12h.01M3 18h.01',
    location: 'M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z M12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'M6 6l12 12M18 6 6 18',
  };

  return <svg className="menu-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name]} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

const typeLabels: Record<string, string> = {
  RESTAURANT: 'Nhà hàng',
  HOTEL: 'Khách sạn',
  CAFE: 'Quán cà phê',
  SPA: 'Spa',
  BOAT: 'Du thuyền',
  OTHER: 'Khác',
};

interface MenuItem {
  id: string;
  label: string;
  icon: IconName;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: 'home' },
  { id: 'tours', label: 'Danh sách tour', icon: 'list' },
  { id: 'locations', label: 'Khu vực & phường/xã', icon: 'location' },
];
const emptyBranch = (): Branch => ({ name: '', phuongXaId: '', diaChi: '' });

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.message || 'Có lỗi xảy ra');
  return result.data;
}

export default function HomePage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [khuVucs, setKhuVucs] = useState<KhuVuc[]>([]);
  const [phuongXas, setPhuongXas] = useState<PhuongXa[]>([]);
  const [thuongHieus, setThuongHieus] = useState<CatalogItem[]>([]);
  const [formThuongHieus, setFormThuongHieus] = useState<CatalogItem[]>([]);
  const [linhVucs, setLinhVucs] = useState<CatalogItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, paused: 0 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [filterKhuVuc, setFilterKhuVuc] = useState('');
  const [thuongHieuFilter, setThuongHieuFilter] = useState('');
  const [linhVucFilter, setLinhVucFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedKhuVucId, setSelectedKhuVucId] = useState('');
  const [selectedOverviewLinhVucId, setSelectedOverviewLinhVucId] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ brand: '', type: 'RESTAURANT', thuongHieuId: '', linhVucId: '', khuVucId: '', url: '', status: 'Đang hoạt động', chiNhanhs: [emptyBranch()] });
  const selectedOverviewLinhVuc = linhVucs.find((item) => item.id === selectedOverviewLinhVucId);
  const overviewBrands = useMemo(() => {
    if (!selectedOverviewLinhVucId) return [];

    const directBrands = thuongHieus.filter((item) => item.linhVucId === selectedOverviewLinhVucId);
    const directIds = new Set(directBrands.map((item) => item.id));
    const brandsFromTours = tours
      .filter((tour) => tour.linhVuc?.id === selectedOverviewLinhVucId && tour.thuongHieu)
      .map((tour) => tour.thuongHieu as CatalogItem)
      .filter((item) => !directIds.has(item.id));

    return [...directBrands, ...brandsFromTours];
  }, [selectedOverviewLinhVucId, thuongHieus, tours]);

  const selectedLocationId = selectedKhuVucId || khuVucs[0]?.id || '';
  const selectedWards = useMemo(
    () => phuongXas.filter((ward) => ward.khuVucId === selectedLocationId),
    [phuongXas, selectedLocationId],
  );
  const visibleWards = useMemo(
    () => phuongXas.filter((ward) => ward.khuVucId === form.khuVucId),
    [phuongXas, form.khuVucId],
  );

  async function loadFormThuongHieus(linhVucId: string, selectedId = '') {
    if (!linhVucId) {
      setFormThuongHieus([]);
      return;
    }
    try {
      const data = await api<CatalogItem[]>(`/api/thuong-hieu?linhVucId=${encodeURIComponent(linhVucId)}`);
      setFormThuongHieus(data);
      if (selectedId && !data.some((item) => item.id === selectedId)) {
        setForm((current) => ({ ...current, thuongHieuId: '', brand: '' }));
      }
    } catch (err) {
      setFormThuongHieus([]);
      setError(err instanceof Error ? err.message : 'Không thể tải thương hiệu theo lĩnh vực');
    }
  }

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (status) query.set('status', status);
      if (filterKhuVuc) query.set('khuVucId', filterKhuVuc);
      if (thuongHieuFilter) query.set('thuongHieuId', thuongHieuFilter);
      if (linhVucFilter) query.set('linhVucId', linhVucFilter);
      const [tourData, khuVucData, phuongXaData, thuongHieuData, linhVucData, statsData] = await Promise.all([
        api<Tour[]>(`/api/tours?${query}`),
        api<KhuVuc[]>('/api/khu-vuc'),
        api<PhuongXa[]>('/api/phuong-xa'),
        api<CatalogItem[]>('/api/thuong-hieu'),
        api<CatalogItem[]>('/api/linh-vuc'),
        api<Stats>('/api/stats'),
      ]);
      setTours(tourData);
      setKhuVucs(khuVucData);
      setPhuongXas(phuongXaData);
      setThuongHieus(thuongHieuData);
      setLinhVucs(linhVucData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (activeMenu === 'dashboard') void loadData();
  }, [activeMenu, search, status, filterKhuVuc, thuongHieuFilter, linhVucFilter]);

  useEffect(() => { void loadData(); }, [search, status, filterKhuVuc, thuongHieuFilter, linhVucFilter]);

  function openCreate() {
    setEditingId(null);
    const linhVucId = linhVucs[0]?.id ?? '';
    setForm({ brand: '', type: 'RESTAURANT', thuongHieuId: '', linhVucId, khuVucId: khuVucs[0]?.id ?? '', url: '', status: 'Đang hoạt động', chiNhanhs: [emptyBranch()] });
    void loadFormThuongHieus(linhVucId);
    setShowForm(true);
  }

  function openEdit(tour: Tour) {
    setEditingId(tour.id);
    setForm({
      brand: tour.brand,
      type: tour.type,
      thuongHieuId: tour.thuongHieu?.id ?? '',
      linhVucId: tour.linhVuc?.id ?? '',
      khuVucId: tour.khuVuc.id,
      url: tour.url,
      status: tour.status,
      chiNhanhs: tour.chiNhanhs.map(({ id, name, phuongXaId, diaChi }) => ({ id, name, phuongXaId, diaChi })),
    });
    setShowForm(true);
  }

  function updateBranch(index: number, field: keyof Branch, value: string) {
    setForm((current) => ({ ...current, chiNhanhs: current.chiNhanhs.map((branch, i) => i === index ? { ...branch, [field]: value } : branch) }));
  }

  async function submitTour(event: FormEvent) {
    event.preventDefault();
    setError('');
    try {
      await api(editingId ? `/api/tours/${editingId}` : '/api/tours', {
        method: editingId ? 'PATCH' : 'POST',
        body: JSON.stringify(form),
      });
      setShowForm(false);
      setNotice(editingId ? 'Đã cập nhật tour' : 'Đã tạo tour');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu tour');
    }
  }

  async function removeTour(tour: Tour) {
    if (!window.confirm(`Xóa tour của thương hiệu ${tour.brand}?`)) return;
    try {
      await api(`/api/tours/${tour.id}`, { method: 'DELETE' });
      setNotice('Đã xóa tour và các chi nhánh trực thuộc');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa tour');
    }
  }

  async function createCatalog(kind: 'thuong-hieu' | 'linh-vuc', label: string) {
    const name = window.prompt(`Tên ${label} mới`);
    if (!name) return;
    try {
      const body = kind === 'thuong-hieu' ? { name, linhVucId: selectedOverviewLinhVucId } : { name };
      await api(`/api/${kind}`, { method: 'POST', body: JSON.stringify(body) });
      setNotice(`Đã thêm ${label}`);
      await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : `Không thể thêm ${label}`); }
  }

  async function updateCatalog(kind: 'thuong-hieu' | 'linh-vuc', item: CatalogItem, label: string) {
    const name = window.prompt(`Đổi tên ${label}`, item.name);
    if (!name || name === item.name) return;
    try { await api(`/api/${kind}/${item.id}`, { method: 'PATCH', body: JSON.stringify({ name }) }); setNotice(`Đã cập nhật ${label}`); await loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : `Không thể cập nhật ${label}`); }
  }

  async function deleteCatalog(kind: 'thuong-hieu' | 'linh-vuc', item: CatalogItem, label: string) {
    if (!window.confirm(`Xóa ${label} ${item.name}?`)) return;
    try { await api(`/api/${kind}/${item.id}`, { method: 'DELETE' }); setNotice(`Đã xóa ${label}`); await loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : `Không thể xóa ${label}`); }
  }

  async function createKhuVuc() {
    const name = window.prompt('Tên khu vực mới');
    if (!name) return;
    try {
      const created = await api<KhuVuc>('/api/khu-vuc', { method: 'POST', body: JSON.stringify({ name }) });
      setNotice('Đã thêm khu vực');
      setSelectedKhuVucId(created.id);
      await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể thêm khu vực'); }
  }

  async function renameKhuVuc(khuVuc: KhuVuc) {
    const name = window.prompt('Đổi tên khu vực', khuVuc.name);
    if (!name || name === khuVuc.name) return;
    try {
      await api(`/api/khu-vuc/${khuVuc.id}`, { method: 'PATCH', body: JSON.stringify({ name }) });
      setNotice('Đã cập nhật khu vực');
      await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể cập nhật khu vực'); }
  }

  async function removeKhuVuc(khuVuc: KhuVuc) {
    if (!window.confirm(`Xóa khu vực ${khuVuc.name}?`)) return;
    try {
      await api(`/api/khu-vuc/${khuVuc.id}`, { method: 'DELETE' });
      if (selectedKhuVucId === khuVuc.id) setSelectedKhuVucId('');
      setNotice('Đã xóa khu vực');
      await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể xóa khu vực'); }
  }

  async function createPhuongXa() {
    const khuVucId = selectedLocationId || filterKhuVuc;
    if (!khuVucId) { setError('Hãy chọn khu vực trước khi thêm phường/xã'); return; }
    const name = window.prompt('Tên phường/xã mới');
    if (!name) return;
    try {
      await api('/api/phuong-xa', { method: 'POST', body: JSON.stringify({ name, khuVucId }) });
      setNotice('Đã thêm phường/xã');
      await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể thêm phường/xã'); }
  }

  async function renamePhuongXa(phuongXa: PhuongXa) {
    const name = window.prompt('Đổi tên phường/xã', phuongXa.name);
    if (!name || name === phuongXa.name) return;
    try {
      await api(`/api/phuong-xa/${phuongXa.id}`, { method: 'PATCH', body: JSON.stringify({ name, khuVucId: phuongXa.khuVucId }) });
      setNotice('Đã cập nhật phường/xã');
      await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể cập nhật phường/xã'); }
  }

  async function removePhuongXa(phuongXa: PhuongXa) {
    if (!window.confirm(`Xóa phường/xã ${phuongXa.name}?`)) return;
    try {
      await api(`/api/phuong-xa/${phuongXa.id}`, { method: 'DELETE' });
      setNotice('Đã xóa phường/xã');
      await loadData();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể xóa phường/xã'); }
  }

  return (
    <div className="admin-layout">
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`} aria-label="Điều hướng quản trị">
        <div className="sidebar-brand">
          <div className="brand-mark">360</div>
          <div><strong>Tour VR360</strong><small>Quản trị nội bộ</small></div>
          <button className="sidebar-close icon-button" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu"><Icon name="close" /></button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
              key={item.id}
              onClick={() => { setActiveMenu(item.id); setSidebarOpen(false); }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      {sidebarOpen && <button className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu" />}
      <main className="app-shell">
      <header className="topbar">
        <div className="topbar-title"><button className="menu-toggle icon-button" onClick={() => setSidebarOpen(true)} aria-label="Mở menu"><Icon name="menu" /></button><div><p className="eyebrow">TOUR360 / QUẢN TRỊ NỘI BỘ</p><h1>{activeMenu === 'locations' ? 'Khu vực & phường/xã' : activeMenu === 'dashboard' ? 'Tổng quan' : 'Danh sách tour'}</h1></div></div>
        {activeMenu === 'tours' && <button className="primary" onClick={openCreate}>+ Thêm tour</button>}
      </header>

      {error && <div className="alert error">{error}<button onClick={() => setError('')}>×</button></div>}
      {notice && <div className="alert success">{notice}<button onClick={() => setNotice('')}>×</button></div>}

      {activeMenu === 'dashboard' && (
        <>
          <section className="stats-grid" aria-label="Tổng quan">
            <div className="stat"><span>Tổng số tour</span><strong>{stats.total}</strong></div>
            <div className="stat"><span>Đang hoạt động</span><strong className="green">{stats.active}</strong></div>
            <div className="stat"><span>Tạm ngưng</span><strong className="muted">{stats.paused}</strong></div>
          </section>
          <section className="catalog-relation-grid">
            <div className="management-panel">
              <div className="section-heading"><div><h2>Lĩnh vực</h2><span>{linhVucs.length} danh mục</span></div><button className="primary" onClick={() => void createCatalog('linh-vuc', 'lĩnh vực')}>+ Thêm</button></div>
              <div className="relation-list">{linhVucs.map((item) => <div className={`relation-item ${item.id === selectedOverviewLinhVucId ? 'selected' : ''}`} key={item.id} onClick={() => setSelectedOverviewLinhVucId(item.id)}><div><strong>{item.name}</strong></div><div className="relation-actions"><button className="text-button" onClick={(event) => { event.stopPropagation(); void updateCatalog('linh-vuc', item, 'lĩnh vực'); }}>Sửa</button><button className="text-button danger" onClick={(event) => { event.stopPropagation(); void deleteCatalog('linh-vuc', item, 'lĩnh vực'); }}>Xóa</button></div></div>)}</div>
            </div>
            <div className="management-panel">
              <div className="section-heading"><div><h2>Thương hiệu thuộc {selectedOverviewLinhVuc?.name ?? 'lĩnh vực'}</h2><span>{overviewBrands.length} thương hiệu</span></div><button className="primary" disabled={!selectedOverviewLinhVucId} onClick={() => void createCatalog('thuong-hieu', 'thương hiệu')}>+ Thêm</button></div>
              <p className="panel-subtitle">Chọn một lĩnh vực bên trái để quản lý các thương hiệu thuộc lĩnh vực đó.</p>
              <div className="relation-list">{overviewBrands.length === 0 ? <div className="empty">Chưa có thương hiệu nào thuộc lĩnh vực này.</div> : overviewBrands.map((item) => <div className="relation-item" key={item.id}><div><strong>{item.name}</strong></div><div className="relation-actions"><button className="text-button" onClick={() => void updateCatalog('thuong-hieu', item, 'thương hiệu')}>Sửa</button><button className="text-button danger" onClick={() => void deleteCatalog('thuong-hieu', item, 'thương hiệu')}>Xóa</button></div></div>)}</div>
            </div>
          </section>
        </>
      )}

      {activeMenu === 'tours' && (
        <>
          <section className="toolbar">
            <input aria-label="Tìm kiếm" placeholder="Tìm thương hiệu, chi nhánh, địa chỉ..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select aria-label="Lọc theo thương hiệu" value={thuongHieuFilter} onChange={(e) => setThuongHieuFilter(e.target.value)}><option value="">Tất cả thương hiệu</option>{thuongHieus.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <select aria-label="Lọc theo lĩnh vực" value={linhVucFilter} onChange={(e) => setLinhVucFilter(e.target.value)}><option value="">Tất cả lĩnh vực</option>{linhVucs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <select value={filterKhuVuc} onChange={(e) => setFilterKhuVuc(e.target.value)}><option value="">Tất cả khu vực</option>{khuVucs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option><option>Đang hoạt động</option><option>Tạm ngưng</option></select>
          </section>

          <section className="table-section">
            <div className="section-heading"><div><h2>Danh sách tour</h2><span>{tours.length} kết quả</span></div></div>
            {loading ? <div className="empty">Đang tải dữ liệu...</div> : tours.length === 0 ? <div className="empty">Chưa có tour phù hợp. Hãy thêm tour đầu tiên.</div> : <div className="table-wrap"><table><thead><tr><th>Lĩnh vực</th><th>Thương hiệu</th><th>Khu vực</th><th>Chi nhánh</th><th>Trạng thái</th><th className="actions-col">Thao tác</th></tr></thead><tbody>{tours.map((tour) => <tr key={tour.id}><td>{tour.linhVuc?.name ?? typeLabels[tour.type] ?? tour.type}</td><td><strong>{tour.brand}</strong><small>{tour.url}</small></td><td>{tour.khuVuc.name}</td><td>{tour.chiNhanhs.length}</td><td><span className={`badge ${tour.status === 'Đang hoạt động' ? 'active' : 'paused'}`}>{tour.status}</span></td><td className="actions"><a href={tour.url} target="_blank" rel="noreferrer" title="Mở tour VR360">Mở tour ↗</a><button onClick={() => openEdit(tour)}>Sửa</button><button className="danger-text" onClick={() => void removeTour(tour)}>Xóa</button></td></tr>)}</tbody></table></div>}
          </section>
        </>
      )}

      {showForm && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="tour-form-title"><div className="modal-header"><div><p className="eyebrow">THÔNG TIN TOUR</p><h2 id="tour-form-title">{editingId ? 'Sửa tour' : 'Thêm tour mới'}</h2></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Đóng">×</button></div><form onSubmit={submitTour}><div className="form-grid"><label>Lĩnh vực<select required value={form.linhVucId} onChange={(e) => { const linhVucId = e.target.value; const selected = linhVucs.find((item) => item.id === linhVucId); const type = Object.entries(typeLabels).find(([, label]) => label === selected?.name)?.[0] ?? form.type; setForm({ ...form, linhVucId, thuongHieuId: '', brand: '', type }); void loadFormThuongHieus(linhVucId); }}><option value="">Chọn lĩnh vực</option>{linhVucs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Thương hiệu<select required value={form.thuongHieuId} onChange={(e) => { const selected = formThuongHieus.find((item) => item.id === e.target.value); setForm({ ...form, thuongHieuId: e.target.value, brand: selected?.name ?? '' }); }}><option value="">Chọn thương hiệu</option>{formThuongHieus.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Khu vực<select required value={form.khuVucId} onChange={(e) => setForm({ ...form, khuVucId: e.target.value, chiNhanhs: form.chiNhanhs.map((b) => ({ ...b, phuongXaId: '' })) })}><option value="">Chọn khu vực</option>{khuVucs.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Trạng thái<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option>Đang hoạt động</option><option>Tạm ngưng</option></select></label><label className="full">Link VR360<input required type="url" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></label></div><div className="branches-heading"><h3>Chi nhánh</h3><button type="button" className="secondary" onClick={() => setForm({ ...form, chiNhanhs: [...form.chiNhanhs, emptyBranch()] })}>+ Thêm chi nhánh</button></div>{form.chiNhanhs.map((branch, index) => <div className="branch-row" key={index}><input required placeholder="Tên chi nhánh" value={branch.name} onChange={(e) => updateBranch(index, 'name', e.target.value)} /><select required value={branch.phuongXaId} onChange={(e) => updateBranch(index, 'phuongXaId', e.target.value)}><option value="">Phường/xã</option>{visibleWards.map((ward) => <option key={ward.id} value={ward.id}>{ward.name}</option>)}</select><input placeholder="Địa chỉ" value={branch.diaChi ?? ''} onChange={(e) => updateBranch(index, 'diaChi', e.target.value)} />{form.chiNhanhs.length > 1 && <button type="button" className="icon-button danger-text" onClick={() => setForm({ ...form, chiNhanhs: form.chiNhanhs.filter((_, i) => i !== index) })} aria-label="Xóa chi nhánh">×</button>}</div>)}<div className="modal-actions"><button type="button" className="secondary" onClick={() => setShowForm(false)}>Hủy</button><button className="primary" type="submit">{editingId ? 'Lưu thay đổi' : 'Tạo tour'}</button></div></form></section></div>}

      {activeMenu === 'locations' && (
        <>
          <section className="management-grid">
            <div className="management-panel">
              <div className="section-heading">
                <h2>Khu vực</h2>
                <span>{khuVucs.length} khu vực</span>
              </div>
              <div className="location-list">
                {khuVucs.map((khuVuc) => (
                  <div
                    key={khuVuc.id}
                    className={`location-item ${selectedLocationId === khuVuc.id ? 'selected' : ''}`}
                    onClick={() => setSelectedKhuVucId(khuVuc.id)}
                  >
                    <span>{khuVuc.name}</span>
                    <div className="ward-actions">
                      <button className="text-button" onClick={(e) => { e.stopPropagation(); void renameKhuVuc(khuVuc); }}>Sửa</button>
                      <button className="text-button danger" onClick={(e) => { e.stopPropagation(); void removeKhuVuc(khuVuc); }}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="secondary" onClick={() => void createKhuVuc()}>+ Thêm khu vực</button>
            </div>

            <div className="management-panel">
              <div className="section-heading">
                <h2>Phường/xã</h2>
                <span>{selectedWards.length} phường/xã thuộc {khuVucs.find((item) => item.id === selectedLocationId)?.name ?? 'khu vực đã chọn'}</span>
              </div>
              <div className="ward-list">
                {selectedWards.length === 0 ? <div className="empty">Chưa có phường/xã trong khu vực này.</div> : selectedWards.map((phuongXa) => (
                  <div key={phuongXa.id} className="ward-item">
                    <span>{phuongXa.name}</span>
                    <div className="ward-actions">
                      <button className="text-button" onClick={() => void renamePhuongXa(phuongXa)}>Sửa</button>
                      <button className="text-button danger" onClick={() => void removePhuongXa(phuongXa)}>Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="secondary" onClick={() => void createPhuongXa()}>+ Thêm phường/xã</button>
            </div>
          </section>
        </>
      )}
      </main>
    </div>
  );
}
