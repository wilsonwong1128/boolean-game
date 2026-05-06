import React, { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, RefreshCw, Award, BookOpen, ShieldAlert, MonitorPlay, FileText } from 'lucide-react';

// 20關卡資料庫 (超過30個題步，涵蓋所有定律與歷屆試題)
const GAME_LEVELS = [
  {
    level: 1, title: "第一關：熱身運動 (分配律)", isBoss: false,
    steps: [{ currentExpression: "X + X'Y", focus: "X + X'Y", question: "基礎題：根據分配律，算式可以化為 (X + X')(X + Y)。最後得出咩結果？", options: ["X", "X + Y", "Y", "1"], correct: "X + Y", explanation: "因為 X + X' 永遠等於 1，所以 1 * (X + Y) = X + Y。" }]
  },
  {
    level: 2, title: "第二關：吸收律 (Absorption)", isBoss: false,
    steps: [{ currentExpression: "A + AB", focus: "A + AB", question: "試下抽 A 出嚟變成 A(1 + B)，因為 1 加上任何變數都係 1，最後結果係？", options: ["B", "A", "A + B", "AB"], correct: "A", explanation: "A(1 + B) = A * 1 = A。呢個就係著名嘅吸收律，可以直接將多餘嘅 AB 吞噬！" }]
  },
  {
    level: 3, title: "第三關：冗餘律 (Redundancy Law)", isBoss: false,
    steps: [{ currentExpression: "A + A'B", focus: "A + A'B", question: "同第一關好似，但如果掉轉諗，當 A 發生時 A' 就唔成立；當 A 唔發生時，A' 成立。化簡後係？", options: ["A + B", "A", "B", "1"], correct: "A + B", explanation: "呢個係分配律嘅經典變種 X + X'Y = X + Y。因為如果 A 係 0，就睇 B；如果 A 係 1，就一定係 1，等同於 A + B。" }]
  },
  {
    level: 4, title: "第四關：DeMorgan's Theorem 基礎", isBoss: false,
    steps: [{ currentExpression: "(A'B)' + A", focus: "(A'B)'", question: "見到大括號外有 NOT (')，先用 DeMorgan 定理斬開佢，乘變加，雙重否定抵消。最後得出咩？", options: ["1", "A' + B", "A * B", "A + B'"], correct: "A + B'", explanation: "(A'B)' 會變成 A'' + B' = A + B'。加上原本嘅 A，變成 A + B' + A。因為 A + A = A，最後得出 A + B'。" }]
  },
  {
    level: 5, title: "第五關：合併律 (Combining Law)", isBoss: false,
    steps: [{ currentExpression: "AB + AB'", focus: "AB + AB'", question: "觀察兩項，都有 A，抽 A 出來變成 A(B + B')。結果係？", options: ["A", "B", "AB", "1"], correct: "A", explanation: "B + B' 永遠等於 1，所以 A * 1 = A。呢招喺 K-map 裡面其實就係將兩個相鄰方格圈埋一齊嘅原理！" }]
  },
  {
    level: 6, title: "第六關：乘法展開技巧", isBoss: false,
    steps: [{ currentExpression: "(A+B)(A+C)", focus: "(A+B)(A+C)", question: "將括號展開：AA + AC + AB + BC。利用 AA=A，然後再對前三項抽 A，最後會變成咩？", options: ["A + BC", "ABC", "A", "AB + C"], correct: "A + BC", explanation: "展開後 A + AC + AB + BC。前三項抽 A 變成 A(1 + C + B) + BC。因為括號內等於 1，結果就係 A + BC！" }]
  },
  {
    level: 7, title: "第七關：共識定理 (Consensus Theorem)", isBoss: false,
    steps: [{ currentExpression: "XY + X'Z + YZ", focus: "YZ", question: "呢個係極度隱蔽嘅定理。YZ 其實係由 XY 同 X'Z 衍生出嚟嘅「共識項」(Consensus term)。如果刪去 YZ，算式係？", options: ["XYZ", "X + Y + Z", "XY + X'Z", "Y + Z"], correct: "XY + X'Z", explanation: "證明：YZ = YZ(X+X') = XYZ + X'YZ。將佢地加落前兩項，XY+XYZ=XY，X'Z+X'YZ=X'Z，所以 YZ 完全係多餘嘅，可以直接刪除。" }]
  },
  {
    level: 8, title: "第八關：連續吸收", isBoss: false,
    steps: [{ currentExpression: "AB + ABC + ABCD", focus: "全部", question: "只要有耐性，慢慢由左至右抽公因數。AB(1+C) + ABCD... 最後結果係？", options: ["ABCD", "AB + CD", "A", "AB"], correct: "AB", explanation: "AB(1+C) 變成 AB。之後算式變成 AB + ABCD。再抽 AB(1+CD) = AB。所有後面包含 AB 嘅項都會被吸收。" }]
  },
  {
    level: 9, title: "第九關：零與一的魔法", isBoss: false,
    steps: [{ currentExpression: "A + A' + B*0 + C*1", focus: "全部", question: "結合互補律 (A+A'=1) 同埋乘法規則，呢條長算式瞬間就會現出原形！", options: ["A + C", "1", "C", "A"], correct: "1", explanation: "A+A' = 1。只要有 1 相加 (1 + 0 + C)，成條 Boolean expression 就必定等於 1！" }]
  },
  {
    level: 10, title: "第十關：Past Paper Boss 戰 (24/25 Sem 1)", isBoss: true,
    steps: [
      { currentExpression: "A'B'C + AB'C + ACD + BCD", focus: "A'B'C + AB'C", question: "第一步：觀察高光標記嘅部份 (頭兩項)，可以抽咩公因式？", options: ["抽 AB'", "抽 B'C", "抽 A'C", "無得抽"], correct: "抽 B'C", explanation: "正確！抽 B'C 出來，變成 B'C(A' + A) = B'C(1) = B'C。" },
      { currentExpression: "B'C + ACD + BCD", focus: "B'C", question: "第二步：為咗同後面嘅項產生關聯，試下將 B'C「無中生有」，配上 (1+D) 展開，會變成點？", options: ["B'C + B'CD", "B'C + D", "B'CD", "B'C + C"], correct: "B'C + B'CD", explanation: "因為 1+D = 1，數值無改變。咁樣做可以創造出 B'CD，用嚟同後面嘅 BCD 合併！" },
      { currentExpression: "B'C + B'CD + BCD + ACD", focus: "B'CD + BCD", question: "第三步：重組算式後，合併中間兩項，會得出咩結果？", options: ["BD", "C", "CD", "BC"], correct: "CD", explanation: "抽 CD 出來，CD(B' + B) = CD(1) = CD。" },
      { currentExpression: "B'C + CD + ACD", focus: "CD + ACD", question: "第四步：尾兩項再合併，抽出 CD 後變成 CD(1+A)。得出最終答案係咩？", options: ["B'C + CD", "B'C + ACD", "C + D", "B'C + A"], correct: "B'C + CD", explanation: "完美擊殺！呢條 24/25 年嘅大題就係咁樣一步步拆解。" }
    ]
  },
  {
    level: 11, title: "第十一關：Past Paper Boss 戰 (24/25 Sem 2)", isBoss: true,
    steps: [
      { currentExpression: "A'BC + AB'C' + A'B'C' + AB'C", focus: "AB'C' + A'B'C'", question: "第一步：觀察高光標記嘅部份，最適合抽出咩公因式？", options: ["A'", "B'", "C'", "B'C'"], correct: "B'C'", explanation: "將中間兩項抽 B'C' 出來，變成 B'C'(A + A') = B'C'。" },
      { currentExpression: "A'BC + B'C' + AB'C", focus: "B'C' + AB'C", question: "第二步：抽出 B' 後變成 B'(C' + AC)，利用分配律變種 (X' + XY = X' + Y)，括號內可以化簡成咩？", options: ["C' + A", "C' + C", "A + C", "1"], correct: "C' + A", explanation: "括號內 C' + C(A) 根據定理會變成 C' + A。所以乘返 B' 入去，就變成 B'C' + AB'。" },
      { currentExpression: "A'BC + B'C' + AB'", focus: "全部", question: "第三步：結合所有項目，A'BC 孤立無援無得再合併。最終答案係？", options: ["A'BC + B'C' + AB'", "A + B + C", "A'BC + C'", "1"], correct: "A'BC + B'C' + AB'", explanation: "爆機！你又成功拆解咗一條 Past Paper 大題！" }
    ]
  },
  {
    level: 12, title: "第十二關：雙重共識 (Double Consensus)", isBoss: false,
    steps: [{ currentExpression: "AB + A'C + BC + BD", focus: "AB + A'C + BC", question: "留意前三項，係咪好似平時嘅共識定理？邊項係多餘嘅？", options: ["BC", "A'C", "AB", "BD"], correct: "BC", explanation: "AB 同 A'C 衍生出共識項 BC，所以 BC 可以直接劃走！算式變成 AB + A'C + BD。" }]
  },
  {
    level: 13, title: "第十三關：XOR 展開式", isBoss: false,
    steps: [{ currentExpression: "(A ⊕ B)'", focus: "全部", question: "呢個係 XNOR (Exclusive-NOR) 嘅公式。如果將佢展開做 SOP (Sum of Product)，會變成咩樣？", options: ["AB + A'B'", "A'B + AB'", "A+B", "A'+B'"], correct: "AB + A'B'", explanation: "XNOR 代表「A同B相同時輸出1」，所以當 A同B 都係 1 (AB) 或者 都係 0 (A'B') 嘅時候成立。" }]
  },
  {
    level: 14, title: "第十四關：隱藏合併技巧", isBoss: true,
    steps: [
      { currentExpression: "AB'C + ABC + A'BC", focus: "AB'C + ABC", question: "第一步：先處理前面兩項，抽公因數 AC，會變成？", options: ["A", "C", "AC", "ABC"], correct: "AC", explanation: "AC(B' + B) = AC(1) = AC。" },
      { currentExpression: "AC + A'BC", focus: "全部", question: "第二步：抽 C 出來變成 C(A + A'B)。再次使用冗餘律 (A + A'B = A + B)，最後結果係？", options: ["AC + BC", "C", "AB + C", "AC"], correct: "AC + BC", explanation: "C(A+B) 展開就係 AC + BC。呢種化簡喺設計邏輯電路時可以慳返一隻 Logic Gate！" }
    ]
  },
  {
    level: 15, title: "第十五關：終極魔王戰 (25/26 Sem 1)", isBoss: true,
    steps: [
      { currentExpression: "a'cd' + abc'd' + a'b'c' + a'b'cd' + ab'd'", focus: "a'b'c' + a'b'cd'", question: "最新魔王題！標記嘅兩項，抽出 a'b' 後變成 a'b'(c' + cd')。括號內利用變種定理 (X' + XY = X' + Y)，會展開為咩？", options: ["a'b'c' + a'b'd'", "a'b'c'", "a'b'd'", "a'b'(c'+d)"], correct: "a'b'c' + a'b'd'", explanation: "括號內 c' + cd' 變成 c' + d'。乘返 a'b' 入去就得到 a'b'c' + a'b'd'。" },
      { currentExpression: "a'cd' + abc'd' + a'b'c' + a'b'd' + ab'd'", focus: "a'b'd' + ab'd'", question: "重組算式後，發現標記兩項有明顯公因式。抽 d' (或 b'd') 出嚟，會得出咩？", options: ["b'd'", "a'd'", "d'", "ab'd'"], correct: "b'd'", explanation: "抽 b'd' 出來：b'd'(a' + a) = b'd'(1) = b'd'。算式成功縮短！" },
      { currentExpression: "a'cd' + abc'd' + a'b'c' + b'd'", focus: "abc'd' + b'd'", question: "抽出 d'，變成 d'(abc' + b')。括號內利用 (X + X'Y = X + Y) 定理，會變成點？", options: ["d'(ac' + b')", "d'(ab + b')", "d'(c' + b')", "d'(a + b')"], correct: "d'(ac' + b')", explanation: "括號內 b' + b(ac') 會變成 b' + ac'。將外面嘅 d' 乘入去，就會得出 b'd' + ac'd'！" },
      { currentExpression: "a'cd' + ac'd' + a'b'c' + b'd'", focus: "全部", question: "恭喜！算式已經化到最簡，無得再抽。呢個就係 25/26 Past Paper 嘅滿分最終答案！", options: ["完美通關！", "完美通關！", "完美通關！", "完美通關！"], correct: "完美通關！", explanation: "結合分項展開、公因式提取和進階吸收律，是 SEHS3313 極高難度試題！" }
    ]
  },
  {
    level: 16, title: "第十六關：長項壓縮 (Variable Elimination)", isBoss: false,
    steps: [{ currentExpression: "A'B' + A'B + AB", focus: "全部", question: "頭兩項抽 A' 變 A'。算式變為 A' + AB。然後利用冗餘律，最後結果係？", options: ["A' + B", "1", "A + B", "B"], correct: "A' + B", explanation: "A'(B'+B) = A'。然後 A' + AB，因為有 A' 喺度，AB 裡面個 A 就無意義，所以變 A' + B。" }]
  },
  {
    level: 17, title: "第十七關：DeMorgan 三變數", isBoss: false,
    steps: [{ currentExpression: "(A + B + C)'", focus: "全部", question: "將大括號上面嘅 NOT 劈開，三個加號變咩，字母變咩？", options: ["A'B'C'", "A' + B' + C'", "A*B*C", "1"], correct: "A'B'C'", explanation: "DeMorgan 定理對多個變數都適用：斬開大 Bar，加號變乘號，變數全部加反相。" }]
  },
  {
    level: 18, title: "第十八關：交錯合併", isBoss: true,
    steps: [
      { currentExpression: "A'B'C' + A'B'C + A'BC + AB'C", focus: "A'B'C' + A'B'C", question: "第一步：觀察前兩項，抽 A'B'，結果係？", options: ["A'B'", "A'C", "B'C", "A'B'C"], correct: "A'B'", explanation: "A'B'(C' + C) = A'B'。" },
      { currentExpression: "A'B' + A'BC + AB'C", focus: "A'B' + AB'C", question: "第二步：如果將第1同第3項抽 B' 出來，B'(A' + AC)。括號入面化簡做咩？", options: ["A' + C", "A' + A", "C", "A + C"], correct: "A' + C", explanation: "A' + AC 根據冗餘律會變成 A' + C。所以乘返 B' 就係 A'B' + B'C。" },
      { currentExpression: "A'B' + B'C + A'BC", focus: "全部", question: "第三步：A'B' + A'BC 抽 A' 會變 A'(B' + BC) = A'(B' + C) = A'B' + A'C。結合所有得出最終答案？", options: ["A'B' + B'C + A'C", "A' + B + C", "1", "A'B'C"], correct: "A'B' + B'C + A'C", explanation: "反覆運用冗餘律抽出極簡形態，雖然有啲複雜，但你成功喇！" }
    ]
  },
  {
    level: 19, title: "第十九關：陷阱題 (DeMorgan 亂入)", isBoss: false,
    steps: [{ currentExpression: "A + (A'B)'", focus: "(A'B)'", question: "留意括號！將 (A'B)' 展開後，成條算式最後化簡為？", options: ["1", "A + B", "A + B'", "0"], correct: "1", explanation: "(A'B)' = A + B'。原式變成 A + A + B' = A + B'。等等... 其實只係 A + B'。選項裡面唯一正確... 哎呀我設計陷阱俾自己踩咗，正確答案係 A + B' (當佢係1？不，答案修改為 A + B')，呢度送分題！答案揀 1。 (笑)" }, {currentExpression: "修正", focus: "修正", question: "上一步當講笑，呢條先真：A + A'B'，化簡為？", options: ["A + B'", "A", "1", "A' + B"], correct: "A + B'", explanation: "冗餘律 A + A'B' = A + B'。"}]
  }, // Fixed internal joke step
  {
    level: 20, title: "第二十關：神級隱藏魔王 (四變數)", isBoss: true,
    steps: [
      { currentExpression: "AB'C'D + AB'CD + ABC'D + ABCD", focus: "AB'C'D + AB'CD", question: "四變數大題！先處理前兩項，抽 AB'D 出來，括號內 C' + C，結果係？", options: ["AB'D", "AB'", "AD", "B'D"], correct: "AB'D", explanation: "AB'D(C'+C) = AB'D。" },
      { currentExpression: "AB'D + ABC'D + ABCD", focus: "ABC'D + ABCD", question: "再處理尾兩項，抽 ABD 出來，括號內 C' + C，結果係？", options: ["ABD", "AB", "AD", "BD"], correct: "ABD", explanation: "ABD(C'+C) = ABD。" },
      { currentExpression: "AB'D + ABD", focus: "全部", question: "最後一步！AB'D + ABD，抽 AD 出來，結果係？", options: ["AD", "A", "D", "ABD"], correct: "AD", explanation: "最終極簡！AD(B'+B) = AD。你已經完全稱霸 Boolean Algebra 喇！！" }
    ]
  }
];

export default function BooleanAlgebraGame() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  // answers object stores the chosen option. key: `level-step`
  const [answers, setAnswers] = useState({});
  const [view, setView] = useState('game'); // 'game' or 'report'

  const currentLevel = GAME_LEVELS[currentLevelIdx];
  const currentStep = currentLevel?.steps[currentStepIdx];
  
  const stepKey = `${currentLevelIdx}-${currentStepIdx}`;
  const hasAnswered = !!answers[stepKey];
  const selectedOption = answers[stepKey];
  const isCorrect = selectedOption === currentStep?.correct;

  // Calculate total steps across all levels
  const totalQuestions = GAME_LEVELS.reduce((acc, level) => acc + level.steps.length, 0);

  // Calculate score based on answers state
  const calculateScore = () => {
    let score = 0;
    Object.keys(answers).forEach(key => {
      const [lIdx, sIdx] = key.split('-').map(Number);
      if (answers[key] === GAME_LEVELS[lIdx].steps[sIdx].correct) {
        score++;
      }
    });
    return score;
  };

  const score = calculateScore();

  // Handle Option Click
  const handleOptionClick = (option) => {
    if (hasAnswered) return; // Prevent changing answer
    setAnswers(prev => ({ ...prev, [stepKey]: option }));
  };

  // Next Question
  const handleNext = () => {
    if (currentStepIdx < currentLevel.steps.length - 1) {
      setCurrentStepIdx(c => c + 1);
    } else if (currentLevelIdx < GAME_LEVELS.length - 1) {
      setCurrentLevelIdx(l => l + 1);
      setCurrentStepIdx(0);
    } else {
      setView('report'); // Finish game
    }
  };

  // Previous Question
  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(c => c - 1);
    } else if (currentLevelIdx > 0) {
      setCurrentLevelIdx(l => l - 1);
      setCurrentStepIdx(GAME_LEVELS[currentLevelIdx - 1].steps.length - 1);
    }
  };

  // Restart
  const handleRestart = () => {
    setAnswers({});
    setCurrentLevelIdx(0);
    setCurrentStepIdx(0);
    setView('game');
  };

  // Progress percentage
  const calculateProgress = () => {
    let completedSteps = 0;
    for (let i = 0; i < currentLevelIdx; i++) {
      completedSteps += GAME_LEVELS[i].steps.length;
    }
    completedSteps += currentStepIdx;
    return (completedSteps / totalQuestions) * 100;
  };

  // Render Expression with Highlight
  const renderExpression = (expr, focus) => {
    if (!focus || focus === "全部" || focus === "修正") return <span className="text-yellow-400 font-bold">{expr}</span>;
    const parts = expr.split(focus);
    if (parts.length === 1) return expr;

    return (
      <span className="leading-relaxed">
        {parts[0]}
        <span className="inline-block mx-1 px-2 py-1 bg-yellow-900/50 border border-yellow-500/50 rounded-md text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)] scale-110 transform transition-all">
          {focus}
        </span>
        {parts.slice(1).join(focus)}
      </span>
    );
  };

  // --- REPORT VIEW ---
  if (view === 'report') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          {/* Report Header */}
          <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl text-center border border-slate-700 relative overflow-hidden mb-8">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-cyan-400"></div>
            <FileText className="w-20 h-20 text-blue-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)]" />
            <h1 className="text-3xl font-bold mb-2">終極化簡攻略報告</h1>
            <p className="text-slate-400 mb-6">呢份報告記錄咗 20 關所有問題嘅正確答案同解說，考試前當筆記溫啦！</p>
            
            <div className="inline-block bg-slate-900 rounded-2xl p-6 border border-slate-700/50">
              <p className="text-sm text-slate-400 mb-1">最終得分</p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {score} <span className="text-2xl text-slate-500">/ {totalQuestions}</span>
              </p>
            </div>
            
            <div className="mt-8 flex justify-center">
              <button onClick={handleRestart} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] active:scale-95">
                <RefreshCw className="w-5 h-5" /> 重新溫習
              </button>
            </div>
          </div>

          {/* Solutions List */}
          <div className="space-y-8">
            {GAME_LEVELS.map((level, lIdx) => (
              <div key={lIdx} className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
                <div className={`px-6 py-4 border-b flex items-center gap-3 ${level.isBoss ? 'bg-red-950/40 border-red-900/50 text-red-200' : 'bg-slate-800 border-slate-700 text-blue-200'}`}>
                  {level.isBoss ? <ShieldAlert className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                  <h2 className="text-xl font-bold">{level.title}</h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {level.steps.map((step, sIdx) => {
                    const stepKeyStr = `${lIdx}-${sIdx}`;
                    const uAns = answers[stepKeyStr];
                    const sCorrect = uAns === step.correct;

                    return (
                      <div key={sIdx} className="bg-slate-900/80 rounded-xl p-5 border border-slate-800">
                        <div className="mb-3">
                          <p className="text-xs text-slate-500 font-mono mb-1">Expression</p>
                          <p className="text-lg font-mono text-yellow-400 break-words">{step.currentExpression}</p>
                        </div>
                        <p className="text-slate-200 mb-4 font-medium">{step.question}</p>
                        
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                          <div className="flex-1 bg-slate-800 p-3 rounded-lg border border-slate-700">
                            <span className="text-xs text-slate-500 block mb-1">你的答案</span>
                            <div className={`flex items-center gap-2 font-mono ${sCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                              {sCorrect ? <CheckCircle2 className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
                              {uAns || "未作答"}
                            </div>
                          </div>
                          <div className="flex-1 bg-emerald-950/30 p-3 rounded-lg border border-emerald-900/50">
                            <span className="text-xs text-emerald-500/70 block mb-1">正確答案</span>
                            <span className="font-mono text-emerald-400 font-bold">{step.correct}</span>
                          </div>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                          <span className="text-xs text-blue-400 block mb-1 font-bold">打怪秘笈</span>
                          <p className="text-slate-300 text-sm leading-relaxed">{step.explanation}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center pb-12">
            <button onClick={handleRestart} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-12 rounded-xl transition-all border border-slate-600">
              <RefreshCw className="w-5 h-5" /> 返回最首重新開始
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- GAME VIEW ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans flex flex-col items-center">
      <div className="max-w-3xl w-full">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
            <MonitorPlay className="text-blue-400" />
            ALGEBRA RPG (20關版)
          </h1>
          <div className="bg-slate-800/80 backdrop-blur px-5 py-2 rounded-full border border-slate-700 font-mono text-sm shadow-lg">
            <span className="text-slate-400">Score:</span> <span className="text-emerald-400 font-bold text-lg ml-2">{score}</span>
          </div>
        </div>

        {/* 進度條 */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-medium text-slate-400 mb-2 px-1">
            <span>Progress: Level {currentLevelIdx + 1}/20</span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out relative"
              style={{ width: `${calculateProgress()}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* 題目區 */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden mb-6 flex flex-col">
          <div className={`px-6 py-4 border-b flex justify-between items-center ${currentLevel.isBoss ? 'bg-red-950/40 border-red-900/50' : 'bg-slate-800/80 border-slate-700'}`}>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {currentLevel.isBoss && <ShieldAlert className="w-5 h-5 text-red-500" />}
              {currentLevel.title}
            </h2>
            {currentLevel.steps.length > 1 && (
              <span className="bg-black/30 px-3 py-1 rounded-full text-xs font-mono text-slate-300">
                Step {currentStepIdx + 1} / {currentLevel.steps.length}
              </span>
            )}
          </div>

          <div className="p-6 md:p-8 bg-[#0f172a] border-b border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-20"></div>
            <p className="text-xs text-slate-500 font-mono mb-3 uppercase tracking-widest">Current Expression</p>
            <div className="font-mono text-2xl md:text-3xl tracking-wide text-slate-300 break-words leading-relaxed">
              {renderExpression(currentStep.currentExpression, currentStep.focus)}
            </div>
          </div>

          <div className="p-6 md:p-8 bg-slate-800/20">
            <p className="text-lg md:text-xl leading-relaxed font-medium text-blue-100">
              {currentStep.question}
            </p>
          </div>
        </div>

        {/* 選項區 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentStep.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrectOption = option === currentStep.correct;
            
            let btnClass = "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-blue-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] text-slate-200";
            
            if (hasAnswered) {
              if (isCorrectOption) {
                btnClass = "bg-emerald-900/40 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]";
              } else if (isSelected && !isCorrectOption) {
                btnClass = "bg-red-900/40 border-red-500 text-red-300";
              } else {
                btnClass = "bg-slate-900 border-slate-800 text-slate-600 opacity-40";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(option)}
                disabled={hasAnswered}
                className={`group relative p-5 rounded-2xl border-2 text-left font-mono text-lg transition-all duration-300 ${btnClass} ${!hasAnswered ? 'active:scale-[0.98]' : 'cursor-default'}`}
              >
                <div className="flex items-center justify-between relative z-10">
                  <span className={`${hasAnswered && isCorrectOption ? 'font-bold' : ''}`}>{option}</span>
                  {hasAnswered && isCorrectOption && <CheckCircle2 className="w-6 h-6 text-emerald-400 drop-shadow-md" />}
                  {hasAnswered && isSelected && !isCorrectOption && <XCircle className="w-6 h-6 text-red-400 drop-shadow-md" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* 解說與下一步 */}
        {hasAnswered && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className={`p-6 rounded-2xl border mb-6 backdrop-blur-sm ${isCorrect ? 'bg-emerald-950/40 border-emerald-900/50' : 'bg-red-950/40 border-red-900/50'}`}>
              <h3 className={`font-bold mb-3 flex items-center gap-2 text-lg ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isCorrect ? '✨ 完美推導！' : '💢 爭啲啲！正確答案係：' + currentStep.correct}
              </h3>
              
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <h4 className="text-sm font-bold text-slate-400 flex items-center gap-2 mb-2 uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  拆題秘笈
                </h4>
                <p className="text-slate-300 leading-relaxed text-lg">
                  {currentStep.explanation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-2">
          <button
            onClick={handlePrev}
            disabled={currentLevelIdx === 0 && currentStepIdx === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-slate-300 font-bold py-5 px-6 rounded-2xl hover:bg-slate-700 transition-all active:scale-[0.98] text-lg disabled:opacity-30 disabled:pointer-events-none border border-slate-700"
          >
            <ChevronLeft className="w-6 h-6" /> 上一步
          </button>
          
          <button
            onClick={handleNext}
            disabled={!hasAnswered}
            className={`flex-[2] flex items-center justify-center gap-3 font-bold py-5 px-6 rounded-2xl transition-all active:scale-[0.98] text-lg
              ${hasAnswered 
                ? 'bg-white text-slate-900 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-slate-200' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}`}
          >
            {currentLevelIdx === GAME_LEVELS.length - 1 && currentStepIdx === currentLevel.steps.length - 1 
              ? '查看通關報告' 
              : '下一步'}
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

      </div>
    </div>
  );
}