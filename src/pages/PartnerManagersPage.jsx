import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react';
import {
  Card, CardHeader, CardTitle, CardContent,
  Button, Input, Select, Drawer, DataTable,
  FilterPanel, Chip, usePagination,
} from '../components/ui';

// 리스트 마스킹 함수
function maskName(name) {
  if (!name) return '';
  if (name.length <= 2) return name[0] + '*';
  if (name.length === 3) return name[0] + '*' + name[2];
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

function maskPhone(phone) {
  if (!phone) return '';
  const parts = phone.split('-');
  if (parts.length === 3) return parts[0] + '-' + '*'.repeat(parts[1].length) + '-' + parts[2];
  // 하이픈 없는 경우
  if (phone.length >= 10) return phone.slice(0, 3) + '*'.repeat(phone.length - 7) + phone.slice(-4);
  return phone;
}

function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.length <= 3 ? local : local.slice(0, 3) + '*'.repeat(local.length - 3);
  const maskedDomain = domain.length <= 1 ? domain : domain[0] + '*'.repeat(domain.length - 1);
  return maskedLocal + '@' + maskedDomain;
}

export default function PartnerManagersPage() {
  const [managers, setManagers] = useState([
    { id: 'PM-001', partner: '강남모빌리티', role: '세차 담당', name: '김담당', phone: '010-1234-5678', email: 'kim@gangnammob.com' },
    { id: 'PM-002', partner: '수원카케어', role: '행정 담당', name: '이담당', phone: '010-9876-5432', email: 'lee@suwoncare.com' },
    { id: 'PM-003', partner: '강남모빌리티', role: '세차 담당', name: '박수행', phone: '010-1111-2222', email: 'park@gangnammob.com' },
    { id: 'PM-004', partner: '부산클린', role: '기타', name: '최매니저', phone: '010-3333-4444', email: 'choi@busanclean.com' },
  ]);

  const [editingManager, setEditingManager] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [fPartner, setFPartner] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });

  const partners = useMemo(() => Array.from(new Set(managers.map(m => m.partner))), [managers]);

  const filteredData = useMemo(() => {
    return managers.filter(m => {
      const matchPartner = !fPartner || m.partner === fPartner;
      return matchPartner;
    });
  }, [managers, fPartner]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleOpenDrawer = (manager = null) => {
    setEditingManager(manager);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingManager(null);
  };

  const handleSave = (managerData) => {
    if (editingManager && editingManager.id) {
      // Update
      setManagers(prev => prev.map(m => m.id === managerData.id ? managerData : m));
    } else {
      // Create
      const newManager = { ...managerData, id: `PM-${Date.now()}` };
      setManagers(prev => [newManager, ...prev]);
    }
    handleCloseDrawer();
  };

  const handleDelete = (managerId) => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      setManagers(prev => prev.filter(m => m.id !== managerId));
      handleCloseDrawer();
    }
  };

  const { currentData, currentPage, totalPages, setCurrentPage, totalItems } = usePagination(sortedData, 40);

  const columns = [
    { key: 'id', header: '담당자 ID', align: 'center' },
    { key: 'partner', header: '파트너 이름' },
    { key: 'role', header: '직무' },
    { key: 'name', header: '이름', render: r => maskName(r.name) },
    { key: 'phone', header: '휴대전화', render: r => maskPhone(r.phone) },
    { key: 'email', header: '이메일', render: r => maskEmail(r.email) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="text-base font-bold text-[#172B4D]">파트너 담당자 관리</div>
          <div className="mt-1 text-sm text-[#6B778C]">파트너 담당자 정보를 등록하고 수정, 삭제할 수 있습니다.</div>
        </div>
        <Button onClick={() => handleOpenDrawer()}>
          <Plus className="mr-2 h-4 w-4" /> 담당자 등록
        </Button>
      </div>

      <FilterPanel
        chips={<>
          {fPartner ? <Chip onRemove={() => setFPartner("")}>파트너: {fPartner}</Chip> : null}
        </>}
        onReset={() => setFPartner("")}
      >
        <div className="md:col-span-2">
          <label htmlFor="fPartner" className="block text-xs font-semibold text-[#6B778C] mb-1.5">파트너 이름</label>
          <Select id="fPartner" value={fPartner} onChange={e => setFPartner(e.target.value)}>
            <option value="">전체</option>
            {partners.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
      </FilterPanel>


      <DataTable columns={columns} rows={currentData} rowKey={r => r.id} onRowClick={handleOpenDrawer} sortConfig={sortConfig} onSort={handleSort} />
      <div className="flex items-center justify-end pt-2">
        <div className="flex items-center gap-2 text-sm text-[#6B778C]">
          <span>
            {totalItems > 0
              ? `${(currentPage - 1) * 40 + 1} - ${Math.min(
                  currentPage * 40,
                  totalItems
                )} / ${totalItems.toLocaleString()}`
              : "0 - 0 / 0"}
          </span>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 h-auto"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 h-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ManagerFormDrawer
        isOpen={isDrawerOpen}
        manager={editingManager}
        onClose={handleCloseDrawer}
        onSave={handleSave}
        onDelete={handleDelete}
        allPartners={partners}
      />
    </div>
  );
}

function ManagerFormDrawer({ isOpen, manager, onClose, onSave, onDelete, allPartners }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (manager) {
      setFormData(manager);
    } else {
      // Reset for new entry
      setFormData({ partner: '', role: '세차 담당', name: '', email: '', phone: '' });
    }
  }, [manager, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.partner || !formData.role || !formData.name || !formData.email || !formData.phone) {
      alert("모든 항목은 필수 입력입니다.");
      return;
    }
    onSave(formData);
  };

  const isEditing = !!manager?.id;

  const handleDeleteClick = () => {
    if (isEditing) {
      onDelete(manager.id);
    }
  };

  return (
    <Drawer
      open={isOpen}
      title={isEditing ? "담당자 수정" : "담당자 등록"}
      onClose={onClose}
      footer={
        <>
          {isEditing && (
            <Button variant="danger" onClick={handleDeleteClick} className="mr-auto">
              <Trash2 className="mr-2 h-4 w-4" /> 삭제
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>
            {isEditing ? "수정하기" : "등록하기"}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>파트너 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">파트너 <span className="text-rose-500 ml-1">*</span></label>
              <Select name="partner" value={formData.partner || ''} onChange={handleInputChange}>
                <option value="" disabled>파트너사를 선택하세요</option>
                {allPartners.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">직무 <span className="text-rose-500 ml-1">*</span></label>
              <Select name="role" value={formData.role || '세차 담당'} onChange={handleInputChange}>
                <option value="세차 담당">세차 담당</option>
                <option value="행정 담당">행정 담당</option>
                <option value="기타">기타</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>계정 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">이름 <span className="text-rose-500 ml-1">*</span></label>
              <Input name="name" value={formData.name || ''} onChange={handleInputChange} placeholder="이름 입력" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">이메일 <span className="text-rose-500 ml-1">*</span></label>
              <Input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} placeholder="이메일 입력" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#6B778C]">휴대전화 <span className="text-rose-500 ml-1">*</span></label>
              <Input name="phone" value={formData.phone || ''} onChange={handleInputChange} placeholder="휴대전화 입력" />
            </div>
          </CardContent>
        </Card>
      </div>
    </Drawer>
  );
}