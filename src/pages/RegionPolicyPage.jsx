import React, { useState, useMemo } from "react";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  DataTable,
  Badge,
  Button,
  Input,
  Select,
  Pagination,
  usePagination
} from "../components/ui";
import initialRegion1Data from "../mocks/region1policy.json";
import initialRegion2Data from "../mocks/region2policy.json";

// Component for "지역1 정책(시도)" tab
const Region1PolicyTab = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState(initialRegion1Data);

  const handleUpdateData = (regionId, field, value) => {
    setEditedData((prevData) =>
      prevData.map((row) =>
        row.Region1ID === regionId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave = () => {
    console.log("Saving data:", editedData);
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setEditedData(initialRegion1Data);
    setIsEditMode(false);
  };

  const columns = useMemo(() => [
    { key: "Region1ID", header: "ID" },
    { key: "시도", header: "시도" },
    {
      key: "주기세차(일)",
      header: "주기세차(일)",
      render: (row) => 
        isEditMode ? (
          <Input
            type="number"
            value={row["주기세차(일)"]}
            onChange={(e) => handleUpdateData(row.Region1ID, "주기세차(일)", parseInt(e.target.value, 10) || 0)}
            className="w-24"
          />
        ) : ( row["주기세차(일)"] ),
    },
    {
      key: "라이트세차",
      header: "라이트세차",
      render: (row) => 
        isEditMode ? (
          <Select
            value={row["라이트세차"]}
            onChange={(e) => handleUpdateData(row.Region1ID, "라이트세차", e.target.value)}
            className="w-20"
          >
            <option value="Y">Y</option>
            <option value="N">N</option>
          </Select>
        ) : ( <Badge tone={row["라이트세차"] === 'Y' ? 'ok' : 'default'}>{row["라이트세차"]}</Badge> ),
    },
  ], [isEditMode]);

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {isEditMode ? (
          <>
            <Button variant="secondary" onClick={handleCancel}>취소</Button>
            <Button onClick={handleSave}>저장</Button>
          </>
        ) : (
          <Button variant="outline" onClick={() => setIsEditMode(true)}>수정</Button>
        )}
      </div>
      <DataTable 
        columns={columns} 
        rows={editedData} 
        rowKey={(row) => row.Region1ID} 
      />
    </div>
  );
};

// Component for "지역2 정책 (시군구)" tab
const Region2PolicyTab = () => {
  const [isEditMode2, setIsEditMode2] = useState(false);
  const [editedData2, setEditedData2] = useState(initialRegion2Data);
  const [filterSido, setFilterSido] = useState("all");
  const [searchSigungu, setSearchSigungu] = useState("");

  const sidoOptions = useMemo(() => 
    ["all", ...new Set(initialRegion2Data.map(d => d.시도))]
  , []);

  const filteredRows = useMemo(() => {
    let data = editedData2;
    if (filterSido !== "all") {
      data = data.filter(row => row.시도 === filterSido);
    }
    if (searchSigungu.trim() !== "") {
      const searchTerms = searchSigungu.split(/[\s,]+/).filter(Boolean);
      data = data.filter(row => searchTerms.some(term => row.시군구.includes(term)));
    }
    return data;
  }, [editedData2, filterSido, searchSigungu]);
  
  const { currentPage, setCurrentPage, totalPages, currentData } = usePagination(filteredRows, 100);

  const handleUpdateData2 = (regionId, field, value) => {
    setEditedData2((prevData) =>
      prevData.map((row) =>
        row.Region2ID === regionId ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave2 = () => {
    console.log("Saving Region 2 data:", editedData2);
    setIsEditMode2(false);
  };

  const handleCancel2 = () => {
    setEditedData2(initialRegion2Data);
    setIsEditMode2(false);
  };

  const columns2 = useMemo(() => [
    { key: "Region2ID", header: "ID" },
    { key: "시도", header: "시도" },
    { key: "시군구", header: "시군구" },
    {
      key: "주기세차(일)",
      header: "주기세차(일)",
      render: (row) => isEditMode2 ? (
        <Input
          type="number"
          value={row["주기세차(일)"]}
          onChange={(e) => handleUpdateData2(row.Region2ID, "주기세차(일)", parseInt(e.target.value, 10) || 0)}
          className="w-24"
        />
      ) : ( row["주기세차(일)"] ),
    },
    {
      key: "라이트세차",
      header: "라이트세차",
      render: (row) => isEditMode2 ? (
        <Select
          value={row["라이트세차"]}
          onChange={(e) => handleUpdateData2(row.Region2ID, "라이트세차", e.target.value)}
          className="w-20"
        >
          <option value="Y">Y</option>
          <option value="N">N</option>
        </Select>
              ) : ( <Badge tone={row["라이트세차"] === 'Y' ? 'ok' : 'default'}>{row["라이트세차"]}</Badge> ),
          },
        ], [isEditMode2]);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          <Select
            value={filterSido}
            onChange={(e) => setFilterSido(e.target.value)}
            className="w-32"
          >
            {sidoOptions.map(sido => <option key={sido} value={sido}>{sido === 'all' ? '전체 시도' : sido}</option>)}
          </Select>
          <Input
            placeholder="시군구 검색 (쉼표/공백으로 구분)"
            value={searchSigungu}
            onChange={(e) => setSearchSigungu(e.target.value)}
            className="w-64"
          />
        </div>
        <div className="flex gap-2">
          {isEditMode2 ? (
            <>
              <Button variant="secondary" onClick={handleCancel2}>취소</Button>
              <Button onClick={handleSave2}>저장</Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsEditMode2(true)}>수정</Button>
          )}
        </div>
      </div>
      <DataTable 
        columns={columns2} 
        rows={currentData} 
        rowKey={(row) => row.Region2ID} 
      />
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
};


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
        <TabsContent value="region1" currentValue={activeTab}>
          <Region1PolicyTab />
        </TabsContent>
        <TabsContent value="region2" currentValue={activeTab}>
          <Region2PolicyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
