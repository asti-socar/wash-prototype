import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';

// ============== UTILITY & UI COMPONENTS ==============
// This project follows a pattern of including UI components directly in the page files.
// To maintain consistency, these components are defined here. They are based on
// the components found in other files like `App.jsx` and `PartnersPage.jsx`.

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className, children }) {
  return <div className={cn("rounded-xl bg-white border border-[#E2E8F0] shadow-[0_2px_4px_rgba(0,0,0,0.02)]", className)}>{children}</div>;
}
function CardHeader({ className, children }) {
  return <div className={cn("p-5 pb-3", className)}>{children}</div>;
}
function CardTitle({ className, children }) {
  return <div className={cn("text-sm font-bold text-[#172B4D]", className)}>{children}</div>;
}
function CardDescription({ className, children }) {
    return <div className={cn("mt-1 text-xs text-[#6B778C]", className)}>{children}</div>;
}
function CardContent({ className, children }) {
  return <div className={cn("p-5 pt-2", className)}>{children}</div>;
}
function Button({ className, variant = "default", size = "md", ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  const variants = {
    default: "bg-[#0052CC] text-white hover:bg-[#0047B3] shadow-sm",
    secondary: "bg-white text-[#172B4D] border border-[#E2E8F0] hover:bg-[#F8FAFC] shadow-sm text-[#334155]",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-3.5 text-sm" };
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
function Input({ className, ...props }) {
  return <input className={cn("h-10 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#172B4D] outline-none transition placeholder:text-[#94A3B8] focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]", className)} {...props} />;
}

function PillTabs({ value, onChange, items }) {
  return (
    <div className="inline-flex rounded-lg bg-[#F4F5F7] p-1 border border-[#DFE1E6]">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={cn(
              "h-8 rounded-md px-3 text-sm transition font-medium",
              active ? "bg-white text-[#0052CC] shadow-sm" : "text-[#6B778C] hover:text-[#172B4D]"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function Chip({ children, onRemove, hasChanged }) {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium border",
        hasChanged ? "bg-blue-100 border-blue-300 text-blue-800" : "bg-[#F4F5F7] border-[#DFE1E6] text-[#172B4D]"
      )}>
        {children}
        {onRemove && (
          <button className="rounded-full p-0.5 hover:bg-[#DFE1E6]" onClick={onRemove} aria-label="remove">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    );
  }

// ============== MAIN PAGE COMPONENT ==============

export default function AIPolicyPage() {
    // === State Management ===
    const [savedLevel, setSavedLevel] = useState(2);
    const [currentLevel, setCurrentLevel] = useState(2);

    const [savedWords, setSavedWords] = useState(['#구토', '#담배']);
    const [currentWords, setCurrentWords] = useState(['#구토', '#담배']);
    const [newWord, setNewWord] = useState('');

    const [hasChanged, setHasChanged] = useState(false);

    // === Derived State ===
    const isLevelChanged = currentLevel !== savedLevel;
    const areWordsChanged = JSON.stringify(savedWords.sort()) !== JSON.stringify(currentWords.sort());
    
    useEffect(() => {
        setHasChanged(isLevelChanged || areWordsChanged);
    }, [isLevelChanged, areWordsChanged]);

    // === Event Handlers ===
    const handleAddWord = () => {
        const trimmedWord = newWord.trim();
        if (trimmedWord && !currentWords.includes(`#${trimmedWord}`)) {
            setCurrentWords(prev => [...prev, `#${trimmedWord}`]);
            setNewWord('');
        }
    };

    const handleRemoveWord = (wordToRemove) => {
        setCurrentWords(prev => prev.filter(word => word !== wordToRemove));
    };

    const handleSave = () => {
        setSavedLevel(currentLevel);
        setSavedWords(currentWords);
        setHasChanged(false);
        // Here you would typically make an API call to save the settings
        alert('정책이 저장되었습니다.');
    };
    
    const handleCancel = () => {
        setCurrentLevel(savedLevel);
        setCurrentWords(savedWords);
        setHasChanged(false);
    }

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div>
                <div className="text-base font-bold text-[#172B4D]">AI 모델 정책 관리</div>
                <div className="mt-1 text-sm text-[#6B778C]">AI 모델의 오더 생성 기준과 고객 피드백 정책을 관리합니다.</div>
            </div>
            <div className="flex items-center gap-2 mt-3 md:mt-0">
                <Button variant="secondary" onClick={handleCancel} disabled={!hasChanged}>
                    취소
                </Button>
                <Button onClick={handleSave} disabled={!hasChanged}>
                    <Save className="mr-2 h-4 w-4" />
                    정책 저장
                </Button>
            </div>
        </div>

      {/* 오염도 레벨 설정 */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>오염도 기반 오더 생성 레벨</CardTitle>
                    <CardDescription>
                        CV 모델이 판별한 오염도 레벨에 따라 세차 오더를 생성합니다. (기본값: Level 2)
                    </CardDescription>
                </div>
                {isLevelChanged && <span className="text-sm font-semibold text-blue-600">변경됨</span>}
            </div>
        </CardHeader>
        <CardContent>
          <PillTabs
            value={currentLevel}
            onChange={(level) => setCurrentLevel(level)}
            items={[
              { value: 0, label: "Level 0" },
              { value: 1, label: "Level 1" },
              { value: 2, label: "Level 2" },
              { value: 3, label: "Level 3" },
            ]}
          />
           <div className="mt-3 text-xs text-slate-500">
            현재 설정: <strong className={cn("font-bold", isLevelChanged ? "text-blue-600" : "text-slate-600")}>Level {currentLevel}</strong>. 
            Level {currentLevel} 이상의 오염도를 가진 차량에 대해 오더가 생성됩니다.
            {isLevelChanged && ` (기존: Level ${savedLevel})`}
          </div>
        </CardContent>
      </Card>

      {/* 피드백 단어 사전 */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>긴급 오더 피드백 단어 사전</CardTitle>
                    <CardDescription>
                        고객 피드백에 포함된 경우 긴급 세차 오더를 발행할 단어를 설정합니다.
                    </CardDescription>
                </div>
                {areWordsChanged && <span className="text-sm font-semibold text-blue-600">변경됨</span>}
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="단어 추가 (예: 커피, 냄새)"
                            value={newWord}
                            onChange={(e) => setNewWord(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
                        />
                        <Button onClick={handleAddWord} className="shrink-0">
                            <Plus className="mr-2 h-4 w-4" />
                            추가
                        </Button>
                    </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 min-h-[100px]">
                    {currentWords.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {currentWords.map(word => (
                                <Chip 
                                    key={word} 
                                    onRemove={() => handleRemoveWord(word)}
                                    hasChanged={!savedWords.includes(word)}
                                >
                                    {word}
                                </Chip>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-sm text-slate-500 py-2">
                            등록된 단어가 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}