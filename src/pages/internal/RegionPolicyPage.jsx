import { useState, useMemo } from "react";
import { Edit, Pencil, Trash2, X } from "lucide-react";
import {
  Tabs, TabsList, TabsTrigger,
  DataTable, Badge, Button, Input, Select,
  Pagination, FilterPanel, Chip,
  Card, CardHeader, CardTitle, CardContent,
  Drawer, Field,
} from "../../components/ui";
import initialRegion1Data from "../../mocks/region1policy.json";
import initialRegion2Data from "../../mocks/region2policy.json";

// ============== Helpers ==============

const cloneData = (data) => data.map(d => ({ ...d }));
const displayValue = (v) => (v === null || v === "") ? "없음" : String(v);

// ============== Mock History ==============

const INITIAL_R1_HISTORY = {
  "R1-01": [
    { date: "2026-02-10T09:30:00Z", user: "김운영", changes: { "주기세차(일)": { from: 12, to: 14 } } },
    { date: "2025-12-05T14:20:00Z", user: "박관리", changes: { "라이트세차": { from: "N", to: "Y" } } },
    { date: "2025-09-15T11:00:00Z", user: "이정책", changes: { "주기세차(일)": { from: 10, to: 12 }, "라이트세차": { from: "Y", to: "N" } } },
  ],
  "R1-02": [
    { date: "2026-01-20T10:15:00Z", user: "김운영", changes: { "주기세차(일)": { from: 14, to: 15 } } },
    { date: "2025-10-08T16:45:00Z", user: "박관리", changes: { "라이트세차": { from: "N", to: "Y" } } },
  ],
  "R1-04": [
    { date: "2025-11-12T13:00:00Z", user: "이정책", changes: { "주기세차(일)": { from: 18, to: 20 } } },
  ],
  "R1-07": [
    { date: "2026-02-05T11:30:00Z", user: "김운영", changes: { "주기세차(일)": { from: 15, to: 14 }, "라이트세차": { from: "N", to: "Y" } } },
  ],
  "R1-16": [
    { date: "2026-01-10T09:00:00Z", user: "박관리", changes: { "주기세차(일)": { from: 14, to: 10 } } },
    { date: "2025-08-20T15:30:00Z", user: "이정책", changes: { "라이트세차": { from: "Y", to: "N" } } },
  ],
};

const INITIAL_R2_HISTORY = {
  "R2-001": [
    { date: "2026-01-25T10:00:00Z", user: "김운영", changes: { "주기세차(일)": { from: 18, to: 15 } } },
  ],
  "R2-010": [
    { date: "2026-02-01T14:30:00Z", user: "박관리", changes: { "라이트세차": { from: "N", to: "Y" } } },
  ],
  "R2-025": [
    { date: "2025-12-10T09:00:00Z", user: "이정책", changes: { "주기세차(일)": { from: 12, to: 14 }, "라이트세차": { from: "Y", to: "N" } } },
  ],
  "R2-050": [
    { date: "2026-02-15T11:00:00Z", user: "김운영", changes: { "주기세차(일)": { from: 20, to: 16 } } },
    { date: "2025-10-20T09:30:00Z", user: "박관리", changes: { "라이트세차": { from: "Y", to: "N" } } },
  ],
};

// ============== History Drawer ==============

function HistoryDrawer({ open, onClose, currentData, historyEntries, fields }) {
  if (!currentData) return null;
  return (
    <Drawer
      open={open}
      title={currentData._drawerTitle}
      subtitle={currentData._drawerSubtitle}
      onClose={onClose}
      footer={<Button variant="secondary" onClick={onClose}>닫기</Button>}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>현재 정책</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {fields.map(({ label, value }) => (
              <Field key={label} label={label} value={value} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>변경 이력</CardTitle></CardHeader>
          <CardContent>
            {historyEntries.length > 0 ? (
              <div className="space-y-3">
                {historyEntries.map((entry, i) => (
                  <div key={i} className="border-l-4 border-blue-500 pl-4 py-2 bg-slate-50 rounded-r-lg">
                    <div className="font-semibold text-sm text-slate-800">
                      {new Date(entry.date).toLocaleString("ko-KR")} · {entry.user}
                    </div>
                    <ul className="mt-1 list-disc list-inside text-xs text-slate-600 space-y-1">
                      {Object.entries(entry.changes).map(([key, val], ci) => (
                        <li key={ci}>
                          <span className="font-semibold">{key}</span>:{" "}
                          <span className="font-mono bg-rose-100 text-rose-800 px-1 rounded">{displayValue(val.from)}</span>
                          {" → "}
                          <span className="font-mono bg-emerald-100 text-emerald-800 px-1 rounded">{displayValue(val.to)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-[#6B778C] py-8">변경 이력이 없습니다.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </Drawer>
  );
}

// ============== DeleteConfirmModal ==============

function DeleteConfirmModal({ open, onClose, onConfirm, row }) {
  if (!open || !row) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-sm shadow-2xl">
        <CardHeader>
          <CardTitle>정책 삭제</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#172B4D]">
            <b>{row.시도} {row.시군구}</b>의 지역2 정책을 삭제하면<br />지역1 정책을 따르게 됩니다.
          </p>
        </CardContent>
        <div className="flex h-[72px] items-center justify-end gap-2 border-t border-[#DFE1E6] px-5 bg-[#F4F5F7] rounded-b-xl">
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={() => { onConfirm(row); onClose(); }}>삭제</Button>
        </div>
      </Card>
    </div>
  );
}

// ============== BatchEditModal ==============

function BatchEditModal({ open, onClose, onApply, filteredCount }) {
  const [cycleWashDays, setCycleWashDays] = useState("");
  const [lightWash, setLightWash] = useState("");

  if (!open) return null;

  const handleApply = () => {
    const cycleVal = cycleWashDays === "" ? null : Number(cycleWashDays);
    onApply({
      "주기세차(일)": cycleVal,
      "라이트세차": lightWash === "" ? null : lightWash,
    });
    setCycleWashDays("");
    setLightWash("");
  };

  const handleClose = () => {
    setCycleWashDays("");
    setLightWash("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />
      <Card className="relative z-10 w-full max-w-md shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>필터된 데이터 일괄 수정</CardTitle>
            <button onClick={handleClose}><X className="h-5 w-5 text-gray-500" /></button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[#6B778C]">
            대상: <b className="text-[#172B4D]">{filteredCount}건</b> — 수정할 항목만 입력하세요. 빈 값은 변경하지 않습니다.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">주기세차(일)</label>
            <Input type="number" min={0} max={30} value={cycleWashDays}
              onChange={e => setCycleWashDays(e.target.value)} placeholder="0: 상위 정책 따름, 7~30: 직접 설정" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">라이트세차</label>
            <Select value={lightWash} onChange={e => setLightWash(e.target.value)}>
              <option value="">변경 안함</option>
              <option value="inherit">상위 정책 따름</option>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </Select>
          </div>
        </CardContent>
        <div className="flex h-[72px] items-center justify-end gap-2 border-t border-[#DFE1E6] px-5 bg-[#F4F5F7] rounded-b-xl">
          <Button variant="secondary" onClick={handleClose}>취소</Button>
          <Button onClick={handleApply}
            disabled={cycleWashDays === "" && lightWash === ""}
          >{filteredCount}건에 적용</Button>
        </div>
      </Card>
    </div>
  );
}

// ============== Region1Tab ==============

function Region1Tab() {
  const [data, setData] = useState(() => cloneData(initialRegion1Data));
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({ "주기세차(일)": "", "라이트세차": "" });
  const [drawerRowId, setDrawerRowId] = useState(null);
  const [history, setHistory] = useState(() => ({ ...INITIAL_R1_HISTORY }));

  const drawerData = useMemo(() => {
    if (!drawerRowId) return null;
    return data.find(r => r.Region1ID === drawerRowId) || null;
  }, [drawerRowId, data]);

  const sorted = useMemo(() => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const av = a[sortConfig.key] ?? "", bv = b[sortConfig.key] ?? "";
      if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
      if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const isEditValid = (() => {
    const v = parseInt(String(editValues["주기세차(일)"]), 10);
    return !isNaN(v) && v >= 7 && v <= 30 &&
      (editValues["라이트세차"] === "Y" || editValues["라이트세차"] === "N");
  })();

  const handleEditStart = (row) => {
    setEditingRowId(row.Region1ID);
    setEditValues({ "주기세차(일)": row["주기세차(일)"], "라이트세차": row["라이트세차"] });
  };

  const handleEditCancel = () => setEditingRowId(null);

  const handleRowSave = () => {
    if (!editingRowId) return;
    const cycleVal = parseInt(String(editValues["주기세차(일)"]), 10);
    const lightVal = editValues["라이트세차"];
    const oldRow = data.find(r => r.Region1ID === editingRowId);
    if (!oldRow) return;

    const changes = {};
    if (oldRow["주기세차(일)"] !== cycleVal) changes["주기세차(일)"] = { from: oldRow["주기세차(일)"], to: cycleVal };
    if (oldRow["라이트세차"] !== lightVal) changes["라이트세차"] = { from: oldRow["라이트세차"], to: lightVal };

    if (Object.keys(changes).length === 0) {
      setEditingRowId(null);
      return;
    }

    setHistory(prev => ({
      ...prev,
      [editingRowId]: [
        { date: new Date().toISOString(), user: "Ops Admin", changes },
        ...(prev[editingRowId] || []),
      ],
    }));
    setData(prev => prev.map(r =>
      r.Region1ID === editingRowId
        ? { ...r, "주기세차(일)": cycleVal, "라이트세차": lightVal }
        : r
    ));
    setEditingRowId(null);
  };

  const columns = [
    {
      key: "Region1ID",
      header: "ID",
      render: (row) => (
        <button
          className="text-blue-600 hover:underline font-mono text-sm"
          onClick={(e) => { e.stopPropagation(); setDrawerRowId(row.Region1ID); }}
        >
          {row.Region1ID}
        </button>
      ),
    },
    { key: "시도", header: "시도" },
    {
      key: "주기세차(일)",
      header: "주기세차(일)",
      sortable: true,
      align: "center",
      render: (row) => {
        if (editingRowId === row.Region1ID) {
          return (
            <Input
              type="number" min={7} max={30}
              value={editValues["주기세차(일)"]}
              onChange={e => setEditValues(p => ({ ...p, "주기세차(일)": e.target.value }))}
              className="w-24"
              onKeyDown={(e) => {
                if (e.key === "Enter" && isEditValid) handleRowSave();
                if (e.key === "Escape") handleEditCancel();
              }}
            />
          );
        }
        return row["주기세차(일)"];
      },
    },
    {
      key: "라이트세차",
      header: "라이트세차",
      align: "center",
      render: (row) => {
        if (editingRowId === row.Region1ID) {
          return (
            <Select
              value={editValues["라이트세차"]}
              onChange={e => setEditValues(p => ({ ...p, "라이트세차": e.target.value }))}
              className="w-20"
            >
              <option value="Y">Y</option>
              <option value="N">N</option>
            </Select>
          );
        }
        return <Badge tone={row["라이트세차"] === "Y" ? "ok" : "default"}>{row["라이트세차"]}</Badge>;
      },
    },
    {
      key: "_actions",
      header: "",
      align: "center",
      render: (row) => {
        if (editingRowId === row.Region1ID) {
          return (
            <div className="flex items-center gap-1.5">
              <Button size="sm" disabled={!isEditValid}
                onClick={(e) => { e.stopPropagation(); handleRowSave(); }}>저장</Button>
              <Button size="sm" variant="secondary"
                onClick={(e) => { e.stopPropagation(); handleEditCancel(); }}>취소</Button>
            </div>
          );
        }
        return (
          <button
            className="p-1.5 rounded-lg hover:bg-gray-100 transition"
            onClick={(e) => { e.stopPropagation(); handleEditStart(row); }}
            title="수정"
          >
            <Pencil className="h-4 w-4 text-[#6B778C]" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[#6B778C]">전체 <b className="text-[#172B4D]">{data.length}</b>건</div>
      </div>
      <DataTable
        columns={columns}
        rows={sorted}
        rowKey={(r) => r.Region1ID}
        sortConfig={sortConfig}
        onSort={(key) => setSortConfig(prev => ({
          key,
          direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }))}
      />
      <HistoryDrawer
        open={!!drawerRowId}
        onClose={() => setDrawerRowId(null)}
        currentData={drawerData && {
          _drawerTitle: `${drawerData.시도} 정책 변경 이력`,
          _drawerSubtitle: `ID: ${drawerData.Region1ID}`,
        }}
        historyEntries={drawerRowId ? (history[drawerRowId] || []) : []}
        fields={drawerData ? [
          { label: "정책 ID", value: drawerData.Region1ID },
          { label: "시도", value: drawerData.시도 },
          { label: "주기세차(일)", value: `${drawerData["주기세차(일)"]}일` },
          { label: "라이트세차", value: <Badge tone={drawerData["라이트세차"] === "Y" ? "ok" : "default"}>{drawerData["라이트세차"]}</Badge> },
        ] : []}
      />
    </div>
  );
}

// ============== Region2Tab ==============

function Region2Tab({ onSwitchTab }) {
  const [data, setData] = useState(() => cloneData(initialRegion2Data));
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [editingRowId, setEditingRowId] = useState(null);
  const [editValues, setEditValues] = useState({ "주기세차(일)": "", "라이트세차": "" });
  const [drawerRowId, setDrawerRowId] = useState(null);
  const [history, setHistory] = useState(() => ({ ...INITIAL_R2_HISTORY }));
  const [filter, setFilter] = useState({ sido: "all", search: "" });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [batchEditOpen, setBatchEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sidoOptions = useMemo(() => [...new Set(initialRegion2Data.map(d => d.시도))].sort(), []);
  const region1Map = useMemo(() => {
    const map = {};
    initialRegion1Data.forEach(r => { map[r.시도] = r; });
    return map;
  }, []);

  const drawerData = useMemo(() => {
    if (!drawerRowId) return null;
    return data.find(r => r.Region2ID === drawerRowId) || null;
  }, [drawerRowId, data]);

  const filtered = useMemo(() => {
    let result = data;
    if (filter.sido !== "all") result = result.filter(r => r.시도 === filter.sido);
    if (filter.search.trim()) {
      const terms = filter.search.split(/[\s,]+/).filter(Boolean);
      result = result.filter(r => terms.some(t => r.시군구.includes(t)));
    }
    return result;
  }, [data, filter]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sortConfig.key] ?? "", bv = b[sortConfig.key] ?? "";
      if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
      if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortConfig]);

  const PER_PAGE = 50;
  const totalPages = Math.max(1, Math.ceil(sortedData.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageData = useMemo(
    () => sortedData.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE),
    [sortedData, safePage]
  );

  // Region2: 빈 값/0 = 상위 정책 따름 허용
  const isEditValid = (() => {
    const cycleStr = String(editValues["주기세차(일)"]);
    if (cycleStr === "" || cycleStr === "0") return true;
    const v = parseInt(cycleStr, 10);
    return !isNaN(v) && v >= 7 && v <= 30;
  })();

  const handleEditStart = (row) => {
    setEditingRowId(row.Region2ID);
    setEditValues({
      "주기세차(일)": row["주기세차(일)"] === null ? "" : row["주기세차(일)"],
      "라이트세차": row["라이트세차"] === null ? "" : row["라이트세차"],
    });
  };

  const handleEditCancel = () => setEditingRowId(null);

  const handleRowSave = () => {
    if (!editingRowId) return;
    const cycleStr = String(editValues["주기세차(일)"]);
    const cycleVal = (cycleStr === "" || cycleStr === "0") ? null : parseInt(cycleStr, 10);
    const lightVal = editValues["라이트세차"] === "" ? null : editValues["라이트세차"];
    const oldRow = data.find(r => r.Region2ID === editingRowId);
    if (!oldRow) return;

    const changes = {};
    if (oldRow["주기세차(일)"] !== cycleVal) changes["주기세차(일)"] = { from: oldRow["주기세차(일)"], to: cycleVal };
    if (oldRow["라이트세차"] !== lightVal) changes["라이트세차"] = { from: oldRow["라이트세차"], to: lightVal };

    if (Object.keys(changes).length === 0) {
      setEditingRowId(null);
      return;
    }

    setHistory(prev => ({
      ...prev,
      [editingRowId]: [
        { date: new Date().toISOString(), user: "Ops Admin", changes },
        ...(prev[editingRowId] || []),
      ],
    }));
    setData(prev => prev.map(r =>
      r.Region2ID === editingRowId
        ? { ...r, "주기세차(일)": cycleVal, "라이트세차": lightVal }
        : r
    ));
    setEditingRowId(null);
  };

  const handleDeleteConfirm = (row) => {
    const changes = {};
    if (row["주기세차(일)"] !== null) changes["주기세차(일)"] = { from: row["주기세차(일)"], to: null };
    if (row["라이트세차"] !== null) changes["라이트세차"] = { from: row["라이트세차"], to: null };
    if (Object.keys(changes).length === 0) return;

    setHistory(prev => ({
      ...prev,
      [row.Region2ID]: [
        { date: new Date().toISOString(), user: "Ops Admin", changes },
        ...(prev[row.Region2ID] || []),
      ],
    }));
    setData(prev => prev.map(r =>
      r.Region2ID === row.Region2ID
        ? { ...r, "주기세차(일)": null, "라이트세차": null }
        : r
    ));
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleTogglePageAll = () => {
    const pageIds = pageData.map(r => r.Region2ID);
    const allSelected = pageIds.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      pageIds.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const handleBulkApply = (bulkData) => {
    const now = new Date().toISOString();

    const historyUpdates = {};
    data.forEach(r => {
      if (!selectedIds.has(r.Region2ID)) return;
      const changes = {};

      if (bulkData["주기세차(일)"] !== null) {
        const newCycle = bulkData["주기세차(일)"] === 0 ? null : bulkData["주기세차(일)"];
        if (r["주기세차(일)"] !== newCycle) {
          changes["주기세차(일)"] = { from: r["주기세차(일)"], to: newCycle };
        }
      }
      if (bulkData["라이트세차"] !== null) {
        const newLight = bulkData["라이트세차"] === "inherit" ? null : bulkData["라이트세차"];
        if (r["라이트세차"] !== newLight) {
          changes["라이트세차"] = { from: r["라이트세차"], to: newLight };
        }
      }

      if (Object.keys(changes).length > 0) {
        historyUpdates[r.Region2ID] = changes;
      }
    });

    setData(prev => prev.map(r => {
      if (!selectedIds.has(r.Region2ID)) return r;
      const updated = { ...r };
      if (bulkData["주기세차(일)"] !== null) updated["주기세차(일)"] = bulkData["주기세차(일)"] === 0 ? null : bulkData["주기세차(일)"];
      if (bulkData["라이트세차"] !== null) updated["라이트세차"] = bulkData["라이트세차"] === "inherit" ? null : bulkData["라이트세차"];
      return updated;
    }));

    if (Object.keys(historyUpdates).length > 0) {
      setHistory(prev => {
        const next = { ...prev };
        for (const [rowId, changes] of Object.entries(historyUpdates)) {
          next[rowId] = [
            { date: now, user: "Ops Admin (일괄)", changes },
            ...(next[rowId] || []),
          ];
        }
        return next;
      });
    }

    setSelectedIds(new Set());
    setBatchEditOpen(false);
  };

  const pageAllSelected = pageData.length > 0 && pageData.every(r => selectedIds.has(r.Region2ID));
  const pageSomeSelected = pageData.some(r => selectedIds.has(r.Region2ID));

  const columns = [
    {
      key: "_select",
      header: (
        <input
          type="checkbox"
          checked={pageAllSelected}
          ref={el => { if (el) el.indeterminate = pageSomeSelected && !pageAllSelected; }}
          onChange={handleTogglePageAll}
          className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-blue-600"
        />
      ),
      align: "center",
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.Region2ID)}
          onChange={(e) => { e.stopPropagation(); handleToggleSelect(row.Region2ID); }}
          className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-blue-600"
        />
      ),
    },
    {
      key: "Region2ID",
      header: "ID",
      render: (row) => (
        <button
          className="text-blue-600 hover:underline font-mono text-sm"
          onClick={(e) => { e.stopPropagation(); setDrawerRowId(row.Region2ID); }}
        >
          {row.Region2ID}
        </button>
      ),
    },
    {
      key: "시도",
      header: "시도",
      render: (row) => {
        const r1 = region1Map[row.시도];
        return (
          <div className="group/sido relative inline-block">
            <button
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={(e) => { e.stopPropagation(); onSwitchTab("region1"); }}
            >
              {row.시도}
            </button>
            {r1 && (
              <div className="hidden group-hover/sido:block absolute z-50 left-0 top-full mt-1">
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-xs space-y-1 whitespace-nowrap">
                  <div className="font-semibold text-[#172B4D] mb-1">지역1 정책: {row.시도}</div>
                  <div className="text-[#6B778C]">주기세차(일): <span className="text-[#172B4D]">{r1["주기세차(일)"]}일</span></div>
                  <div className="text-[#6B778C]">라이트세차: <span className="text-[#172B4D]">{r1["라이트세차"]}</span></div>
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    { key: "시군구", header: "시군구" },
    {
      key: "주기세차(일)",
      header: "주기세차(일)",
      sortable: true,
      align: "center",
      render: (row) => {
        if (editingRowId === row.Region2ID) {
          return (
            <Input
              type="number" min={0} max={30}
              value={editValues["주기세차(일)"]}
              onChange={e => setEditValues(p => ({ ...p, "주기세차(일)": e.target.value }))}
              className="w-24"
              placeholder="0: 상위"
              onKeyDown={(e) => {
                if (e.key === "Enter" && isEditValid) handleRowSave();
                if (e.key === "Escape") handleEditCancel();
              }}
            />
          );
        }
        if (row["주기세차(일)"] === null) {
          return <span className="text-sm text-[#6B778C]">없음</span>;
        }
        return row["주기세차(일)"];
      },
    },
    {
      key: "라이트세차",
      header: "라이트세차",
      align: "center",
      render: (row) => {
        if (editingRowId === row.Region2ID) {
          return (
            <Select
              value={editValues["라이트세차"]}
              onChange={e => setEditValues(p => ({ ...p, "라이트세차": e.target.value }))}
              className="w-44"
            >
              <option value="">선택안함 (상위 정책 따름)</option>
              <option value="Y">Y</option>
              <option value="N">N</option>
            </Select>
          );
        }
        if (row["라이트세차"] === null) {
          return <span className="text-sm text-[#6B778C]">없음</span>;
        }
        return <Badge tone={row["라이트세차"] === "Y" ? "ok" : "default"}>{row["라이트세차"]}</Badge>;
      },
    },
    {
      key: "_actions",
      header: "",
      align: "center",
      render: (row) => {
        if (editingRowId === row.Region2ID) {
          return (
            <div className="flex items-center gap-1.5">
              <Button size="sm" disabled={!isEditValid}
                onClick={(e) => { e.stopPropagation(); handleRowSave(); }}>저장</Button>
              <Button size="sm" variant="secondary"
                onClick={(e) => { e.stopPropagation(); handleEditCancel(); }}>취소</Button>
            </div>
          );
        }
        const isAllNull = row["주기세차(일)"] === null && row["라이트세차"] === null;
        return (
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              onClick={(e) => { e.stopPropagation(); handleEditStart(row); }}
              title="수정"
            >
              <Pencil className="h-4 w-4 text-[#6B778C]" />
            </button>
            <button
              className={`p-1.5 rounded-lg transition ${isAllNull ? "opacity-30 cursor-not-allowed" : "hover:bg-rose-50 text-rose-500"}`}
              onClick={(e) => { e.stopPropagation(); if (!isAllNull) setDeleteTarget(row); }}
              disabled={isAllNull}
              title="정책 삭제"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const isFiltered = filter.sido !== "all" || filter.search.trim() !== "";

  const chips = (
    <>
      {filter.sido !== "all" && (
        <Chip onRemove={() => { setFilter(p => ({ ...p, sido: "all" })); setPage(1); }}>시도: {filter.sido}</Chip>
      )}
      {filter.search && (
        <Chip onRemove={() => { setFilter(p => ({ ...p, search: "" })); setPage(1); }}>검색: {filter.search}</Chip>
      )}
    </>
  );

  return (
    <div className="space-y-3">
      <FilterPanel
        chips={chips}
        onReset={() => { setFilter({ sido: "all", search: "" }); setPage(1); }}
      >
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">시도</label>
          <Select value={filter.sido} onChange={e => { setFilter(p => ({ ...p, sido: e.target.value })); setPage(1); }}>
            <option value="all">전체</option>
            {sidoOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-[#6B778C] mb-1.5">시군구 검색</label>
          <Input
            value={filter.search}
            onChange={e => { setFilter(p => ({ ...p, search: e.target.value })); setPage(1); }}
            placeholder="시군구 검색 (쉼표/공백으로 구분)"
          />
        </div>
      </FilterPanel>

      <div className="flex items-center justify-between">
        <div className="text-sm text-[#6B778C]">
          {isFiltered
            ? <>필터 결과 <b className="text-[#172B4D]">{filtered.length}</b>건 / 전체 {data.length}건</>
            : <>전체 <b className="text-[#172B4D]">{data.length}</b>건</>
          }
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <span className="text-xs text-blue-600 font-semibold">{selectedIds.size}건 선택</span>
          )}
          <Button
            variant="secondary" size="sm"
            disabled={selectedIds.size === 0}
            onClick={() => setBatchEditOpen(true)}
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            일괄 수정{selectedIds.size > 0 ? ` (${selectedIds.size}건)` : ""}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={pageData}
        rowKey={(r) => r.Region2ID}
        sortConfig={sortConfig}
        onSort={(key) => setSortConfig(prev => ({
          key,
          direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }))}
      />

      {totalPages > 1 && (
        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
      )}

      <BatchEditModal
        open={batchEditOpen}
        onClose={() => setBatchEditOpen(false)}
        onApply={handleBulkApply}
        filteredCount={selectedIds.size}
      />

      <HistoryDrawer
        open={!!drawerRowId}
        onClose={() => setDrawerRowId(null)}
        currentData={drawerData && {
          _drawerTitle: `${drawerData.시도} ${drawerData.시군구} 정책 변경 이력`,
          _drawerSubtitle: `ID: ${drawerData.Region2ID}`,
        }}
        historyEntries={drawerRowId ? (history[drawerRowId] || []) : []}
        fields={drawerData ? [
          { label: "정책 ID", value: drawerData.Region2ID },
          { label: "시도", value: drawerData.시도 },
          { label: "시군구", value: drawerData.시군구 },
          { label: "주기세차(일)", value: drawerData["주기세차(일)"] === null
            ? <span className="text-[#6B778C]">없음</span>
            : `${drawerData["주기세차(일)"]}일`
          },
          { label: "라이트세차", value: drawerData["라이트세차"] === null
            ? <span className="text-[#6B778C]">없음</span>
            : <Badge tone={drawerData["라이트세차"] === "Y" ? "ok" : "default"}>{drawerData["라이트세차"]}</Badge>
          },
        ] : []}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        row={deleteTarget}
      />
    </div>
  );
}

// ============== Main Page ==============

export default function RegionPolicyPage() {
  const [activeTab, setActiveTab] = useState("region1");

  return (
    <div className="space-y-4">
      <Tabs>
        <TabsList>
          <TabsTrigger value="region1" currentValue={activeTab} onClick={setActiveTab}>
            지역1 정책(시도)
          </TabsTrigger>
          <TabsTrigger value="region2" currentValue={activeTab} onClick={setActiveTab}>
            지역2 정책(시군구)
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div style={{ display: activeTab === "region1" ? "block" : "none" }}>
        <Region1Tab />
      </div>
      <div style={{ display: activeTab === "region2" ? "block" : "none" }}>
        <Region2Tab onSwitchTab={setActiveTab} />
      </div>
    </div>
  );
}
