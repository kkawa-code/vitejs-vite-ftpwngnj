import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";

// ============================================================================
// 型定義
// ============================================================================

type TimeSlot = 
  | { type: 'full' }
  | { type: 'half'; period: 'AM' | 'PM' }
  | { type: 'custom'; value: string };

interface StaffAssignment {
  id: string;
  name: string;
  timeSlot: TimeSlot;
  isPlaceholder?: boolean;
}

interface SectionData {
  assignments: StaffAssignment[];
}

interface DayData {
  date: string;
  isHoliday: boolean;
  holidayName?: string;
  sections: Record<string, SectionData>;
}

interface Warning {
  type: 'error' | 'warning' | 'info';
  message: string;
  section?: string;
}

interface Rules {
  staffList: string[];
  receptionStaffList: string[];
  supportStaffList: string[];
  supportTargetRooms: string[];
  customHolidays: string[];
  capacity: Record<string, number>;
  priorityRooms: string[];
  fullDayOnlyRooms: string[];
  ngPairs: Array<{ s1: string; s2: string; level: 'hard' | 'soft' }>;
  fixed: Array<{ staff: string; section: string }>;
  forbidden: Array<{ staff: string; sections: string[] }>;
  substitutes: Array<{ target: string[]; subs: string[]; section: string }>;
  pushOuts: Array<{ s1: string; s2: string; triggerSection: string; targetSections: string[] }>;
  emergencies: Array<{
    threshold: number;
    type: 'role_assign' | 'kenmu' | 'clear' | 'change_capacity';
    role?: string;
    section?: string;
    s1?: string;
    s2?: string[];
    newCapacity?: number;
  }>;
  kenmuPairs: Array<{ s1: string; s2: string }>;
  lateShifts: Array<{ section: string; lateTime: string; dayEndTime: string }>;
  helpThreshold: number;
  lunchBaseCount: number;
  lunchSpecialDays: Array<{ day: string; count: number }>;
  lunchConditional: Array<{ section: string; min: number; out: number }>;
  lunchPrioritySections: string[];
  lunchLastResortSections: string[];
}

interface MonthlyAssignment {
  CT: string[];
  MRI: string[];
  治療: string[];
  治療サブ優先: string[];
  治療サブ: string[];
  RI: string[];
  RIサブ: string[];
  MMG: string[];
  透析後胸部: string[];
  受付: string[];
  受付ヘルプ: string[];
}

// ============================================================================
// 定数
// ============================================================================

const SECTIONS = [
  "明け", "入り", "土日休日代休", "不在", "待機", "CT", "MRI", "RI",
  "1号室", "2号室", "3号室", "5号室", "透視（6号）", "透視（11号）",
  "MMG", "骨塩", "パノラマCT", "ポータブル", "DSA", "透析後胸部", "治療",
  "検像", "昼当番", "受付", "受付ヘルプ"
] as const;

const REST_SECTIONS = ["明け", "入り", "土日休日代休", "不在"];
const ASSIGNABLE_SECTIONS = SECTIONS.filter(s => !REST_SECTIONS.includes(s));
const ROOM_SECTIONS = SECTIONS.filter(s => 
  !["明け", "入り", "土日休日代休", "不在", "待機", "昼当番"].includes(s)
);

const SECTION_GROUPS = [
  { title: "休務・夜勤", color: "#94a3b8", sections: ["明け", "入り", "土日休日代休", "不在"] },
  { title: "モダリティ", color: "#3b82f6", sections: ["CT", "MRI", "RI", "治療"] },
  { title: "一般撮影", color: "#10b981", sections: ["MMG", "1号室", "2号室", "3号室", "5号室", "透視（6号）", "透視（11号）", "骨塩", "パノラマCT", "ポータブル", "DSA", "検像", "受付", "受付ヘルプ", "昼当番"] },
  { title: "待機", color: "#f59e0b", sections: ["待機", "透析後胸部"] }
] as const;

const TIME_OPTIONS = [
  { value: '', label: '終日' },
  { value: 'AM', label: 'AM' },
  { value: 'PM', label: 'PM' },
  { value: '12:15〜13:00', label: '12:15〜13:00' },
  { value: '17:00〜19:00', label: '17:00〜19:00' },
  { value: '17:00〜22:00', label: '17:00〜22:00' },
  { value: '17:00〜', label: '17:00〜' },
  { value: '〜17:00', label: '〜17:00' },
];

const FALLBACK_HOLIDAYS: Record<string, string> = {
  "2025-01-01": "元日",
  "2025-01-13": "成人の日",
  "2025-02-11": "建国記念の日",
  "2025-02-23": "天皇誕生日",
  "2025-02-24": "振替休日",
  "2025-03-20": "春分の日",
  "2025-04-29": "昭和の日",
  "2025-05-03": "憲法記念日",
  "2025-05-04": "みどりの日",
  "2025-05-05": "こどもの日",
  "2025-05-06": "振替休日",
  "2026-01-01": "元日",
  "2026-01-12": "成人の日"
};

const DEFAULT_RULES: Rules = {
  staffList: [],
  receptionStaffList: [],
  supportStaffList: [],
  supportTargetRooms: ["1号室", "2号室", "5号室", "パノラマCT"],
  customHolidays: [],
  capacity: { CT: 3, MRI: 3, 治療: 3, RI: 1, 受付: 2 },
  priorityRooms: ["受付", "治療", "CT", "MRI", "RI", "ポータブル", "2号室", "5号室", "透視（6号）", "透視（11号）", "MMG", "1号室", "3号室", "DSA", "検像", "骨塩", "パノラマCT", "透析後胸部", "受付ヘルプ"],
  fullDayOnlyRooms: ["DSA", "検像", "骨塩", "パノラマCT"],
  ngPairs: [],
  fixed: [],
  forbidden: [],
  substitutes: [],
  pushOuts: [],
  emergencies: [],
  kenmuPairs: [],
  lateShifts: [],
  helpThreshold: 17,
  lunchBaseCount: 3,
  lunchSpecialDays: [{ day: "火", count: 4 }],
  lunchConditional: [{ section: "CT", min: 4, out: 1 }],
  lunchPrioritySections: ["RI", "1号室", "2号室", "3号室", "5号室", "CT"],
  lunchLastResortSections: ["治療"]
};

// ============================================================================
// ユーティリティ関数
// ============================================================================

const pad = (n: number) => String(n).padStart(2, '0');

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatDateDisplay = (date: Date): string => {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return `${date.getMonth() + 1}/${date.getDate()}(${days[date.getDay()]})`;
};

const getMondayOfWeek = (date: Date = new Date()): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return formatDate(monday);
};

const parseStaffList = (text: string): string[] => {
  if (!text) return [];
  return text
    .split(/[,、\n]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => {
      const match = s.match(/^(.*?)[\(（](.*?)[\)）]$/);
      return match ? match[1].trim() : s;
    });
};

const getCoreName = (fullName: string): string => {
  return fullName.replace(/\(.*?\)/g, '').replace(/（.*?）/g, '').trim();
};

const formatTimeSlot = (timeSlot: TimeSlot): string => {
  if (timeSlot.type === 'full') return '';
  if (timeSlot.type === 'half') return `(${timeSlot.period})`;
  return `(${timeSlot.value})`;
};

const parseTimeSlot = (text: string): TimeSlot => {
  const match = text.match(/\((.*?)\)/);
  if (!match) return { type: 'full' };
  const value = match[1];
  if (value === 'AM' || value === 'PM') return { type: 'half', period: value };
  return { type: 'custom', value };
};

// ============================================================================
// スタイル定数
// ============================================================================

const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #1e293b;
    -webkit-font-smoothing: antialiased;
    padding: 2rem 1rem;
  }
  
  @media print {
    body { background: white; padding: 0; }
    .no-print { display: none !important; }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .animate-slide-in { animation: slideIn 0.3s ease-out; }
  .animate-fade-in { animation: fadeIn 0.2s ease-out; }
  .animate-scale-in { animation: scaleIn 0.2s ease-out; }
`;

// ============================================================================
// コンポーネント: Badge
// ============================================================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'placeholder';
  size?: 'sm' | 'md';
  onRemove?: () => void;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  onRemove,
  className = ''
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    placeholder: 'bg-yellow-50 text-yellow-800 border-yellow-300',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };
  
  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full border font-semibold
      transition-all hover:shadow-sm
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 hover:bg-black/10 rounded-full p-0.5 transition-colors"
          type="button"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
};

// ============================================================================
// コンポーネント: Card
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`
      bg-white rounded-xl border border-slate-200 shadow-sm
      ${hover ? 'transition-all hover:shadow-md hover:border-slate-300' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

// ============================================================================
// コンポーネント: Button
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  children, 
  className = '',
  disabled,
  ...props 
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-all duration-200 whitespace-nowrap
        ${variants[variant]} ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm active:scale-95'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// ============================================================================
// コンポーネント: StaffPicker
// ============================================================================

interface StaffPickerProps {
  availableStaff: string[];
  onSelect: (staff: string) => void;
  placeholder?: string;
}

const StaffPicker: React.FC<StaffPickerProps> = ({ 
  availableStaff, 
  onSelect,
  placeholder = "スタッフを追加"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filteredStaff = useMemo(() => {
    if (!search) return availableStaff;
    return availableStaff.filter(s => 
      s.toLowerCase().includes(search.toLowerCase())
    );
  }, [availableStaff, search]);
  
  const handleSelect = (staff: string) => {
    onSelect(staff);
    setIsOpen(false);
    setSearch('');
  };
  
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-slate-400 hover:text-slate-600 border border-dashed border-slate-300 hover:border-slate-400 rounded-full px-3 py-1 transition-colors"
      >
        + {placeholder}
      </button>
      
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-50 min-w-[200px] animate-scale-in">
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="検索..."
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-md outline-none focus:border-blue-400"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredStaff.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-400 text-center">
                該当なし
              </div>
            ) : (
              filteredStaff.map(staff => (
                <button
                  key={staff}
                  type="button"
                  onClick={() => handleSelect(staff)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 rounded transition-colors"
                >
                  {staff}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// コンポーネント: SectionEditor
// ============================================================================

interface SectionEditorProps {
  sectionId: string;
  data: SectionData;
  availableStaff: string[];
  capacity?: number;
  onUpdate: (data: SectionData) => void;
  monthlyStaff?: string[];
  noTime?: boolean;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  sectionId,
  data,
  availableStaff,
  capacity,
  onUpdate,
  monthlyStaff = [],
  noTime = false,
}) => {
  const handleAddStaff = (staffName: string) => {
    const newAssignment: StaffAssignment = {
      id: `${Date.now()}-${Math.random()}`,
      name: staffName,
      timeSlot: { type: 'full' },
    };
    
    onUpdate({
      ...data,
      assignments: [...data.assignments, newAssignment],
    });
  };
  
  const handleRemove = (id: string) => {
    onUpdate({
      ...data,
      assignments: data.assignments.filter(a => a.id !== id),
    });
  };
  
  const handleTimeChange = (id: string, timeSlot: TimeSlot) => {
    onUpdate({
      ...data,
      assignments: data.assignments.map(a =>
        a.id === id ? { ...a, timeSlot } : a
      ),
    });
  };
  
  return (
    <Card hover className="p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-sm text-slate-700">{sectionId}</h4>
        {capacity && capacity > 0 && (
          <Badge variant={data.assignments.length >= capacity ? 'success' : 'default'} size="sm">
            {data.assignments.length} / {capacity}
          </Badge>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {data.assignments.map(assignment => {
          const isMonthly = monthlyStaff.includes(assignment.name);
          
          return (
            <div key={assignment.id} className="flex items-center gap-1">
              <Badge
                variant={assignment.isPlaceholder ? 'placeholder' : isMonthly ? 'primary' : 'default'}
                onRemove={() => handleRemove(assignment.id)}
              >
                <span>{assignment.name}</span>
                {!noTime && (
                  <select
                    value={formatTimeSlot(assignment.timeSlot).replace(/[()]/g, '')}
                    onChange={e => {
                      const value = e.target.value;
                      let timeSlot: TimeSlot;
                      if (!value) timeSlot = { type: 'full' };
                      else if (value === 'AM' || value === 'PM') timeSlot = { type: 'half', period: value };
                      else timeSlot = { type: 'custom', value };
                      handleTimeChange(assignment.id, timeSlot);
                    }}
                    className="bg-transparent border-none outline-none text-xs font-bold cursor-pointer pr-4"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0 center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1em 1em',
                      paddingRight: '1.2em',
                    }}
                  >
                    {TIME_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </Badge>
            </div>
          );
        })}
        
        <StaffPicker
          availableStaff={availableStaff.filter(s => 
            !data.assignments.some(a => a.name === s)
          )}
          onSelect={handleAddStaff}
        />
      </div>
    </Card>
  );
};

// ============================================================================
// メインアプリケーション
// ============================================================================

export default function ShiftApp() {
  // State
  const [targetMonday, setTargetMonday] = useState(getMondayOfWeek());
  const [allDays, setAllDays] = useState<Record<string, DayData>>({});
  const [rules, setRules] = useState<Rules>(DEFAULT_RULES);
  const [monthlyAssignment, setMonthlyAssignment] = useState<MonthlyAssignment>({
    CT: [], MRI: [], 治療: [], 治療サブ優先: [], 治療サブ: [],
    RI: [], RIサブ: [], MMG: [], 透析後胸部: [], 受付: [], 受付ヘルプ: []
  });
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [nationalHolidays, setNationalHolidays] = useState(FALLBACK_HOLIDAYS);
  const [history, setHistory] = useState<Record<string, DayData>[]>([]);
  
  // 祝日データ取得
  useEffect(() => {
    fetch('https://holidays-jp.github.io/api/v1/date.json')
      .then(res => res.json())
      .then(data => setNationalHolidays(prev => ({ ...prev, ...data })))
      .catch(err => console.error('Failed to fetch holidays:', err));
  }, []);
  
  // LocalStorage
  useEffect(() => {
    const savedDays = localStorage.getItem('shift-days');
    const savedRules = localStorage.getItem('shift-rules');
    const savedMonthly = localStorage.getItem('shift-monthly');
    
    if (savedDays) {
      try {
        setAllDays(JSON.parse(savedDays));
      } catch (e) {
        console.error('Failed to parse saved days:', e);
      }
    }
    
    if (savedRules) {
      try {
        setRules({ ...DEFAULT_RULES, ...JSON.parse(savedRules) });
      } catch (e) {
        console.error('Failed to parse saved rules:', e);
      }
    }
    
    if (savedMonthly) {
      try {
        setMonthlyAssignment(JSON.parse(savedMonthly));
      } catch (e) {
        console.error('Failed to parse saved monthly:', e);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('shift-days', JSON.stringify(allDays));
  }, [allDays]);
  
  useEffect(() => {
    localStorage.setItem('shift-rules', JSON.stringify(rules));
  }, [rules]);
  
  useEffect(() => {
    localStorage.setItem('shift-monthly', JSON.stringify(monthlyAssignment));
  }, [monthlyAssignment]);
  
  // 週データ生成
  const weekDays = useMemo(() => {
    const [year, month, day] = targetMonday.split('-').map(Number);
    const monday = new Date(year, month - 1, day);
    
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(monday);
      date.setDate(date.getDate() + i);
      const dateStr = formatDate(date);
      
      const holidayName = nationalHolidays[dateStr] || 
        (rules.customHolidays.includes(dateStr) ? '休診日' : undefined);
      
      return {
        date: dateStr,
        display: formatDateDisplay(date),
        isHoliday: !!holidayName,
        holidayName,
        data: allDays[dateStr] || {
          date: dateStr,
          isHoliday: !!holidayName,
          holidayName,
          sections: Object.fromEntries(
            SECTIONS.map(s => [s, { assignments: [] }])
          ),
        },
      };
    });
  }, [targetMonday, allDays, nationalHolidays, rules.customHolidays]);
  
  // 選択日
  const currentDay = useMemo(() => {
    if (!selectedDate) return weekDays[0];
    return weekDays.find(d => d.date === selectedDate) || weekDays[0];
  }, [weekDays, selectedDate]);
  
  useEffect(() => {
    if (!selectedDate || !weekDays.find(d => d.date === selectedDate)) {
      setSelectedDate(weekDays[0].date);
    }
  }, [weekDays, selectedDate]);
  
  // スタッフリスト
  const allStaff = useMemo(() => {
    return Array.from(new Set([
      ...parseStaffList(rules.staffList.join(',')),
      ...parseStaffList(rules.receptionStaffList.join(',')),
    ]));
  }, [rules.staffList, rules.receptionStaffList]);
  
  // 更新処理
  const updateSection = useCallback((date: string, sectionId: string, data: SectionData) => {
    setHistory(prev => [...prev, allDays].slice(-20));
    
    setAllDays(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        date,
        isHoliday: currentDay.isHoliday,
        holidayName: currentDay.holidayName,
        sections: {
          ...prev[date]?.sections,
          [sectionId]: data,
        },
      },
    }));
  }, [allDays, currentDay]);
  
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    setAllDays(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
  }, [history]);
  
  // エクスポート/インポート
  const handleExport = useCallback(() => {
    const data = {
      days: allDays,
      rules,
      monthly: monthlyAssignment,
      version: 2,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shift-${targetMonday}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [allDays, rules, monthlyAssignment, targetMonday]);
  
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.days) setAllDays(data.days);
        if (data.rules) setRules({ ...DEFAULT_RULES, ...data.rules });
        if (data.monthly) setMonthlyAssignment(data.monthly);
        alert('データを読み込みました');
      } catch (err) {
        alert('ファイルの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);
  
  // UI
  return (
    <>
      <style>{globalStyle}</style>
      
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <Card className="p-6 mb-6 animate-slide-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">
                勤務割付システム
              </h1>
              <p className="text-sm text-slate-500">
                週間シフト管理・自動割当
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="week"
                value={targetMonday}
                onChange={e => setTargetMonday(getMondayOfWeek(new Date(e.target.value)))}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold"
              />
              
              <Button variant="primary" size="md" onClick={handleExport}>
                💾 保存
              </Button>
              
              <label>
                <Button variant="secondary" size="md" as="span">
                  📂 読込
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
              
              <Button variant="secondary" size="md" onClick={() => window.print()}>
                🖨️ 印刷
              </Button>
              
              <Button 
                variant="ghost" 
                size="md" 
                onClick={handleUndo}
                disabled={history.length === 0}
              >
                ↩️ 戻る
              </Button>
            </div>
          </div>
        </Card>
        
        {/* 週間一覧 */}
        <Card className="p-6 mb-6 overflow-x-auto animate-fade-in">
          <h2 className="text-lg font-bold text-slate-800 mb-4">週間一覧</h2>
          
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 bg-slate-50 z-10 border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 text-left">
                  区分
                </th>
                {weekDays.map(day => (
                  <th
                    key={day.date}
                    className={`border border-slate-200 px-4 py-2 text-sm font-bold text-center ${
                      day.isHoliday ? 'text-red-600' : 'text-slate-700'
                    }`}
                  >
                    <div>{day.display}</div>
                    {day.isHoliday && (
                      <div className="text-xs text-red-500 mt-1">
                        🎌 {day.holidayName}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((section, idx) => (
                <tr key={section} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="sticky left-0 z-10 border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 bg-inherit">
                    {section}
                  </td>
                  {weekDays.map(day => (
                    <td
                      key={day.date}
                      className="border border-slate-200 px-4 py-2 text-sm text-slate-600"
                    >
                      {!day.isHoliday && day.data.sections[section]?.assignments.map(a => 
                        `${a.name}${formatTimeSlot(a.timeSlot)}`
                      ).join('、')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        
        {/* 日別編集 */}
        <Card className="p-6 animate-fade-in">
          {/* タブ */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {weekDays.map(day => (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  px-6 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all
                  ${selectedDate === day.date 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : day.isHoliday
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }
                `}
              >
                {day.display}
                {day.isHoliday && ' 🎌'}
              </button>
            ))}
          </div>
          
          {/* 編集エリア */}
          {currentDay.isHoliday ? (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">🎌</div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                {currentDay.holidayName}
              </h3>
              <p className="text-slate-500">
                この日は祝日・休診日のため、シフトは入力できません
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {SECTION_GROUPS.map(group => (
                <div key={group.title}>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-1 h-6 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <h3 className="text-lg font-bold text-slate-800">
                      {group.title}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {group.sections.map(section => (
                      <SectionEditor
                        key={section}
                        sectionId={section}
                        data={currentDay.data.sections[section] || { assignments: [] }}
                        availableStaff={allStaff}
                        capacity={rules.capacity[section]}
                        onUpdate={(data) => updateSection(currentDay.date, section, data)}
                        noTime={REST_SECTIONS.includes(section) || section === '昼当番'}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
