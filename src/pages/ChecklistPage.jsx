import React, { useState, useMemo } from 'react';
import { Camera, ChevronLeft, ChevronRight, CheckCircle, ArrowLeft, Car, Droplet, Sparkles, ClipboardList, Send } from 'lucide-react';
import { getPreWashPhotos, getPostWashPhotos, getChecklistItems, mockOrderTypes } from '../lib/checklistData.js';

// --- UI Components (Inspired by project's existing style) ---

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Button = React.forwardRef(({ className, variant = "default", size = "md", ...props }, ref) => {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    default: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm",
    ghost: "bg-transparent text-[#172B4D] hover:bg-[#F4F5F7]",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" };
  return <button className={cn(base, variants[variant], sizes[size], className)} ref={ref} {...props} />;
});

const ToggleButton = ({ options, value, onChange, className }) => {
  const gridCols = options.length > 3 ? 'grid-cols-3' : `grid-cols-${options.length}`;
  return (
    <div className={cn(`grid ${gridCols} gap-2`, className)}>
      {options.map(option => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            "w-full text-center px-3 py-2 text-sm font-semibold rounded-lg border transition-colors",
            value === option
              ? "bg-[#0052CC] text-white border-[#0052CC]"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

const MultiSelectButton = ({ options, value = [], onChange, className }) => {
  const gridCols = options.length > 2 ? 'grid-cols-3' : `grid-cols-${options.length}`;
  
  const handleToggle = (option) => {
    if (value.includes(option)) {
      onChange(value.filter(item => item !== option));
    } else {
      onChange([...value, option]);
    }
  };

  return (
    <div className={cn(`grid ${gridCols} gap-2`, className)}>
      {options.map(option => (
        <button
          key={option}
          onClick={() => handleToggle(option)}
          className={cn(
            "w-full text-center px-3 py-2 text-sm font-semibold rounded-lg border transition-colors",
            value.includes(option)
              ? "bg-[#0052CC] text-white border-[#0052CC]"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

const Dropdown = ({ options, value, onChange, placeholder, className }) => (
  <select
    value={value || ""}
    onChange={(e) => onChange(e.target.value)}
    className={cn("w-full p-2 border border-slate-300 rounded-lg bg-white", className)}
  >
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {options.map(option => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
);

const TireInputGroup = ({ type, locations, options, value = {}, onChange }) => {
  const handleSingleUpdate = (location, val) => {
    onChange({ ...value, [location]: val });
  };

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      {locations.map(location => (
        <div key={location}>
          <label className="text-xs font-medium text-slate-500">{location}</label>
          {type === 'tires-text' && (
            <input
              type="text"
              placeholder="0.0"
              value={value[location] || ''}
              onChange={(e) => handleSingleUpdate(location, e.target.value)}
              className="w-full p-2 mt-1 border border-slate-300 rounded-lg"
            />
          )}
          {type === 'tires-toggle' && (
            <div className="mt-1">
              <ToggleButton
                options={options}
                value={value[location]}
                onChange={(val) => handleSingleUpdate(location, val)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const PhotoUpload = ({ label, completed }) => (
    <div className={cn(
        "flex items-center justify-between p-4 rounded-lg border",
        completed ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
    )}>
        <div className="flex items-center">
            {completed ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 mr-3" />
            ) : (
                <div className="w-5 h-5 bg-slate-200 rounded-full mr-3" />
            )}
            <span className={cn("text-sm font-medium", completed ? "text-slate-500 line-through" : "text-slate-800")}>
                {label}
            </span>
        </div>
        <Button variant="secondary" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            촬영
        </Button>
    </div>
);


// --- Page Step Components ---

const steps = [
  { name: '오더 확인', icon: Car },
  { name: '세차 전 사진', icon: Camera },
  { name: '세차 중', icon: Droplet },
  { name: '세차 후 사진', icon: Sparkles },
  { name: '점검 항목', icon: ClipboardList },
  { name: '제출', icon: Send },
];

const OrderConfirmationStep = ({ order }) => (
  <div className="p-4 space-y-4">
    <h2 className="text-xl font-bold text-slate-800">오더 정보를 확인해주세요.</h2>
    <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">차량</span>
        <span className="text-sm font-bold text-slate-800">{order.vehicle} ({order.licensePlate})</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">점검 유형</span>
        <span className="text-sm font-bold text-slate-800">{order.inspectionType} ({order.orderType})</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">세차 유형</span>
        <span className="text-sm font-bold text-slate-800">{order.washType}</span>
      </div>
       <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">파트너 유형</span>
        <span className="text-sm font-bold text-slate-800">{order.partnerType}</span>
      </div>
       <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">위치</span>
        <span className="text-sm font-bold text-slate-800">{order.location}</span>
      </div>
    </div>
    <p className="text-xs text-slate-500 text-center pt-4">
      점검 명세서에 따른 {order.inspectionType}, {order.orderType}, {order.washType}, {order.partnerType} 오더입니다.
    </p>
  </div>
);

const PreWashPhotoStep = ({ order }) => {
    const photos = getPreWashPhotos(order);
    
    if (photos.length === 0) {
        return (
            <div className="p-4 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800">세차 전 사진 촬영 없음</h2>
                <p className="text-sm text-slate-500 mt-2">{order.washType} 유형은 세차 전 사진 촬영이 필요하지 않습니다.</p>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-3">
            <h2 className="text-xl font-bold text-slate-800">세차 전 사진 촬영</h2>
            <p className="text-sm text-slate-500">세차 전 차량 상태를 촬영해주세요. 총 {photos.length}장이 필요합니다.</p>
            <div className="space-y-2 pt-2">
                {photos.map((photo, index) => (
                    <PhotoUpload key={index} label={photo} completed={index < 0} /> // Initially not completed
                ))}
            </div>
        </div>
    );
};

const WashingStep = () => (
  <div className="p-4 text-center">
    <Droplet className="w-16 h-16 text-[#0052CC] mx-auto mb-4 animate-pulse" />
    <h2 className="text-xl font-bold text-slate-800">세차 작업 진행</h2>
    <p className="text-sm text-slate-500 mt-2">세차 유형에 맞게 작업을 진행한 후 다음 단계로 이동해주세요.</p>
  </div>
);

const PostWashPhotoStep = ({ order }) => {
    const { exterior: exteriorPhotos, interior: interiorPhotos } = getPostWashPhotos(order);
    
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">세차 후 사진 촬영</h2>
            <p className="text-sm text-slate-500">작업 완료 후 결과를 촬영해주세요.</p>
            
            {exteriorPhotos.length > 0 && (
              <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-700 mt-4">외부 ({exteriorPhotos.length}장)</h3>
                  {exteriorPhotos.map((photo, index) => (
                      <PhotoUpload key={`ext-${index}`} label={photo} completed={false} />
                  ))}
              </div>
            )}

            {interiorPhotos.length > 0 && (
              <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-700 mt-4">내부 ({interiorPhotos.length}장)</h3>
                  {interiorPhotos.map((photo, index) => (
                      <PhotoUpload key={`int-${index}`} label={photo} completed={false} />
                  ))}
              </div>
            )}
        </div>
    );
};

const ChecklistStep = ({ order }) => {
    const [checklist, setChecklist] = useState({});
    const handleUpdate = (id, value) => {
        setChecklist(prev => ({...prev, [id]: value}));
    };
    
    const items = getChecklistItems(order.inspectionType);

    const renderInput = (item) => {
      const value = checklist[item.id];
      const onChange = (val) => handleUpdate(item.id, val);

      switch (item.type) {
        case 'number':
          return <input type="number" className="w-full p-2 border border-slate-300 rounded-lg" placeholder={item.placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
        case 'text':
          return <input type="text" className="w-full p-2 border border-slate-300 rounded-lg" placeholder={item.placeholder} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
        case 'textarea':
          return <textarea className="w-full p-2 border border-slate-300 rounded-lg" rows="3" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
        case 'toggle':
          return <ToggleButton options={item.options} value={value} onChange={onChange} />;
        case 'multiselect':
          return <MultiSelectButton options={item.options} value={value} onChange={onChange} />;
        case 'dropdown':
          return <Dropdown options={item.options} value={value} onChange={onChange} placeholder="선택..." />;
        case 'tires-text':
        case 'tires-toggle':
          return <TireInputGroup type={item.type} locations={item.locations} options={item.options} value={value} onChange={onChange} />;
        default:
          return <p className="text-sm text-red-500">Unsupported input type: {item.type}</p>
      }
    }

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">점검 항목 입력</h2>
            <p className="text-sm text-slate-500">{order.inspectionType}유형 점검 항목을 확인하고 상태를 입력해주세요.</p>

            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-5">
                {items.map(item => (
                    <div key={item.id}>
                        <label className="text-sm font-semibold text-slate-600 mb-2 block">{item.label}</label>
                        {renderInput(item)}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SubmitStep = ({ onFinish }) => (
  <div className="p-4 text-center">
    <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
    <h2 className="text-xl font-bold text-slate-800">제출 준비 완료</h2>
    <p className="text-sm text-slate-500 mt-2 mb-6">모든 단계가 완료되었습니다. 작업 내용을 최종 제출하시겠습니까?</p>
    <Button size="lg" className="w-full" onClick={onFinish}>
      <Send className="w-5 h-5 mr-2" />
      최종 제출하기
    </Button>
  </div>
);

const SuccessScreen = ({ onReset }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-800">작업 완료</h2>
        <p className="text-base text-slate-500 mt-2 mb-8">세차 및 점검 내용이 성공적으로 제출되었습니다.</p>
        <Button size="lg" variant="secondary" onClick={onReset}>
            새 작업 시작하기
        </Button>
    </div>
);


// --- Main Page Component ---
export default function ChecklistPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [orderKey, setOrderKey] = useState(mockOrderTypes[0].key);
  
  const currentOrder = useMemo(() => {
    return mockOrderTypes.find(o => o.key === orderKey) || mockOrderTypes[0];
  }, [orderKey]);

  const goToNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const goToPrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  
  const handleFinish = () => setIsFinished(true);
  const handleReset = () => {
    setCurrentStep(0);
    setIsFinished(false);
  }

  const StepComponent = useMemo(() => {
    // Reset checklist state when order changes
    // A bit of a hack, but effective for this prototype structure
    const ChecklistWithReset = () => {
      const [checklist, setChecklist] = useState({});
      
      useEffect(() => {
        setChecklist({});
      }, [orderKey]);

      return <ChecklistStep order={currentOrder} checklist={checklist} setChecklist={setChecklist} />;
    }

    switch (currentStep) {
      case 0: return <OrderConfirmationStep order={currentOrder} />;
      case 1: return <PreWashPhotoStep order={currentOrder} />;
      case 2: return <WashingStep />;
      case 3: return <PostWashPhotoStep order={currentOrder} />;
      case 4: return <ChecklistStep order={currentOrder} />;
      case 5: return <SubmitStep onFinish={handleFinish} />;
      default: return <OrderConfirmationStep order={currentOrder} />;
    }
  }, [currentStep, currentOrder, orderKey]);

  if (isFinished) {
    return (
        <div className="w-full min-h-screen bg-slate-50 flex justify-center items-center">
            <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg" style={{ height: '80vh' }}>
                <SuccessScreen onReset={handleReset} />
            </div>
        </div>
    );
  }

  const stepProgress = `${((currentStep + 1) / steps.length) * 100}%`;
  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="w-full min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="shrink-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 p-4">
            {/* Order Switcher for testing */}
            <div className="flex items-center gap-2 mb-3">
              <label htmlFor="order-select" className="text-xs font-bold text-slate-500">TEST ORDER:</label>
              <select 
                id="order-select" 
                value={orderKey} 
                onChange={(e) => { setOrderKey(e.target.value); setCurrentStep(0); }} 
                className="w-full text-xs p-1 border border-slate-300 rounded"
              >
                {mockOrderTypes.map(order => (
                  <option key={order.key} value={order.key}>
                    {order.inspectionType}형 / {order.orderType} / {order.washType} ({order.partnerType})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <CurrentIcon className="w-6 h-6 text-[#0052CC]"/>
                    <h1 className="text-lg font-bold text-slate-800 ml-2">{steps[currentStep].name}</h1>
                </div>
                <div className="text-sm font-semibold text-slate-500">
                    {currentStep + 1} / {steps.length}
                </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
                <div className="bg-[#0052CC] h-1.5 rounded-full transition-all duration-300" style={{ width: stepProgress }} />
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {StepComponent}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" size="lg" onClick={goToPrev} disabled={currentStep === 0}>
              <ChevronLeft className="w-5 h-5 mr-1" />
              이전
            </Button>
            <Button size="lg" onClick={goToNext} disabled={currentStep === steps.length - 1}>
              {currentStep === steps.length - 2 ? '확인' : '다음'}
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}