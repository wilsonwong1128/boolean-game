import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, RefreshCw, BookOpen, ShieldAlert, MonitorPlay, FileText, Save, Cpu, Menu, X, AlertTriangle, BarChart2, Filter } from 'lucide-react';

// V5.1 完美排版題庫
const NEW_TASKS = [
  {
    level: 1, title: "Task A：邏輯代數化簡 (24/25 Sem 2 Q1)", isBoss: false,
    steps: [
      { currentExpression: "A'BC + AB'C' + A'B'C' + AB'C", focus: "A'B'C' + AB'C'", question: "根據 24/25 Past Paper，第一步先處理中間兩項，抽 B'C' 出嚟結果係？", options: ["A'B'C", "B'C'", "A'", "AB'"], correct: "B'C'", explanation: "A'B'C' + AB'C' 抽 B'C' 出來，變成 B'C'(A' + A) = B'C'(1) = B'C'。" },
      { currentExpression: "A'BC + B'C' + AB'C", focus: "AB'C", question: "第二步：留意原本算式有 A'B'C' 同 AB'C'，其實 AB'C' 亦可以同第四項 AB'C 合併 (重複使用法)。AB'C' + AB'C 抽 AB' 出嚟會變成？", options: ["AB'", "AC", "B'C", "A'B'"], correct: "AB'", explanation: "AB'C' + AB'C = AB'(C' + C) = AB'。將一個項重複使用去消除其他項，係拆題神技！" },
      { currentExpression: "A'BC + B'C' + AB'", focus: "全部", question: "第三步：結合結果，第一項 A'BC 無得再進一步抽。最終答案係？", options: ["A'BC + B'C' + AB'", "A + B + C", "B'C' + AB'", "1"], correct: "A'BC + B'C' + AB'", explanation: "完美擊殺！呢條就係 Past Paper 嘅滿分答案。" }
    ]
  },
  {
    level: 2, title: "Task B：極限化簡 Boss 戰 (25/26 Sem 1 Q1)", isBoss: true,
    steps: [
      { currentExpression: "a'cd' + abc'd' + a'b'c' + a'b'cd' + ab'd'", focus: "a'b'c' + a'b'cd'", question: "最新 25/26 魔王題！先處理標記嘅兩項，抽出 a'b' 後變成 a'b'(c' + cd')。括號內利用 (X' + XY = X' + Y) 定理，展開為咩？", options: ["a'b'c' + a'b'd'", "a'b'c'", "a'b'd'", "a'b'(c'+d)"], correct: "a'b'c' + a'b'd'", explanation: "括號內 c' + cd' 變成 c' + d'。乘返 a'b' 入去就得到 a'b'c' + a'b'd'。" },
      { currentExpression: "a'cd' + abc'd' + a'b'c' + a'b'd' + ab'd'", focus: "a'b'd' + ab'd'", question: "第二步：算式多咗一項，但你發現標記嘅兩項有明顯公因式。抽 d' (或 b'd') 出嚟，會得出咩？", options: ["b'd'", "a'd'", "d'", "ab'd'"], correct: "b'd'", explanation: "抽 b'd' 出來：b'd'(a' + a) = b'd'(1) = b'd'。算式成功縮短為 a'cd' + abc'd' + a'b'c' + b'd'！" },
      { currentExpression: "a'cd' + abc'd' + a'b'c' + b'd'", focus: "abc'd' + b'd'", question: "第三步：抽出 d'，變成 d'(abc' + b')。括號內再利用 (X + X'Y = X + Y) 定理，會變成點？", options: ["d'(ac' + b')", "d'(ab + b')", "d'(c' + b')", "d'(a + b')"], correct: "d'(ac' + b')", explanation: "括號內 b' + b(ac') 會變成 b' + ac'。將外面嘅 d' 乘入去，就會得出 b'd' + ac'd'！" },
      { currentExpression: "a'cd' + ac'd' + a'b'c' + b'd'", focus: "全部", question: "最後一步：算式化簡為 a'cd' + ac'd' + a'b'c' + b'd'。仲有冇得再化簡？", options: ["無得再抽，已是最簡", "抽 a'", "抽 d'", "抽 c'"], correct: "無得再抽，已是最簡", explanation: "完美通關！這題結合了分項展開、公因式提取和進階吸收律，是 SEHS3313 極高難度試題！" }
    ]
  },
  {
    level: 3, title: "Task C：進制轉換大雜燴 (22/23 - 24/25 必考)", isBoss: false,
    steps: [
      { currentExpression: "3F3_{16}", focus: "全部", question: "來自 22/23 LA：將十六進制 (Hex) 3F3 轉換為八進制 (Octal)，第一步先轉二進制。3F3 嘅二進制係？", options: ["001111110011_{2}", "1111110011_{2}", "001110110011_{2}", "001111110111_{2}"], correct: "001111110011_{2}", explanation: "3 = 0011, F = 1111, 3 = 0011。組合埋就係 0011 1111 0011_{2}。" },
      { currentExpression: "001111110011_{2}", focus: "全部", question: "將二進制 001111110011_{2} 轉為八進制 (每 3 bits 一組)，結果係？", options: ["1763_{8}", "373_{8}", "1753_{8}", "763_{8}"], correct: "1763_{8}", explanation: "每 3 bits 分組：001 (1), 111 (7), 110 (6), 011 (3)。所以係 1763_{8}。" },
      { currentExpression: "(0.78)_{10}", focus: "全部", question: "來自 23/24 Sem 2：將十進制小數 0.78 轉換為 4-bit 二進制小數。第一步 0.78 \\times 2 = 1.56 (取 1)。繼續乘落去，答案係？", options: ["0.1100_{2}", "0.1011_{2}", "0.1101_{2}", "0.1001_{2}"], correct: "0.1100_{2}", explanation: "0.78 \\times 2 = 1.56 (1); 0.56 \\times 2 = 1.12 (1); 0.12 \\times 2 = 0.24 (0); 0.24 \\times 2 = 0.48 (0)。順序讀取：0.1100_{2}。" }
    ]
  },
  {
    level: 4, title: "Task D：2's Complement 二進制算術 (22/23 Sem 1)", isBoss: true,
    steps: [
      { currentExpression: "A = 94_{10}, B = 45_{10}", focus: "全部", question: "題目要求計算 A - B (9-bit binary)。首先，45_{10} 嘅 9-bit 二進制係幾多？", options: ["000101101_{2}", "000110101_{2}", "000010110_{2}", "001011010_{2}"], correct: "000101101_{2}", explanation: "45 / 2 連續除取餘數得出 101101_{2}。補足 9-bit 就係 000101101_{2}。" },
      { currentExpression: "-45_{10}", focus: "全部", question: "計算 000101101_{2} 嘅 2's complement (二補碼)，代表負數。結果係？", options: ["111010011_{2}", "111010010_{2}", "110101101_{2}", "111101101_{2}"], correct: "111010011_{2}", explanation: "第一步反轉 (1's comp): 111010010_{2}。第二步加 1 (2's comp): 111010011_{2}。" },
      { currentExpression: "001011110_{2} + 111010011_{2}", focus: "全部", question: "將 A (94_{10} = 001011110_{2}) 加上 B 嘅二補碼。相加後放棄最高位溢出 (Overflow) 嘅 1，最終答案係？", options: ["000110001_{2}", "001110001_{2}", "000100001_{2}", "001100011_{2}"], correct: "000110001_{2}", explanation: "相加等於 (1)000110001_{2}。丟棄最左邊嘅 1，得出 000110001_{2} (轉換為十進制剛好是 49_{10}，即 94-45)。" }
    ]
  },
  {
    level: 5, title: "Task E：Canonical Form & POS/SOP", isBoss: false,
    steps: [
      { currentExpression: "F = \\sum m(0,1,3,5,10,12)", focus: "\\sum m", question: "來自 24/25 Sem 2：呢個表示法 (Sigma m) 代表咩意思？", options: ["Sum of Products (SOP) 的 Minterms", "Product of Sums (POS) 的 Maxterms", "Don't care conditions", "Logic Gates 的數量"], correct: "Sum of Products (SOP) 的 Minterms", explanation: "小寫 m 代表 Minterms，Sigma (∑) 代表將佢哋加埋一齊 (OR)，所以係 SOP 形式。" },
      { currentExpression: "F = \\sum m(0,1,3,5)", focus: "全部", question: "如果一個 3-bit 系統嘅 SOP 係 F = \\sum m(0,1,3,5)，咁佢嘅 POS (Maxterms) 表示法會係咩？", options: ["\\prod M(2,4,6,7)", "\\prod M(0,1,3,5)", "\\sum m(2,4,6,7)", "\\prod M(1,3,5,7)"], correct: "\\prod M(2,4,6,7)", explanation: "Maxterms (大寫 M, 符號 ∏) 就係 Minterms 冇包含嘅剩餘數字。3-bit 總共有 0-7，缺咗 2,4,6,7，所以係 \\prod M(2,4,6,7)。" }
    ]
  },
  {
    level: 6, title: "Task F：計數器與 Excitation Table (25/26 Sem 1)", isBoss: true,
    steps: [
      { currentExpression: "0 \\rightarrow 1 \\rightarrow 5 \\rightarrow 7 \\rightarrow 8 \\rightarrow 10 \\rightarrow 15", focus: "15", question: "要設計呢個 Counter，最大數字係 15，需要幾多個 Flip-flops？", options: ["4", "3", "5", "8"], correct: "4", explanation: "15 嘅二進制係 1111_{2}，佔用 4 個 bits，所以必須使用 4 個 Flip-flops。" },
      { currentExpression: "Unused States", focus: "全部", question: "題目指明「consider all states which will not be appeared as don't care state」。即係畫 K-map 時，數字 2, 3 等格仔要填咩？", options: ["X (Don't care)", "0", "1", "留空"], correct: "X (Don't care)", explanation: "將未出現嘅狀態設為 X (Don't care)，可以喺 K-map 盡量圈大啲嘅群組，極大化簡方程式。" }
    ]
  },
  {
    level: 7, title: "Task G：ADC 模數轉換器 (25/26 Sem 1)", isBoss: false,
    steps: [
      { currentExpression: "5-bit Flash ADC, V_{ref} = 5V", focus: "全部", question: "計算 5-bit Flash ADC 嘅 Step size (Resolution voltage)。", options: ["0.156V", "0.2V", "0.312V", "0.1V"], correct: "0.156V", explanation: "Step size = V_{ref} / 2^n = 5 / 32 = 0.15625V。" },
      { currentExpression: "Comparators needed", focus: "全部", question: "Flash ADC 最出名就係速度快但零件多。5-bit 需要幾多個 Comparators？", options: ["31", "32", "16", "64"], correct: "31", explanation: "比較器數量公式為 (2^n) - 1。2^5 - 1 = 32 - 1 = 31 個。" }
    ]
  },
  {
    level: 8, title: "Task H：DAC 數模轉換器", isBoss: true,
    steps: [
      { currentExpression: "Resolution = 0.39\\%", focus: "0.39\\%", question: "來自 23/24 Sem 1 逆向題：如果已知 DAC 嘅 % Resolution 係 0.39%，佢係幾多 bit 嘅 DAC？", options: ["8-bit", "6-bit", "7-bit", "10-bit"], correct: "8-bit", explanation: "% Resolution = 1 / (2^n - 1)。0.0039 = 1 / (2^n - 1) \\rightarrow 2^n - 1 = 256.4 \\rightarrow 2^n \\approx 256 \\rightarrow n = 8。" },
      { currentExpression: "6-bit R-2R DAC, V_{High} = 5V, Input = 011101_{2}", focus: "全部", question: "來自 25/26 Sem 1：輸入 Digital = 011101_{2} (十進制 29)。計算 Output Voltage。", options: ["2.265V", "2.5V", "1.85V", "3.12V"], correct: "2.265V", explanation: "V_{out} = V_{High} \\times (Digital / 2^n) = 5 \\times (29 / 64) = 5 \\times 0.453 = 2.265V。" }
    ]
  },
  {
    level: 9, title: "Task I：功率放大器 Power Amplifiers (24/25 Sem 2)", isBoss: true,
    steps: [
      { currentExpression: "Class AB (Diode Biasing)", focus: "全部", question: "加入 Diode 嘅主要作用係咩？", options: ["消除交越失真 (Crossover Distortion)", "增加放大倍數", "保護電路", "增加效率"], correct: "消除交越失真 (Crossover Distortion)", explanation: "Diode 提供 0.7V 偏壓令電晶體提早微導通，完美解決 Crossover Distortion。" },
      { currentExpression: "V_{CC}=20V, R_{L}=8\\Omega, V_{pp}=16V", focus: "V_{pp}=16V", question: "首先，計算輸出信號嘅 Peak voltage (V_p)。", options: ["8V", "16V", "32V", "4V"], correct: "8V", explanation: "Peak-to-peak voltage (V_{pp}) 係 16V，Peak voltage (V_p) 就係佢嘅一半 = 8V。" },
      { currentExpression: "I_{p} = 1A", focus: "全部", question: "由 Power supply (V_{CC}) 抽出嘅平均 DC 電流 (I_{dc}) 公式係 I_{dc} = 2 \\times I_p / \\pi。計算 I_{dc}。", options: ["0.636A", "0.5A", "1.414A", "1A"], correct: "0.636A", explanation: "I_{dc} = 2 \\times (1A) / 3.1416 \\approx 0.636A。" },
      { currentExpression: "P_{in(dc)} = V_{CC} \\times I_{dc}", focus: "全部", question: "最後，計算總 DC Input Power (P_{in(dc)})。", options: ["12.72W", "20W", "10W", "16W"], correct: "12.72W", explanation: "P_{in(dc)} = V_{CC} \\times I_{dc} = 20V \\times 0.636A = 12.72W。之後計埋 P_{out} 就可以搵到 Efficiency 啦！" }
    ]
  },
  {
    level: 10, title: "Task J：Transition Table 狀態轉移表實戰", isBoss: false,
    steps: [
      { currentExpression: "Present = 011_{2} \\rightarrow Next = 100_{2}", focus: "0 \\rightarrow 1", question: "對 Flip-Flop A 而言，由 0 變 1。根據 JK Excitation Table，J_A 同 K_A 應該係咩？", options: ["J=1, K=X", "J=X, K=1", "J=1, K=0", "J=0, K=1"], correct: "J=1, K=X", explanation: "要 Set (0變1)，J 必須為 1，K 可以係 0 (Set) 或 1 (Toggle)，所以 K 係 X (Don't care)。" },
      { currentExpression: "Present = 011_{2} \\rightarrow Next = 100_{2}", focus: "1 \\rightarrow 0", question: "對 Flip-Flop B 而言，由 1 變 0。J_B 同 K_B 應該係咩？", options: ["J=X, K=1", "J=1, K=X", "J=0, K=X", "J=1, K=1"], correct: "J=X, K=1", explanation: "要 Reset (1變0)，K 必須為 1，J 可以係 0 (Reset) 或 1 (Toggle)，所以 J 係 X。" }
    ]
  },
  {
    level: 11, title: "Task K：K-map 四角群組法", isBoss: false,
    steps: [
      { currentExpression: "K-map 群組：m(0,2,8,10)", focus: "全部", question: "畫 4-variable K-map 時，呢四個數字啱啱好喺四個角落 (Corners)。觀察二進制：0000, 0010, 1000, 1010。佢哋化簡後會得出咩？", options: ["B'D'", "A'C'", "BD'", "A'D'"], correct: "B'D'", explanation: "四個數字嘅 B 位全部都係 0，D 位全部都係 0。所以提取出嚟就係 B'D'！呢招「四角圈法」極常用！" }
    ]
  },
  {
    level: 12, title: "Task L：Multiplexer MUX 電路實作", isBoss: true,
    steps: [
      { currentExpression: "4-to-1 MUX 實現 F(A,B,C) = \\sum m(1,3,5,6)", focus: "全部", question: "用 A, B 作為 Selectors。當 AB=00 時 (對應 m0, m1)，m0=0, m1=1。MUX 嘅 D_0 輸入應該接駁去邊度？", options: ["接駁去 C", "接駁去 C'", "接駁去 0 (Ground)", "接駁去 1 (Vcc)"], correct: "接駁去 C", explanation: "當 AB=00，C=0 時輸出 0(m0)，C=1 時輸出 1(m1)。F 完美跟隨 C 嘅變化，所以 D_0 接去 C。" },
      { currentExpression: "F(A,B,C) = \\sum m(1,3,5,6)", focus: "全部", question: "當 AB=11 時 (對應 m6, m7)。m6=1, m7=0。MUX 嘅 D_3 輸入應該接駁去邊度？", options: ["接駁去 C'", "接駁去 C", "接駁去 0", "接駁去 1"], correct: "接駁去 C'", explanation: "當 AB=11，C=0 時輸出 1(m6)，C=1 時輸出 0(m7)。輸出同 C 相反，所以 D_3 接去 C' (NOT C)。" }
    ]
  },
  {
    level: 13, title: "Task M：Dual-slope ADC 時間計算", isBoss: false,
    steps: [
      { currentExpression: "V_{in} = 1.5V, V_{ref} = 0.4V, t_{1} = 5ms", focus: "全部", question: "來自 22/23 Sem 1 Q4b：Dual-slope ADC 放電時間 t_2 嘅公式係 t_2 = t_1 \\times (V_{in} / V_{ref})。計算 t_2。", options: ["18.75ms", "1.33ms", "15ms", "20ms"], correct: "18.75ms", explanation: "代入公式：t_2 = 5ms \\times (1.5 / 0.4) = 5ms \\times 3.75 = 18.75ms。呢個時間會由 Counter 轉化做 Digital output。" }
    ]
  }
];

// 重寫超強大數學排版解析器 (支援 _{...}, ^^{...}, _x, ^x, \times, \rightarrow, \sum, \prod)
const renderFormattedText = (text) => {
  if (typeof text !== 'string') return text;
  
  // 正規表達式精準匹配 LaTeX 風格寫法
  const regex = /(_\{[^}]+\}|_[\w\d]+|\^\{[^}]+\}|\^[\w\d]+|\\times|\\rightarrow|\\sum|\\prod)/g;
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (!part) return null;
    
    // 處理下標 (Subscript)
    if (part.startsWith('_')) {
      let content = part.slice(1);
      if (content.startsWith('{') && content.endsWith('}')) {
        content = content.slice(1, -1);
      }
      return <sub key={i} className="text-[0.65em] align-baseline relative -bottom-[0.3em] mx-[1px] text-cyan-200/90">{content}</sub>;
    }
    
    // 處理上標 (Superscript)
    if (part.startsWith('^')) {
      let content = part.slice(1);
      if (content.startsWith('{') && content.endsWith('}')) {
        content = content.slice(1, -1);
      }
      return <sup key={i} className="text-[0.65em] align-baseline relative -top-[0.4em] mx-[1px] text-cyan-200/90">{content}</sup>;
    }
    
    // 處理特殊符號
    if (part === '\\times') return <span key={i} className="mx-1.5 font-sans">×</span>;
    if (part === '\\rightarrow') return <span key={i} className="mx-1.5 font-sans">→</span>;
    if (part === '\\sum') return <span key={i} className="mx-1.5 text-2xl align-middle">∑</span>;
    if (part === '\\prod') return <span key={i} className="mx-1.5 text-2xl align-middle">∏</span>;
    
    return <span key={i}>{part}</span>;
  });
};

export default function ExamReviewGame() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [view, setView] = useState('game'); 
  const [saveStatus, setSaveStatus] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOnlyMistakes, setShowOnlyMistakes] = useState(false);

  // 讀取 LocalStorage 存檔 (v5.1)
  useEffect(() => {
    const savedData = localStorage.getItem('sehs3313-exam-save-v5');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAnswers(parsed.answers || {});
        setCurrentLevelIdx(parsed.currentLevelIdx || 0);
        setCurrentStepIdx(parsed.currentStepIdx || 0);
        setView(parsed.view || 'game');
        setSaveStatus('📂 存檔已恢復！');
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (e) {
        console.error("讀取存檔失敗", e);
      }
    }
  }, []);

  // 自動存檔
  useEffect(() => {
    if (Object.keys(answers).length > 0 || currentLevelIdx > 0) {
      const dataToSave = { answers, currentLevelIdx, currentStepIdx, view };
      localStorage.setItem('sehs3313-exam-save-v5', JSON.stringify(dataToSave));
      setSaveStatus('💾 自動存檔中...');
      const timer = setTimeout(() => setSaveStatus(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [answers, currentLevelIdx, currentStepIdx, view]);

  const currentLevel = NEW_TASKS[currentLevelIdx];
  const currentStep = currentLevel?.steps[currentStepIdx];
  const stepKey = `${currentLevelIdx}-${currentStepIdx}`;
  const hasAnswered = !!answers[stepKey];
  const selectedOption = answers[stepKey];
  const isCorrect = selectedOption === currentStep?.correct;
  const totalQuestions = NEW_TASKS.reduce((acc, level) => acc + level.steps.length, 0);

  // 隨機打亂選項 (每次進入新題目時重新洗牌)
  const shuffledOptions = useMemo(() => {
    if (!currentStep) return [];
    // 複製一份原選項陣列，避免修改到原資料
    const opts = [...currentStep.options];
    // Fisher-Yates 洗牌演算法
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [currentLevelIdx, currentStepIdx]); // 只有當 Level 或 Step 改變時先會重新洗牌

  const calculateScore = () => {
    let score = 0;
    Object.keys(answers).forEach(key => {
      const [lIdx, sIdx] = key.split('-').map(Number);
      if (answers[key] === NEW_TASKS[lIdx].steps[sIdx].correct) score++;
    });
    return score;
  };

  const score = calculateScore();

  const handleOptionClick = (option) => {
    if (hasAnswered) return; 
    setAnswers(prev => ({ ...prev, [stepKey]: option }));
  };

  const handleNext = () => {
    if (currentStepIdx < currentLevel.steps.length - 1) {
      setCurrentStepIdx(c => c + 1);
    } else if (currentLevelIdx < NEW_TASKS.length - 1) {
      setCurrentLevelIdx(l => l + 1);
      setCurrentStepIdx(0);
    } else {
      setView('report');
      setShowOnlyMistakes(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(c => c - 1);
    } else if (currentLevelIdx > 0) {
      setCurrentLevelIdx(l => l - 1);
      setCurrentStepIdx(NEW_TASKS[currentLevelIdx - 1].steps.length - 1);
    }
  };

  const handleRestart = () => {
    if(window.confirm("確定要重新開始？所有存檔將會被清除。")) {
      setAnswers({});
      setCurrentLevelIdx(0);
      setCurrentStepIdx(0);
      setView('game');
      localStorage.removeItem('sehs3313-exam-save-v5');
    }
  };

  const jumpToTask = (taskIdx) => {
    setCurrentLevelIdx(taskIdx);
    setCurrentStepIdx(0);
    setIsMenuOpen(false);
    setView('game');
  };

  const calculateProgress = () => {
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / totalQuestions) * 100;
  };

  const renderExpression = (expr, focus) => {
    if (!focus || focus === "全部") return <span className="text-cyan-400 font-bold">{renderFormattedText(expr)}</span>;
    const parts = expr.split(focus);
    if (parts.length === 1) return <span className="text-cyan-400 font-bold">{renderFormattedText(expr)}</span>;

    return (
      <span className="leading-relaxed text-cyan-400 font-bold">
        {renderFormattedText(parts[0])}
        <span className="inline-block mx-1.5 px-3 py-1 bg-cyan-900/60 border border-cyan-400/60 rounded-lg text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110 transform transition-all align-middle">
          {renderFormattedText(focus)}
        </span>
        {renderFormattedText(parts.slice(1).join(focus))}
      </span>
    );
  };

  const getMistakeAnalysis = () => {
    const mistakes = [];
    NEW_TASKS.forEach((level, lIdx) => {
      let taskMistakes = 0;
      level.steps.forEach((step, sIdx) => {
        const uAns = answers[`${lIdx}-${sIdx}`];
        if (uAns && uAns !== step.correct) taskMistakes++;
      });
      if (taskMistakes > 0) {
        mistakes.push({ taskTitle: level.title, count: taskMistakes });
      }
    });
    return mistakes;
  };

  const mistakeAnalysis = getMistakeAnalysis();
  const answeredQuestionsCount = Object.keys(answers).length;

  const TaskMenu = () => (
    <div className={`fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed top-0 left-0 bottom-0 w-80 max-w-[80vw] bg-slate-900 border-r border-slate-800 shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2"><BookOpen className="w-5 h-5"/> 任務清單</h2>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {NEW_TASKS.map((task, idx) => {
            let answeredInTask = 0;
            task.steps.forEach((_, sIdx) => { if (answers[`${idx}-${sIdx}`]) answeredInTask++; });
            const isCompleted = answeredInTask === task.steps.length;
            const isCurrent = currentLevelIdx === idx && view === 'game';

            return (
              <button 
                key={idx}
                onClick={() => jumpToTask(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${isCurrent ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : isCompleted ? 'bg-emerald-900/10 border-emerald-900/30 text-slate-300 hover:bg-slate-800' : 'bg-slate-800/40 border-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-bold text-sm ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : ''}`}>
                    Task {String.fromCharCode(65 + idx)}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <p className="text-sm truncate pr-2">{task.title}</p>
                <div className="mt-2 w-full bg-slate-950 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-cyan-500'}`} style={{ width: `${(answeredInTask/task.steps.length)*100}%` }}></div>
                </div>
              </button>
            )
          })}
          
          <button 
            onClick={() => { setIsMenuOpen(false); setView('report'); setShowOnlyMistakes(false); }}
            className="w-full mt-4 p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <BarChart2 className="w-5 h-5 text-purple-400" />
            查看成績報告
          </button>
        </div>
      </div>
    </div>
  );

  if (view === 'report') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
        <TaskMenu />
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setIsMenuOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors border border-slate-700">
              <Menu className="w-5 h-5" /> 選單
            </button>
          </div>

          <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl text-center border border-slate-700 relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
            <Cpu className="w-20 h-20 text-cyan-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
            <h1 className="text-3xl font-bold mb-2">SEHS3313 終極成績報告</h1>
            <p className="text-slate-400">你已經作答咗 {answeredQuestionsCount} / {totalQuestions} 條問題</p>
            
            <div className="inline-block bg-slate-900 rounded-2xl p-6 border border-slate-700/50 mt-6 min-w-[200px]">
              <p className="text-sm text-slate-400 mb-1">最終得分</p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {score} <span className="text-2xl text-slate-500">/ {totalQuestions}</span>
              </p>
            </div>
            
            <div className="mt-8 flex justify-center flex-wrap gap-4">
              <button onClick={() => { setView('game'); setCurrentLevelIdx(0); setCurrentStepIdx(0); }} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all border border-slate-600">
                返回遊戲
              </button>
              <button onClick={handleRestart} className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95">
                <RefreshCw className="w-5 h-5" /> 重置所有紀錄
              </button>
            </div>
          </div>

          {mistakeAnalysis.length > 0 && (
            <div className="bg-red-950/20 border border-red-900/30 p-6 rounded-2xl mb-8">
              <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" /> 弱點分析 (Mistakes Analysis)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mistakeAnalysis.map((m, i) => (
                  <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-red-900/20 flex justify-between items-center">
                    <span className="text-slate-300 text-sm">{m.taskTitle}</span>
                    <span className="bg-red-900/50 text-red-300 font-mono px-3 py-1 rounded-full text-xs font-bold">錯 {m.count} 題</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end mb-4">
             <button 
               onClick={() => setShowOnlyMistakes(!showOnlyMistakes)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-bold ${showOnlyMistakes ? 'bg-red-900/40 border-red-500 text-red-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
             >
               <Filter className="w-4 h-4" /> {showOnlyMistakes ? '顯示全部題目' : '只顯示錯題'}
             </button>
          </div>

          <div className="space-y-8 pb-12">
            {NEW_TASKS.map((level, lIdx) => {
              let hasContentToRender = false;
              if (!showOnlyMistakes) hasContentToRender = true;
              else {
                level.steps.forEach((step, sIdx) => {
                  const uAns = answers[`${lIdx}-${sIdx}`];
                  if (uAns && uAns !== step.correct) hasContentToRender = true;
                });
              }

              if (!hasContentToRender) return null;

              return (
              <div key={lIdx} className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                <div className={`px-6 py-4 border-b flex items-center gap-3 ${level.isBoss ? 'bg-red-950/40 border-red-900/50 text-red-200' : 'bg-cyan-950/40 border-cyan-900/50 text-cyan-200'}`}>
                  {level.isBoss ? <ShieldAlert className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  <h2 className="text-xl font-bold">{level.title}</h2>
                </div>
                <div className="p-6 space-y-6">
                  {level.steps.map((step, sIdx) => {
                    const stepKeyStr = `${lIdx}-${sIdx}`;
                    const uAns = answers[stepKeyStr];
                    const isUnanswered = !uAns;
                    const sCorrect = uAns === step.correct;

                    if (showOnlyMistakes && (sCorrect || isUnanswered)) return null;

                    return (
                      <div key={sIdx} className="bg-slate-900/80 rounded-xl p-5 border border-slate-800">
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 font-mono mb-2 tracking-widest uppercase">Data / Context</p>
                          <p className="text-xl font-mono text-cyan-400 break-words bg-slate-950/50 p-4 rounded-lg border border-slate-800">{renderFormattedText(step.currentExpression)}</p>
                        </div>
                        <p className="text-slate-200 mb-4 font-medium text-lg">{renderFormattedText(step.question)}</p>
                        
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                          <div className="flex-1 bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500 block mb-2">你的答案</span>
                            <div className={`flex items-center gap-2 font-mono text-lg ${isUnanswered ? 'text-slate-500' : sCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                              {!isUnanswered && (sCorrect ? <CheckCircle2 className="w-5 h-5"/> : <XCircle className="w-5 h-5"/>)}
                              {isUnanswered ? "- 未作答 -" : renderFormattedText(uAns)}
                            </div>
                          </div>
                          <div className="flex-1 bg-emerald-950/30 p-4 rounded-lg border border-emerald-900/50">
                            <span className="text-xs text-emerald-500/70 block mb-2">正確答案</span>
                            <span className="font-mono text-emerald-400 font-bold text-lg">{renderFormattedText(step.correct)}</span>
                          </div>
                        </div>

                        <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/50">
                          <span className="text-sm text-cyan-400 block mb-2 font-bold flex items-center gap-2">
                            <BookOpen className="w-4 h-4"/> 溫習重點
                          </span>
                          <p className="text-slate-300 text-base leading-relaxed">{renderFormattedText(step.explanation)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )})}
            
            {showOnlyMistakes && mistakeAnalysis.length === 0 && (
              <div className="text-center p-12 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-emerald-300">太強了！你沒有任何錯題！</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans flex flex-col items-center relative">
      <TaskMenu />
      
      {saveStatus && (
        <div className="fixed top-4 right-4 bg-slate-800 text-emerald-400 px-4 py-2 rounded-full border border-slate-700 shadow-lg text-sm font-medium flex items-center gap-2 animate-pulse z-40">
          <Save className="w-4 h-4" /> {saveStatus}
        </div>
      )}

      <div className="max-w-3xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors shadow-lg group"
              title="打開任務選單"
            >
              <Menu className="w-6 h-6 text-slate-300 group-hover:text-cyan-400 transition-colors" />
            </button>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hidden sm:flex items-center gap-2">
              <Cpu className="text-cyan-400" />
              SEHS3313 全能溫習 RPG
            </h1>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur px-5 py-2.5 rounded-full border border-slate-700 font-mono text-sm shadow-lg flex items-center">
            <span className="text-slate-400 hidden sm:inline mr-2">Score:</span> 
            <span className="text-emerald-400 font-bold text-lg">{score}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-xs font-medium text-slate-400 mb-2 px-1">
            <span>Overall Progress</span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 shadow-inner overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden mb-6 flex flex-col">
          <div className={`px-6 py-4 border-b flex justify-between items-center ${currentLevel.isBoss ? 'bg-red-950/40 border-red-900/50' : 'bg-slate-800/80 border-slate-700'}`}>
            <h2 className="text-lg font-bold flex items-center gap-2 truncate pr-4">
              {currentLevel.isBoss ? <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" /> : <BookOpen className="w-5 h-5 text-cyan-400 flex-shrink-0" />}
              <span className="truncate">{currentLevel.title}</span>
            </h2>
            <span className="bg-black/30 px-3 py-1 rounded-full text-xs font-mono text-slate-300 flex-shrink-0">
              Step {currentStepIdx + 1} / {currentLevel.steps.length}
            </span>
          </div>

          <div className="p-6 md:p-8 bg-[#0f172a] border-b border-slate-800 relative">
            <p className="text-[10px] sm:text-xs text-slate-500 font-mono mb-4 tracking-widest uppercase">Data / Context</p>
            <div className="font-mono text-2xl md:text-3xl tracking-wider text-slate-300 leading-relaxed overflow-x-auto pb-2">
              {renderExpression(currentStep.currentExpression, currentStep.focus)}
            </div>
          </div>

          <div className="p-6 md:p-8 bg-slate-800/20">
            <p className="text-lg md:text-xl leading-relaxed font-medium text-blue-100">
              {renderFormattedText(currentStep.question)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {shuffledOptions.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === currentStep.correct;
            let btnClass = "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 hover:border-cyan-500";
            
            if (hasAnswered) {
              if (isCorrectOption) btnClass = "bg-emerald-900/40 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]";
              else if (isSelected && !isCorrectOption) btnClass = "bg-red-900/40 border-red-500 text-red-300";
              else btnClass = "bg-slate-900 border-slate-800 text-slate-600 opacity-40";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={hasAnswered}
                className={`group relative p-5 rounded-2xl border-2 text-left font-mono text-xl transition-all ${btnClass}`}
              >
                <div className="flex items-center justify-between">
                  <span>{renderFormattedText(option)}</span>
                  {hasAnswered && isCorrectOption && <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0 ml-2" />}
                  {hasAnswered && isSelected && !isCorrectOption && <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 ml-2" />}
                </div>
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 mb-6">
            <div className={`p-6 md:p-8 rounded-2xl border backdrop-blur-sm ${isCorrect ? 'bg-emerald-950/40 border-emerald-900/50' : 'bg-red-950/40 border-red-900/50'}`}>
              <h3 className={`font-bold mb-4 flex items-center gap-2 text-xl ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isCorrect ? '✨ 完美作答！' : <><XCircle className="w-6 h-6"/> 正確答案係：{renderFormattedText(currentStep.correct)}</>}
              </h3>
              <div className="mt-5 pt-5 border-t border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-400 flex items-center gap-2 mb-3 uppercase tracking-widest">
                  <BookOpen className="w-5 h-5" /> 溫習重點
                </h4>
                <p className="text-slate-300 text-lg md:text-xl leading-relaxed">{renderFormattedText(currentStep.explanation)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 pb-8">
          <button onClick={handlePrev} disabled={currentLevelIdx === 0 && currentStepIdx === 0} className="flex-1 flex justify-center items-center gap-2 bg-slate-800 text-slate-300 py-5 rounded-2xl hover:bg-slate-700 disabled:opacity-30 border border-slate-700 transition-all font-bold">
            <ChevronLeft className="w-6 h-6" /> 上一步
          </button>
          <button onClick={handleNext} disabled={!hasAnswered} className={`flex-[2] flex justify-center items-center gap-3 py-5 rounded-2xl transition-all font-bold text-lg ${hasAnswered ? 'bg-white text-slate-900 hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'}`}>
            {currentLevelIdx === NEW_TASKS.length - 1 && currentStepIdx === currentLevel.steps.length - 1 ? '查看成績報告' : '下一步'}
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}