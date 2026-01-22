import React, { useState, useMemo } from 'react';
import { Camera, ChevronLeft, ChevronRight, CheckCircle, ArrowLeft, Car, Droplet, Sparkles, ClipboardList, Send } from 'lucide-react';

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
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "w-full text-center px-4 py-2 text-sm font-semibold rounded-lg border transition-colors",
            value === option.value
              ? "bg-[#0052CC] text-white border-[#0052CC]"
              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          )}
        >
          {option.label}
        </button>
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

const sampleOrder = {
  type: "B유형",
  category: "정규",
  washType: "내외부",
  partnerType: "입고",
  vehicle: "쏘렌토 MQ4",
  licensePlate: "12가 3456",
  location: "서울 A-12 구역"
};

const OrderConfirmationStep = () => (
  <div className="p-4 space-y-4">
    <h2 className="text-xl font-bold text-slate-800">오더 정보를 확인해주세요.</h2>
    <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">차량</span>
        <span className="text-sm font-bold text-slate-800">{sampleOrder.vehicle} ({sampleOrder.licensePlate})</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">점검 유형</span>
        <span className="text-sm font-bold text-slate-800">{sampleOrder.type} ({sampleOrder.category})</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">세차 유형</span>
        <span className="text-sm font-bold text-slate-800">{sampleOrder.washType}</span>
      </div>
       <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">파트너 유형</span>
        <span className="text-sm font-bold text-slate-800">{sampleOrder.partnerType}</span>
      </div>
       <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-500">위치</span>
        <span className="text-sm font-bold text-slate-800">{sampleOrder.location}</span>
      </div>
    </div>
    <p className="text-xs text-slate-500 text-center pt-4">
      점검 명세서 2.1 분류표에 따른 B유형, 정규, 내외부, 입고 오더입니다.
    </p>
  </div>
);

const PreWashPhotoStep = () => {
    const photos = ["정면", "운전석 방향 측면", "후면", "조수석 방향 측면", "1열", "2열"];
    return (
        <div className="p-4 space-y-3">
            <h2 className="text-xl font-bold text-slate-800">세차 전 사진 촬영</h2>
            <p className="text-sm text-slate-500">세차 전 차량 상태를 촬영해주세요. 총 {photos.length}장이 필요합니다.</p>
            <div className="space-y-2 pt-2">
                {photos.map((photo, index) => (
                    <PhotoUpload key={index} label={photo} completed={index < 2} />
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

const PostWashPhotoStep = () => {
    const exteriorPhotos = ["워셔액", "전면", "조수석 도어", "조수석 사이드미러", "조수석 앞타이어 트레드", "조수석 뒷도어", "조수석 뒷타이어 트레드", "후면", "트렁크 내부", "운전석 뒷도어", "운전석 뒷타이어 트레드", "운전석 도어", "운전석 사이드 미러", "운전석 앞타이어 트레드"];
    const interiorPhotos = ["조수석 내부", "조수석 발매트", "조수석 뒷좌석 내부", "조수석 뒷좌석 발매트", "조수석 시트 하단", "운전석 뒷좌석 내부", "운전석 뒷좌석 발매트", "운전석 시트 하단", "운전석 내부", "운전석 발매트", "센터페시아", "컵홀더"];
    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">세차 후 사진 촬영</h2>
            <p className="text-sm text-slate-500">작업 완료 후 결과를 촬영해주세요.</p>
            
            <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-700 mt-4">외부 ({exteriorPhotos.length}장)</h3>
                {exteriorPhotos.map((photo, index) => (
                    <PhotoUpload key={`ext-${index}`} label={photo} completed={false} />
                ))}
            </div>

            <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-700 mt-4">내부 ({interiorPhotos.length}장)</h3>
                {interiorPhotos.map((photo, index) => (
                    <PhotoUpload key={`int-${index}`} label={photo} completed={false} />
                ))}
            </div>
        </div>
    );
};

const ChecklistStep = () => {
    const [checklist, setChecklist] = useState({});
    const handleUpdate = (key, value) => {
        setChecklist(prev => ({...prev, [key]: value}));
    };
    
    const commonItems = ["유리창", "배터리전압", "안전삼각대", "차량용 소화기", "워셔액통", "발판매트", "시동불가", "본넷"];
    const bTypeItems = ["방향제", "와이퍼", "시트/폴딩"];

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">점검 항목 입력</h2>
            <p className="text-sm text-slate-500">B유형 점검 항목을 확인하고 상태를 입력해주세요.</p>

            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-5">
                <h3 className="text-base font-bold text-slate-700">공통 점검 항목</h3>
                {commonItems.map(item => (
                    <div key={item}>
                        <label className="text-sm font-semibold text-slate-600 mb-2 block">{item}</label>
                        <ToggleButton options={[{label: '정상', value: 'ok'}, {label: '이상', value: 'bad'}]} value={checklist[item]} onChange={(val) => handleUpdate(item, val)} />
                    </div>
                ))}
            </div>

            <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-5">
                <h3 className="text-base font-bold text-slate-700">B유형 추가 항목</h3>
                 {bTypeItems.map(item => (
                    <div key={item}>
                        <label className="text-sm font-semibold text-slate-600 mb-2 block">{item}</label>
                        <ToggleButton options={[{label: '정상', value: 'ok'}, {label: '분실/이상', value: 'bad'}]} value={checklist[item]} onChange={(val) => handleUpdate(item, val)} />
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

  const goToNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const goToPrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));
  
  const handleFinish = () => setIsFinished(true);
  const handleReset = () => {
    setCurrentStep(0);
    setIsFinished(false);
  }

  const StepComponent = useMemo(() => {
    switch (currentStep) {
      case 0: return <OrderConfirmationStep />;
      case 1: return <PreWashPhotoStep />;
      case 2: return <WashingStep />;
      case 3: return <PostWashPhotoStep />;
      case 4: return <ChecklistStep />;
      case 5: return <SubmitStep onFinish={handleFinish} />;
      default: return <OrderConfirmationStep />;
    }
  }, [currentStep]);

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