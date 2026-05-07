import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CheckCircle2, XCircle, ChevronRight, ChevronLeft, RefreshCw, BookOpen, ShieldAlert, MonitorPlay, FileText, Save, Cpu, Menu, X, AlertTriangle, BarChart2, Filter, Play, LogOut, BookMarked, Lightbulb, PenTool, Trash2, Type } from 'lucide-react';

// 強大數學排版解析器
const renderFormattedText = (text) => {
  if (typeof text !== 'string') return text;
  const regex = /(_\{[^}]+\}|_[\w\d]+|\^\{[^}]+\}|\^[\w\d]+|\\times|\\rightarrow|\\sum|\\prod)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('_')) {
      let content = part.slice(1);
      if (content.startsWith('{') && content.endsWith('}')) content = content.slice(1, -1);
      return <sub key={i} className="text-[0.65em] align-baseline relative -bottom-[0.3em] mx-[1px] opacity-90">{content}</sub>;
    }
    if (part.startsWith('^')) {
      let content = part.slice(1);
      if (content.startsWith('{') && content.endsWith('}')) content = content.slice(1, -1);
      return <sup key={i} className="text-[0.65em] align-baseline relative -top-[0.4em] mx-[1px] opacity-90">{content}</sup>;
    }
    if (part === '\\times') return <span key={i} className="mx-1.5 font-sans">×</span>;
    if (part === '\\rightarrow') return <span key={i} className="mx-1.5 font-sans">→</span>;
    if (part === '\\sum') return <span key={i} className="mx-1.5 text-2xl align-middle">∑</span>;
    if (part === '\\prod') return <span key={i} className="mx-1.5 text-2xl align-middle">∏</span>;
    return <span key={i}>{part}</span>;
  });
};

// 18大關卡，囊括所有 Q1-Q4，SOP/POS 同 MUX 極度深化！
const GAME_LEVELS = [
  {
    level: 1, title: "Task 1：進制轉換與 2's Comp", isBoss: false,
    steps: [
      { currentExpression: "3F3_{16}", focus: "全部", question: "將十六進制 3F3 轉換為二進制，結果係？", hint: "十六進制每一個字母/數字，對應 4 bits 嘅二進制。", options: ["001111110011_{2}", "1111110011_{2}", "001110110011_{2}", "001111110111_{2}"], correct: "001111110011_{2}", explanation: "3 = 0011, F = 1111, 3 = 0011。" },
      { currentExpression: "001111110011_{2}", focus: "全部", question: "將頭先嘅二進制轉為八進制 (Octal)，答案係？", hint: "八進制轉換法則：由右至左，每 3 bits 圈埋做一組。", options: ["1763_{8}", "373_{8}", "1753_{8}", "763_{8}"], correct: "1763_{8}", explanation: "分組：001(1), 111(7), 110(6), 011(3)。" },
      { currentExpression: "A = 94_{10}, B = 45_{10}", focus: "全部", question: "計算 A - B (9-bit)。首先 45_{10} 嘅 9-bit 二進制係幾多？", hint: "用連除法除 2 搵餘數，最後前面補 0 湊夠 9 個位。", options: ["000101101_{2}", "000110101_{2}", "000010110_{2}", "001011010_{2}"], correct: "000101101_{2}", explanation: "45 = 101101_2，補齊 9-bit 即 000101101_2。" },
      { currentExpression: "-45_{10}", focus: "全部", question: "計算 000101101_{2} 嘅 2's complement (代表負數)。", hint: "2's comp 兩部曲：全部反轉，然後加 1。", options: ["111010011_{2}", "111010010_{2}", "110101101_{2}", "111101101_{2}"], correct: "111010011_{2}", explanation: "反轉得 111010010_2，加 1 得 111010011_2。" },
      { currentExpression: "001011110_{2} + 111010011_{2}", focus: "全部", question: "將 A 加上 B 嘅二補碼。相加後放棄最高位溢出，答案係？", hint: "如果有第 10 個 bit (Overflow)，直接當垃圾掉咗佢。", options: ["000110001_{2}", "001110001_{2}", "000100001_{2}", "001100011_{2}"], correct: "000110001_{2}", explanation: "相加等於 (1)000110001_2，丟棄最左邊嘅 1。" }
    ]
  },
  {
    level: 2, title: "Task 2：SOP 與 POS 深入分析", isBoss: true,
    steps: [
      { currentExpression: "F = \\sum m(0,1,3,5)", focus: "\\sum m", question: "呢個表示法 (Sigma m) 代表咩意思？", hint: "m 是細階，對應 Product 項；Sigma 代表將佢哋加埋。", options: ["Sum of Products (SOP) 的 Minterms", "Product of Sums (POS) 的 Maxterms", "Don't care conditions", "Logic Gates 的數量"], correct: "Sum of Products (SOP) 的 Minterms", explanation: "小寫 m 代表 Minterms，Sigma 代表將佢哋加埋一齊 (OR)。" },
      { currentExpression: "Minterm: m_{6}", focus: "全部", question: "喺一個 3-bit (A,B,C) 系統入面，m_6 代表十進制 6 (110_2)。對應嘅邏輯代數式係咩？", hint: "Minterm 嘅規則：見 1 寫原字母，見 0 寫反相 (')。", options: ["ABC'", "A'B'C", "AB'C", "A'BC'"], correct: "ABC'", explanation: "110 之中，A=1, B=1, C=0，所以寫成 ABC'。" },
      { currentExpression: "F = \\sum m(0,1,3,5)", focus: "全部", question: "如果係 3-bit 系統，對應嘅 POS (Maxterms) 係咩？", hint: "3-bit 有 0 到 7。POS 就係將 SOP 無出現過嘅數字搵出嚟。", options: ["\\prod M(2,4,6,7)", "\\prod M(0,1,3,5)", "\\sum m(2,4,6,7)", "\\prod M(1,3,5,7)"], correct: "\\prod M(2,4,6,7)", explanation: "Maxterms (大寫 M) 就係 Minterms 冇包含嘅剩餘數字。" },
      { currentExpression: "F = \\prod M(0,2,4,6,8,10,12,14)", focus: "全部", question: "一個 4-bit 系統，POS 係雙數。咁對應嘅 SOP 係咩？", hint: "4-bit 系統由 0 去到 15。缺咗邊啲數字？", options: ["\\sum m(1,3,5,7,9,11,13,15)", "\\sum m(0,2,4,6,8,10,12,14)", "\\prod M(1,3,5,7)", "\\sum m(1,2,3,4)"], correct: "\\sum m(1,3,5,7,9,11,13,15)", explanation: "SOP 會包含所有未喺 POS 出現過嘅數字，即係所有單數 1, 3, 5...15。" },
      { currentExpression: "F = AB + C", focus: "全部", question: "呢條式唔係 Standard SOP (Canonical)。喺 3-bit (A,B,C) 系統中，如果將佢展開做 Standard SOP，會包含幾多個 Minterms？", hint: "AB 欠 C，展開變 ABC+ABC' (2項)。C 欠 A,B，展開會有 4 項。加埋扣除重複有幾多項？", options: ["5個", "3個", "2個", "6個"], correct: "5個", explanation: "AB = ABC + ABC'。C = A'B'C + A'BC + AB'C + ABC。合併扣除重複的 ABC，總共有 5 項 Minterms！" }
    ]
  },
  {
    level: 3, title: "Task 3：MUX 深入實作篇", isBoss: true,
    steps: [
      { currentExpression: "8-to-1 MUX", focus: "全部", question: "一個 8-to-1 Multiplexer 需要幾多條 Select lines (選擇線)？", hint: "公式係 2^n = 輸入數量。", options: ["3條", "2條", "4條", "8條"], correct: "3條", explanation: "2^3 = 8，所以需要 3 條 Selectors。" },
      { currentExpression: "4-to-1 MUX 設計 F = \\sum m(1,3,5,6)", focus: "全部", question: "用 A, B 作 Selectors。畫表後，當 AB=00 時，對應 Truth Table 邊兩行？", hint: "Truth table 按 ABC 排列。AB=00 對應頭兩行。", options: ["m_0, m_1", "m_1, m_2", "m_2, m_3", "m_0, m_3"], correct: "m_0, m_1", explanation: "AB=00 對應 C=0 (即 m0) 同 C=1 (即 m1)。" },
      { currentExpression: "F = \\sum m(1,3,5,6)", focus: "全部", question: "當 AB=00 時 (m0=0, m1=1)，D_0 應該接去邊？", hint: "C=0時F=0，C=1時F=1。F 嘅數值同 C 係點？", options: ["接去 C", "接去 C'", "接去 0 (Ground)", "接去 1 (Vcc)"], correct: "接去 C", explanation: "F 完美跟隨 C 嘅變化，所以 D_0 接 C。" },
      { currentExpression: "F = \\sum m(1,3,5,6)", focus: "全部", question: "當 AB=01 時 (m2=0, m3=1)，D_1 應該接去邊？", hint: "C=0時F=0，C=1時F=1。", options: ["接去 C", "接去 C'", "接去 0", "接去 1"], correct: "接去 C", explanation: "同樣地，F 跟隨 C 變化，D_1 接 C。" },
      { currentExpression: "F = \\sum m(1,3,5,6)", focus: "全部", question: "當 AB=11 時 (m6=1, m7=0)，D_3 應該接去邊？", hint: "C=0時F=1，C=1時F=0。", options: ["接去 C'", "接去 C", "接去 0", "接去 1"], correct: "接去 C'", explanation: "輸出同 C 相反，所以 D_3 接去 C' (NOT C)。" }
    ]
  },
  {
    level: 4, title: "Task 4：Past Paper Boss (24/25 Sem 1)", isBoss: true,
    steps: [
      { currentExpression: "A'B'C + AB'C + ACD + BCD", focus: "A'B'C + AB'C", question: "觀察頭兩項，可以抽咩公因式？", hint: "睇下有邊啲英文字母係一模一樣嘅。", options: ["抽 B'C", "抽 AB'", "抽 A'C", "無得抽"], correct: "抽 B'C", explanation: "抽 B'C 出來，變成 B'C(A' + A) = B'C。" },
      { currentExpression: "B'C + ACD + BCD", focus: "B'C", question: "試下將 B'C「無中生有」，配上 (1+D) 展開，會變成點？", hint: "因為 1+D 永遠等於 1，乘入去唔會改變數值。", options: ["B'C + B'CD", "B'C + D", "B'CD", "B'C + C"], correct: "B'C + B'CD", explanation: "創造出 B'CD，用嚟同後面嘅 BCD 發生關係！" },
      { currentExpression: "B'C + B'CD + BCD + ACD", focus: "B'CD + BCD", question: "合併中間兩項，會得出咩結果？", hint: "抽 CD 出嚟。", options: ["CD", "C", "BD", "BC"], correct: "CD", explanation: "CD(B' + B) = CD。" },
      { currentExpression: "B'C + CD + ACD", focus: "CD + ACD", question: "尾兩項再合併，得出最終答案係咩？", hint: "抽 CD 出來，會見到 (1+A)。", options: ["B'C + CD", "B'C + ACD", "C + D", "B'C + A"], correct: "B'C + CD", explanation: "CD(1+A) = CD。最終答案 B'C + CD。" }
    ]
  },
  {
    level: 5, title: "Task 5：Past Paper Boss (25/26 Sem 1)", isBoss: true,
    steps: [
      { currentExpression: "a'cd' + abc'd' + a'b'c' + a'b'cd' + ab'd'", focus: "a'b'c' + a'b'cd'", question: "抽出 a'b' 後展開為咩？", hint: "抽 a'b' 後會見到 c' + cd'。用冗餘律化簡。", options: ["a'b'c' + a'b'd'", "a'b'c'", "a'b'd'", "a'b'(c'+d)"], correct: "a'b'c' + a'b'd'", explanation: "c' + cd' 變成 c' + d'。乘入去得 a'b'c' + a'b'd'。" },
      { currentExpression: "a'cd' + abc'd' + a'b'c' + a'b'd' + ab'd'", focus: "a'b'd' + ab'd'", question: "重組後，抽出公因式會得出咩？", hint: "呢兩項有咩相同字母？", options: ["b'd'", "a'd'", "d'", "ab'd'"], correct: "b'd'", explanation: "b'd'(a' + a) = b'd'。" },
      { currentExpression: "a'cd' + abc'd' + a'b'c' + b'd'", focus: "abc'd' + b'd'", question: "抽出 d'，括號內化簡後會變成點？", hint: "d'(abc' + b')。括號內再用冗餘律。", options: ["d'(ac' + b')", "d'(ab + b')", "d'(c' + b')", "d'(a + b')"], correct: "d'(ac' + b')", explanation: "b' + b(ac') 會變成 b' + ac'。結果係 b'd' + ac'd'。" }
    ]
  },
  {
    level: 6, title: "Task 6：NAND 實作與 Cost", isBoss: false,
    steps: [
      { currentExpression: "Y = A'BC + B'C' + AB'", focus: "全部", question: "要只用 NAND gates 畫電路，第一步要點做？", hint: "DeMorgan 需要有大 Bar 先劈得開，點樣可以無中生有？", options: ["加上雙重否定 (Double Inversion)", "抽公因數", "變成 POS 形式", "所有加號變乘號"], correct: "加上雙重否定 (Double Inversion)", explanation: "Y = ((A'BC + B'C' + AB')')'。加兩條 Bar 唔會改變數值，但可以將 OR 變 NAND！" },
      { currentExpression: "Cost = Total Gates + Total Inputs", focus: "全部", question: "Y = ( (A'BC)' \\cdot (B'C')' \\cdot (AB')' )'。總 Inputs 同 Cost 係幾多？", hint: "記得 A, B, C 都要分別過一隻 2-in NAND 變成 A', B', C'。然後慢慢數有幾多隻 Gate 同線。", options: ["Inputs=16, Cost=23", "Inputs=14, Cost=21", "Inputs=18, Cost=25", "Inputs=10, Cost=17"], correct: "Inputs=16, Cost=23", explanation: "Gates = 3(NOT) + 1(3-in) + 2(2-in) + 1(外層) = 7。Inputs = 6+3+2+2+3 = 16。Cost = 23。" }
    ]
  },
  {
    level: 7, title: "Task 7：K-map 卡諾圖圈組", isBoss: false,
    steps: [
      { currentExpression: "K-map 群組：m(0,2,8,10)", focus: "全部", question: "畫 4-variable K-map 時，呢四個數字啱啱好喺四個角落。化簡後會得出咩？", hint: "寫出佢地嘅二進制：0000, 0010, 1000, 1010。睇下邊兩個位永遠係 0？", options: ["B'D'", "A'C'", "BD'", "A'D'"], correct: "B'D'", explanation: "四個數字嘅 B 位同 D 位全部都係 0。所以提取出嚟就係 B'D'！" },
      { currentExpression: "Unused States (例如 Counter 嘅 2, 3)", focus: "全部", question: "如果題目有未出現過嘅狀態，K-map 入面要填咩？", hint: "為咗圈出最大嘅群組，呢啲格仔可以自由當 0 或 1。", options: ["X (Don't care)", "0", "1", "留空"], correct: "X (Don't care)", explanation: "填 X 可以極大化簡方程式。" }
    ]
  },
  {
    level: 8, title: "Task 8：Decoder 砌 Full Adder", isBoss: true,
    steps: [
      { currentExpression: "Full Adder (X, Y, Z)", focus: "全部", question: "用 3-to-8 Decoder 實作，Sum (S) 嘅 Minterms 係咩？", hint: "當輸入有奇數個 1 時 (例如 001, 010, 100, 111)，Sum 就會係 1。", options: ["m_1, m_2, m_4, m_7", "m_3, m_5, m_6, m_7", "m_0, m_1, m_2, m_3", "m_1, m_3, m_5, m_7"], correct: "m_1, m_2, m_4, m_7", explanation: "Sum = \\sum m(1, 2, 4, 7)。" },
      { currentExpression: "Full Adder (X, Y, Z)", focus: "全部", question: "咁 Carry (C) 嘅 Minterms 又係咩？", hint: "當輸入有兩個或以上嘅 1 時，Carry 就會進位。", options: ["m_3, m_5, m_6, m_7", "m_1, m_2, m_4, m_7", "m_0, m_3, m_6, m_7", "m_2, m_4, m_6, m_7"], correct: "m_3, m_5, m_6, m_7", explanation: "Carry = \\sum m(3, 5, 6, 7)。將呢四條線駁落一隻大 OR gate 搞掂。" }
    ]
  },
  {
    level: 9, title: "Task 9：順序邏輯 Counters", isBoss: false,
    steps: [
      { currentExpression: "Seq: 7, 0, 6, 1...", focus: "7", question: "呢個 Counter 最大嘅數字係 7，最少需要幾多個 bits (Flip-flops) 去設計？", hint: "7 轉換做二進制需要幾多個位？", options: ["3-bit", "4-bit", "8-bit", "2-bit"], correct: "3-bit", explanation: "7 = 111_2，佔用 3 個位元，需要 3 個 Flip-flops。" },
      { currentExpression: "Present 6 (110_{2}) \\rightarrow Next 1 (001_{2})", focus: "1 \\rightarrow 0", question: "最高位 A 由 1 變 0。根據 JK Excitation Table，J_A 同 K_A 係？", hint: "Reset (1變0) 口訣：K 必須為 1，J 隨便。", options: ["J=X, K=1", "J=1, K=X", "J=0, K=1", "J=X, K=0"], correct: "J=X, K=1", explanation: "Reset 狀態：K 必須為 1，J 係 Don't care (X)。" }
    ]
  },
  {
    level: 10, title: "Task 10：計數器改裝與非同步", isBoss: true,
    steps: [
      { currentExpression: "New Seq: 9, 2, 8, 3...", focus: "全部", question: "點樣將舊 (7,0,6,1...) 改裝成呢個新 Sequence？", hint: "對比兩組數字，睇下差幾多？", options: ["喺輸出端加個 Adder 設定加 2", "重新畫過所有 K-map", "將 Flip-flop 轉做 D-type", "加入兩個 NOT gates"], correct: "喺輸出端加個 Adder 設定加 2", explanation: "新數值只係舊數值加 2。加個 4-bit Binary Adder (0010_2) 搞掂。" },
      { currentExpression: "Mod-13 Asynchronous Counter", focus: "全部", question: "Mod-13 (數到12)，點樣接駁 NAND gate 去觸發 Reset？", hint: "13 對應二進制 1101_2。將係 1 嗰啲 Q 腳駁入 NAND。", options: ["將 Q_3, Q_2, Q_0 駁入 NAND", "將 Q_3, Q_1 駁入 NAND", "將所有 Q 駁入 NAND", "將 Q_3, Q_2, Q_1 駁入 NAND"], correct: "將 Q_3, Q_2, Q_0 駁入 NAND", explanation: "13 = 1101_2，對應 Q_3, Q_2, Q_0。當去到 13，NAND 輸出 0 觸發 CLR 腳。" }
    ]
  },
  {
    level: 11, title: "Task 11：CMOS 電路設計", isBoss: true,
    steps: [
      { currentExpression: "F = (A + B) \\cdot C", focus: "全部", question: "用 CMOS 畫。NMOS (Pull-down) 入面，加號同乘號代表咩？", hint: "NMOS 嘅規則同我地直覺一樣。加號似並聯定串聯？", options: ["加=並聯，乘=串聯", "加=串聯，乘=並聯", "加=NOT，乘=AND", "加=串聯，乘=串聯"], correct: "加=並聯，乘=串聯", explanation: "NMOS 世界，OR (+) 代表並聯，AND (\\cdot) 代表串聯。" },
      { currentExpression: "F = (A + B) \\cdot C", focus: "全部", question: "咁 PMOS (Pull-up Network) 又點畫？", hint: "PMOS 永遠同 NMOS 相反！", options: ["加=串聯，乘=並聯", "加=並聯，乘=串聯", "同 NMOS 一模一樣", "加=並聯，乘=並聯"], correct: "加=串聯，乘=並聯", explanation: "PMOS 規則相反。A 同 B 會串聯，然後同 C 並聯。" }
    ]
  },
  {
    level: 12, title: "Task 12：ADC 與 DAC 計算", isBoss: false,
    steps: [
      { currentExpression: "5-bit Flash ADC, V_{ref} = 5V", focus: "全部", question: "計算 Step size 係幾多？", hint: "公式：Step size = V_ref / (2^n)。", options: ["0.156V", "0.2V", "0.312V", "0.1V"], correct: "0.156V", explanation: "5 / 32 = 0.15625V。" },
      { currentExpression: "Resolution = 0.39\\%", focus: "0.39\\%", question: "如果 DAC % Resolution 係 0.39%，佢係幾多 bit 嘅 DAC？", hint: "公式：1 / (2^n - 1) = 0.0039。", options: ["8-bit", "6-bit", "7-bit", "10-bit"], correct: "8-bit", explanation: "2^n - 1 = 256.4 -> 2^n ≈ 256 -> n=8。" },
      { currentExpression: "Dual-slope ADC, V_{in}=1.5V, V_{ref}=0.4V, t_{1}=5ms", focus: "全部", question: "計算放電時間 t_2。", hint: "公式：t_2 = t_1 * (V_in / V_ref)。", options: ["18.75ms", "1.33ms", "15ms", "20ms"], correct: "18.75ms", explanation: "5 * (1.5 / 0.4) = 18.75ms。" }
    ]
  },
  {
    level: 13, title: "Task 13：Power Amplifiers", isBoss: true,
    steps: [
      { currentExpression: "Class AB (Resistor Biasing)", focus: "全部", question: "用電阻 Biasing 會產生咩嚴重問題？", hint: "電晶體發熱時，電阻唔會調節電流，最後會燒毀。", options: ["Thermal Runaway (熱失控)", "Crossover Distortion", "Gain 太細", "Voltage Clipping"], correct: "Thermal Runaway (熱失控)", explanation: "導致電流越流越大，最後過熱燒毀！解決方法係換做 Diodes。" },
      { currentExpression: "V_{pp}=16V, R_L=8\\Omega", focus: "全部", question: "計算 Peak current (I_p)。", hint: "先搵 V_p (V_pp 的一半)，然後用 V=IR。", options: ["1A", "2A", "0.5A", "8A"], correct: "1A", explanation: "V_p = 16/2 = 8V。I_p = 8/8 = 1A。" },
      { currentExpression: "I_p=1A, V_{CC}=20V", focus: "全部", question: "計算 DC Input Power (P_{in})。", hint: "先計 I_dc = (2 * I_p) / π。然後 P_in = V_cc * I_dc。", options: ["12.72W", "20W", "10W", "16W"], correct: "12.72W", explanation: "I_dc = 2/3.1416 = 0.636A。P_in = 20 * 0.636 = 12.72W。" }
    ]
  }
];

// 強大草稿紙組件
const Scratchpad = ({ onClose, currentStep, initialData, onSave }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' 或 'text'
  const [textInput, setTextInput] = useState({ visible: false, x: 0, y: 0, text: '' });

  // 初始化畫板大小及背景
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;
    
    canvas.width = containerRef.current.offsetWidth;
    canvas.height = containerRef.current.offsetHeight;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#0f172a'; // slate-950
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = initialData;
    }
    
    document.body.style.overflow = 'hidden'; 
    return () => { document.body.style.overflow = 'auto'; };
  }, [initialData]);

  useEffect(() => {
    if (textInput.visible && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [textInput.visible]);

  const saveCanvas = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'));
    }
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches && e.touches.length > 0) {
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    
    if (e.nativeEvent && 'offsetX' in e.nativeEvent) {
      return {
        offsetX: e.nativeEvent.offsetX,
        offsetY: e.nativeEvent.offsetY
      };
    }
    
    return {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
  };

  const startInteraction = (e) => {
    if (textInput.visible) {
      stampText();
      return; 
    }

    if (tool === 'pen') {
      const { offsetX, offsetY } = getCoordinates(e);
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    } else if (tool === 'text') {
      const { offsetX, offsetY } = getCoordinates(e);
      setTextInput({ visible: true, x: offsetX, y: offsetY, text: '' });
    }
  };

  const draw = (e) => {
    if (!isDrawing || tool !== 'pen') return;
    e.preventDefault(); 
    const { offsetX, offsetY } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = '#22d3ee'; // cyan-400
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing || tool !== 'pen') return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.closePath();
    setIsDrawing(false);
    saveCanvas();
  };

  const stampText = () => {
    if (textInput.visible && textInput.text.trim() !== '') {
      const ctx = canvasRef.current.getContext('2d');
      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = '#22d3ee';
      ctx.fillText(textInput.text, textInput.x, textInput.y + 18); 
      saveCanvas();
    }
    setTextInput({ visible: false, x: 0, y: 0, text: '' });
  };

  const clearCanvas = () => {
    if(window.confirm("確定要清空呢一題嘅草稿？")) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveCanvas();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
      
      <div className="w-full max-w-4xl flex flex-col mb-2 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-slate-700/50 bg-slate-800/50">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <PenTool className="w-5 h-5"/> 獨立草稿紙
          </h2>
          <button onClick={onClose} className="p-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 hover:text-white transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <div className="p-4 bg-slate-800/30 text-sm md:text-base">
          <p className="text-cyan-400 font-mono font-bold mb-1">{renderFormattedText(currentStep.currentExpression)}</p>
          <p className="text-slate-300">{renderFormattedText(currentStep.question)}</p>
        </div>
        
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setTool('pen'); stampText(); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tool === 'pen' ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
            >
              <PenTool className="w-4 h-4"/> 畫筆
            </button>
            <button 
              onClick={() => { setTool('text'); setIsDrawing(false); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${tool === 'text' ? 'bg-yellow-900/50 text-yellow-400 border border-yellow-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
            >
              <Type className="w-4 h-4"/> 文字
            </button>
            {tool === 'text' && !textInput.visible && (
              <span className="text-yellow-400 text-xs font-bold animate-pulse ml-2 hidden sm:inline-block">
                👉 請點擊畫板任意位置
              </span>
            )}
          </div>
          <button onClick={clearCanvas} className="p-2 bg-red-900/20 text-red-400 rounded-lg hover:bg-red-900/40 border border-red-900/30 transition-colors flex items-center gap-2 text-sm font-bold">
            <Trash2 className="w-4 h-4"/> 清除
          </button>
        </div>
      </div>

      <div 
        ref={containerRef} 
        className={`relative w-full max-w-4xl h-[50vh] bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.1)] touch-none ${tool === 'text' ? 'cursor-text' : 'cursor-crosshair'}`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startInteraction}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startInteraction}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full"
        />
        
        {textInput.visible && (
          <input
            ref={inputRef}
            type="text"
            value={textInput.text}
            onChange={(e) => setTextInput(prev => ({...prev, text: e.target.value}))}
            onBlur={stampText}
            onKeyDown={(e) => { 
              if (e.key === 'Enter') {
                e.preventDefault();
                stampText(); 
              }
            }}
            onMouseDown={(e) => e.stopPropagation()} 
            onTouchStart={(e) => e.stopPropagation()}
            style={{ left: textInput.x, top: textInput.y - 10 }}
            className="absolute bg-slate-900/90 text-[#22d3ee] font-mono text-[20px] font-bold outline-none border border-cyan-500/50 rounded px-2 py-1 m-0 z-10 min-w-[200px] shadow-2xl"
            placeholder="輸入... (Enter確認)"
          />
        )}
      </div>
      <p className="text-slate-500 mt-4 text-xs font-mono text-center">畫完或打完字會自動存檔。每題草稿獨立保存。</p>
    </div>
  );
};

export default function ExamReviewGame() {
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scratchpads, setScratchpads] = useState({}); 
  
  const [view, setView] = useState('start');
  const [saveStatus, setSaveStatus] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOnlyMistakes, setShowOnlyMistakes] = useState(false);
  const [hasSaveFile, setHasSaveFile] = useState(false);
  
  const [showHint, setShowHint] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('sehs3313-exam-save-v9');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (Object.keys(parsed.answers || {}).length > 0 || Object.keys(parsed.scratchpads || {}).length > 0) {
          setAnswers(parsed.answers || {});
          setScratchpads(parsed.scratchpads || {});
          setCurrentLevelIdx(parsed.currentLevelIdx || 0);
          setCurrentStepIdx(parsed.currentStepIdx || 0);
          setHasSaveFile(true);
        }
      } catch (e) {
        console.error("讀取存檔失敗", e);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(answers).length > 0 || currentLevelIdx > 0 || Object.keys(scratchpads).length > 0) {
      const dataToSave = { answers, currentLevelIdx, currentStepIdx, scratchpads };
      localStorage.setItem('sehs3313-exam-save-v9', JSON.stringify(dataToSave));
      setHasSaveFile(true);
      if (view === 'game') {
        setSaveStatus('💾 自動存檔中...');
        const timer = setTimeout(() => setSaveStatus(''), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [answers, currentLevelIdx, currentStepIdx, scratchpads, view]);

  const currentLevel = GAME_LEVELS[currentLevelIdx];
  const currentStep = currentLevel?.steps[currentStepIdx];
  const stepKey = `${currentLevelIdx}-${currentStepIdx}`;
  const hasAnswered = !!answers[stepKey];
  const selectedOption = answers[stepKey];
  const isCorrect = selectedOption === currentStep?.correct;
  const totalQuestions = GAME_LEVELS.reduce((acc, level) => acc + level.steps.length, 0);

  const shuffledOptions = useMemo(() => {
    if (!currentStep) return [];
    const opts = [...currentStep.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [currentLevelIdx, currentStepIdx]);

  const calculateScore = () => {
    let score = 0;
    Object.keys(answers).forEach(key => {
      const [lIdx, sIdx] = key.split('-').map(Number);
      if (answers[key] === GAME_LEVELS[lIdx].steps[sIdx].correct) score++;
    });
    return score;
  };

  const score = calculateScore();

  const handleOptionClick = (option) => {
    if (hasAnswered) return; 
    setAnswers(prev => ({ ...prev, [stepKey]: option }));
  };

  const handleNext = () => {
    setShowHint(false); 
    if (currentStepIdx < currentLevel.steps.length - 1) {
      setCurrentStepIdx(c => c + 1);
    } else if (currentLevelIdx < GAME_LEVELS.length - 1) {
      setCurrentLevelIdx(l => l + 1);
      setCurrentStepIdx(0);
    } else {
      setView('report');
      setShowOnlyMistakes(false);
    }
  };

  const handlePrev = () => {
    setShowHint(false); 
    if (currentStepIdx > 0) {
      setCurrentStepIdx(c => c - 1);
    } else if (currentLevelIdx > 0) {
      setCurrentLevelIdx(l => l - 1);
      setCurrentStepIdx(GAME_LEVELS[currentLevelIdx - 1].steps.length - 1);
    }
  };

  const handleRestart = () => {
    if(window.confirm("確定要重置所有紀錄？你嘅答題同所有草稿都會被清空。")) {
      setAnswers({});
      setScratchpads({}); 
      setCurrentLevelIdx(0);
      setCurrentStepIdx(0);
      setShowHint(false);
      setView('game');
      setIsMenuOpen(false);
      setHasSaveFile(false);
      localStorage.removeItem('sehs3313-exam-save-v9');
    }
  };

  const jumpToTask = (taskIdx) => {
    setCurrentLevelIdx(taskIdx);
    setCurrentStepIdx(0);
    setShowHint(false);
    setIsMenuOpen(false);
    setView('game');
  };

  const calculateProgress = () => {
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / totalQuestions) * 100;
  };

  const getMistakeAnalysis = () => {
    const mistakes = [];
    GAME_LEVELS.forEach((level, lIdx) => {
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

  // --- OVERLAY: TASK MENU ---
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
          {GAME_LEVELS.map((task, idx) => {
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
                    Task {idx + 1}
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
          
          <button onClick={() => { setIsMenuOpen(false); setView('report'); setShowOnlyMistakes(false); }} className="w-full mt-4 p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-400" /> 查看成績報告
          </button>
          <button onClick={() => { setIsMenuOpen(false); setView('notes'); }} className="w-full mt-2 p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2">
            <BookMarked className="w-5 h-5 text-yellow-400" /> 閱讀終極筆記
          </button>
          <button onClick={() => { setIsMenuOpen(false); setView('start'); }} className="w-full mt-2 p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5 text-slate-400" /> 返回首頁
          </button>
          <button onClick={handleRestart} className="w-full mt-6 p-4 rounded-xl border border-red-900/30 bg-red-950/20 hover:bg-red-900/40 text-red-400 transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5" /> 重置所有紀錄
          </button>
        </div>
      </div>
    </div>
  );

  // --- VIEW: START SCREEN ---
  if (view === 'start') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-2xl w-full text-center relative z-10 space-y-8">
          <div className="inline-block mb-4 p-4 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-2xl">
            <Cpu className="w-24 h-24 text-cyan-400 mx-auto drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500">
            SEHS3313<br/>終極特訓 RPG
          </h1>
          <p className="text-xl text-slate-400 font-medium max-w-lg mx-auto leading-relaxed">
            涵蓋全卷 Q1 - Q4，加入 Assignment 變態題。<br/>由零基礎到 A+ 嘅必經之路！
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <button 
              onClick={() => setView('game')}
              className="w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6 fill-current" />
              {hasSaveFile ? '繼續遊戲 (Resume)' : '開始特訓 (Start)'}
            </button>
            <button 
              onClick={() => setView('notes')}
              className="w-full sm:w-auto px-8 py-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-2xl font-bold text-xl transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <BookMarked className="w-6 h-6 text-yellow-400" />
              閱讀圖解筆記
            </button>
          </div>

          {hasSaveFile && (
            <div className="mt-8 pt-8 border-t border-slate-800/50">
              <button onClick={handleRestart} className="text-red-400 hover:text-red-300 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors">
                <RefreshCw className="w-4 h-4" /> 重置進度重新開始
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- VIEW: NOTES VIEWER ---
  if (view === 'notes') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
        <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-yellow-400 flex items-center gap-2">
            <BookMarked className="w-6 h-6" /> 終極圖解筆記
          </h1>
          <button onClick={() => setView('start')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors border border-slate-700">
            <LogOut className="w-4 h-4" /> 返回首頁
          </button>
        </div>

        <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-12 space-y-12 pb-24 text-base md:text-lg">
          <div className="text-center pb-8 border-b border-slate-800">
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4 leading-normal">SEHS3313 萬字詳盡溫習筆記</h1>
            <p className="text-slate-400 font-mono text-sm">根據 22/23 - 25/26 歷屆試題及 Assignments 終極精煉</p>
          </div>

          {/* Section 1 */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-3 pb-3 border-b border-cyan-900/30">
              <span className="bg-cyan-900/50 p-2 rounded-xl">1</span> 數字系統與基礎運算
            </h2>
            
            <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-cyan-400 w-5 h-5"/> 進制轉換 (連除法圖解)</h3>
              <p className="text-slate-300">將十進制轉為二進制，重點係由下至上讀取餘數。</p>
              
              <div className="bg-slate-950 p-5 rounded-2xl font-mono text-sm md:text-base text-emerald-400 border border-emerald-900/30 overflow-x-auto shadow-inner">
                <span className="text-slate-500 block mb-2">// 將 140 轉為二進制：</span>
                2 |  140 <br/>
                &nbsp;&nbsp;|-------<br/>
                2 |   70  ... 0  (最尾位 LSB)<br/>
                &nbsp;&nbsp;|-------<br/>
                2 |   35  ... 0<br/>
                &nbsp;&nbsp;|-------<br/>
                2 |   17  ... 1<br/>
                &nbsp;&nbsp;|-------<br/>
                2 |    8  ... 1<br/>
                &nbsp;&nbsp;|-------<br/>
                2 |    4  ... 0<br/>
                &nbsp;&nbsp;|-------<br/>
                2 |    2  ... 0<br/>
                &nbsp;&nbsp;|-------<br/>
                2 |    1  ... 0<br/>
                &nbsp;&nbsp;|-------<br/>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;0  ... 1  (最頭位 MSB)<br/><br/>
                <span className="text-yellow-400 font-bold">答案：由底讀上 → 10001100<sub>2</sub></span>
              </div>
            </div>

            <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-cyan-400 w-5 h-5"/> 2's Complement 二進制減法</h3>
              <p className="text-slate-300">電腦冇減法器，計算 <span className="font-mono text-cyan-300">A - B</span> 必須轉化為 <span className="font-mono text-cyan-300">A + (-B)</span>。</p>
              
              <div className="bg-slate-950 p-5 rounded-2xl font-mono text-sm md:text-base text-emerald-400 border border-emerald-900/30 overflow-x-auto shadow-inner">
                <span className="text-slate-500 block mb-2">// 計算 94 - 45 (要求用 9-bit 系統)</span>
                [Step 1] 準備 A 同 B：<br/>
                A = 94 = 001011110<sub>2</sub><br/>
                B = 45 = 000101101<sub>2</sub><br/><br/>
                
                [Step 2] 將 B 轉為 2's Complement (-B)：<br/>
                &nbsp;&nbsp;000101101  (原本嘅 B)<br/>
                ↓ 111010010  (1/0 全部反轉)<br/>
                + &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1  (最尾加 1)<br/>
                -------------<br/>
                &nbsp;&nbsp;<span className="text-yellow-400">111010011</span>  (呢個就係 -B)<br/><br/>

                [Step 3] 直式相加 (A + (-B))：<br/>
                &nbsp;&nbsp;&nbsp;001011110  (A)<br/>
                + &nbsp;111010011  (-B)<br/>
                -------------<br/>
                &nbsp;<span className="text-red-400">1</span> 000110001 <br/><br/>
                <span className="text-red-400">🚨 第 10 個 bit 溢出 (Overflow)，直接當垃圾掉咗佢！</span><br/>
                <span className="text-yellow-400 font-bold">答案：000110001<sub>2</sub></span>
              </div>
            </div>

            <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-cyan-400 w-5 h-5"/> 代數化簡三大神技</h3>
              <ul className="list-none space-y-4 pl-0">
                <li className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <strong className="text-cyan-300">1. 吸收律：</strong> {renderFormattedText("A + AB = A")} 
                  <span className="text-slate-400 text-sm ml-2">(大食細)</span>
                </li>
                <li className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <strong className="text-cyan-300">2. 冗餘律 (極常用)：</strong> {renderFormattedText("X + X'Y = X + Y")}
                  <br/><span className="text-slate-400 text-sm">解說：出面有原身 X，入面有反相 X'，個 X' 係多餘嘅，直接刪除！</span>
                </li>
                <li className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                  <strong className="text-cyan-300">3. 重複使用法：</strong> {renderFormattedText("X = X + X")} 
                  <br/><span className="text-slate-400 text-sm">解說：將一項複製，分俾其他項做合併。</span>
                </li>
              </ul>

              <h4 className="text-lg font-bold text-white mt-6 border-t border-slate-700 pt-6"> NAND/NOR Cost 成本計算</h4>
              <p className="text-slate-300 text-sm">如果題目要求「只用 NAND gates」，首先要為算式加上**雙重否定 (Double Inversion)**，然後用 DeMorgan 將最底層嘅 <span className="font-mono text-cyan-300">+</span> 變做 <span className="font-mono text-cyan-300">·</span>。</p>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-sm text-slate-300 font-mono">
                Cost 公式：<br/>
                <span className="text-emerald-400 font-bold">Cost = Total Gates (邏輯閘總數) + Total Inputs (輸入線總數)</span>
                <br/><br/>
                <span className="text-red-400">🚨 注意：</span> 就算只係一個 A 變成 A'，都要用一隻 2-input NAND 當 NOT gate 用 (計 1 個 gate 同 2 條 inputs)！
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-6 mt-12">
            <h2 className="text-2xl font-bold text-purple-400 flex items-center gap-3 pb-3 border-b border-purple-900/30">
              <span className="bg-purple-900/50 p-2 rounded-xl">2</span> 組合邏輯 (K-map 與 MUX)
            </h2>
            
            <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-purple-400 w-5 h-5"/> SOP 與 POS 極速互換</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li><strong>SOP (Sum of Products)：</strong> 符號 {renderFormattedText("∑m")}。專注 Output = 1。見 1 寫原字母，見 0 寫反相 (')。</li>
                <li><strong>POS (Product of Sums)：</strong> 符號 {renderFormattedText("∏M")}。專注 Output = 0。見 0 寫原字母，見 1 寫反相 (')。</li>
              </ul>
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 text-emerald-400 font-mono text-sm md:text-base">
                互補法則：3-bit 系統 (0-7)。<br/>
                如果 SOP 係 {renderFormattedText("F = \\sum m(0,1,3,5)")}<br/>
                咁 POS 就係補齊淨低嘅數字：{renderFormattedText("F = \\prod M(2,4,6,7)")}
              </div>
            </div>

            <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl overflow-hidden">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-purple-400 w-5 h-5"/> 4-Variable K-map 實戰圖解</h3>
              <p className="text-slate-300">
                邊緣 Gray Code 排序必須係 <span className="font-mono bg-slate-900 px-2 py-1 rounded">00, 01, 11, 10</span>。<br/>
                實戰示範：{renderFormattedText("F = \\sum m(0,2,8,10) + d(3,7,11,15)")}
              </p>
              
              <div className="overflow-x-auto bg-slate-900 p-4 rounded-xl border border-slate-700">
                <table className="w-full text-center border-collapse min-w-[300px]">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400">
                      <th className="p-3 border-r border-slate-700">AB \ CD</th>
                      <th className="p-3">00</th><th className="p-3">01</th><th className="p-3">11</th><th className="p-3">10</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-lg md:text-xl">
                    <tr>
                      <td className="p-3 border-r border-slate-700 text-slate-400">00</td>
                      <td className="p-3 text-yellow-400 font-bold bg-yellow-900/20 border-2 border-yellow-500/50 rounded-tl-lg">[1]</td>
                      <td className="p-3">0</td>
                      <td className="p-3 text-cyan-400 font-bold bg-cyan-900/20 border-t-2 border-cyan-500/50">X</td>
                      <td className="p-3 text-yellow-400 font-bold bg-yellow-900/20 border-2 border-yellow-500/50 rounded-tr-lg">[1]</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-700 text-slate-400">01</td>
                      <td className="p-3">0</td><td className="p-3">0</td>
                      <td className="p-3 text-cyan-400 font-bold bg-cyan-900/20 border-x-2 border-cyan-500/50">X</td>
                      <td className="p-3">0</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-700 text-slate-400">11</td>
                      <td className="p-3">0</td><td className="p-3">0</td>
                      <td className="p-3 text-cyan-400 font-bold bg-cyan-900/20 border-x-2 border-cyan-500/50">X</td>
                      <td className="p-3">0</td>
                    </tr>
                    <tr>
                      <td className="p-3 border-r border-slate-700 text-slate-400">10</td>
                      <td className="p-3 text-yellow-400 font-bold bg-yellow-900/20 border-2 border-yellow-500/50 rounded-bl-lg">[1]</td>
                      <td className="p-3">0</td>
                      <td className="p-3 text-cyan-400 font-bold bg-cyan-900/20 border-b-2 border-cyan-500/50">X</td>
                      <td className="p-3 text-yellow-400 font-bold bg-yellow-900/20 border-2 border-yellow-500/50 rounded-br-lg">[1]</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-2 mt-4">
                <li><span className="text-yellow-400 font-bold">黃色圈組 (四角群組法)：</span> 最左最右、最上最下係相連的！四個角對應 <span className="font-mono bg-slate-900 px-2 py-1 rounded text-yellow-400">{renderFormattedText("B'D'")}</span></li>
                <li><span className="text-cyan-400 font-bold">藍色圈組 (食埋啲 X)：</span> 將所有 X 當成 1 嚟圈成一直條，對應 <span className="font-mono bg-slate-900 px-2 py-1 rounded text-cyan-400">CD</span></li>
              </ul>
            </div>

            <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-purple-400 w-5 h-5"/> MUX 4-to-1 神級推導法</h3>
              <p className="text-slate-300">將 A, B 駁去 Selectors，留低 C 作為 Data Inputs (D0 - D3)。兩行一組觀察 F 同 C 嘅關係：</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm md:text-base font-mono">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <span className="text-slate-500 block mb-2">// F 同 C 一模一樣</span>
                  C=0 → F=0<br/>C=1 → F=1<br/>
                  <span className="text-emerald-400 font-bold mt-2 block">D_x 駁去 C</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <span className="text-slate-500 block mb-2">// F 同 C 完全相反</span>
                  C=0 → F=1<br/>C=1 → F=0<br/>
                  <span className="text-cyan-400 font-bold mt-2 block">D_x 駁去 C'</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <span className="text-slate-500 block mb-2">// F 永遠係 0</span>
                  C=0 → F=0<br/>C=1 → F=0<br/>
                  <span className="text-slate-300 font-bold mt-2 block">D_x 駁去 0 (地線)</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                  <span className="text-slate-500 block mb-2">// F 永遠係 1</span>
                  C=0 → F=1<br/>C=1 → F=1<br/>
                  <span className="text-yellow-400 font-bold mt-2 block">D_x 駁去 1 (Vcc)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-purple-400 w-5 h-5"/> Decoder 實作 Full Adder</h3>
              <p className="text-slate-300">用 3-to-8 Decoder，輸入 X, Y, Z。</p>
              <ul className="list-disc list-inside space-y-3 pl-4 text-slate-300">
                <li><strong>Sum (S) = {renderFormattedText("\\sum m(1, 2, 4, 7)")}</strong><br/><span className="text-sm ml-6 text-slate-400">→ 將 Decoder 嘅 1, 2, 4, 7 號腳駁入 OR gate。</span></li>
                <li><strong>Carry (C) = {renderFormattedText("\\sum m(3, 5, 6, 7)")}</strong><br/><span className="text-sm ml-6 text-slate-400">→ 將 Decoder 嘅 3, 5, 6, 7 號腳駁入另一隻 OR gate。</span></li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-6 mt-12">
            <h2 className="text-2xl font-bold text-orange-400 flex items-center gap-3 pb-3 border-b border-orange-900/30">
              <span className="bg-orange-900/50 p-2 rounded-xl">3</span> 順序邏輯 Counters
            </h2>
            
            <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-orange-400 w-5 h-5"/> JK Flip-Flop 狀態轉移口訣</h3>
              <p className="text-slate-300">要填 Transition Table，記住呢四句：</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 font-mono text-sm md:text-base">
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                  <span className="text-slate-300">0 變 1 (Set)</span>
                  <span className="text-emerald-400 font-bold text-lg">{renderFormattedText("J=1, K=X")}</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                  <span className="text-slate-300">1 變 0 (Reset)</span>
                  <span className="text-emerald-400 font-bold text-lg">{renderFormattedText("J=X, K=1")}</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                  <span className="text-slate-400">0 變 0 (保持)</span>
                  <span className="text-slate-300 font-bold">{renderFormattedText("J=0, K=X")}</span>
                </div>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                  <span className="text-slate-400">1 變 1 (保持)</span>
                  <span className="text-slate-300 font-bold">{renderFormattedText("J=X, K=0")}</span>
                </div>
              </div>
              <p className="text-red-400 text-sm mt-4 font-bold border-t border-slate-700 pt-4">
                🚨 注意：Sequence 中無出現過嘅數字 (Unused States)，佢哋嘅 Next State 同所有 J,K 輸入，一律填滿 X (Don't care)！
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 shadow-xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><CheckCircle2 className="text-orange-400 w-5 h-5"/> 計數器神級改裝</h3>
                <p className="text-slate-300 text-sm mb-4">將舊 Sequence 改為新 Sequence，千祈唔好重新畫過 K-map！</p>
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 font-mono text-xs md:text-sm text-cyan-300">
                  舊：7, 0, 6, 1, 5...<br/>
                  新：9, 2, 8, 3, 7...<br/><br/>
                  <span className="text-emerald-400">觀察：新數字全部 = 舊數字 + 2</span><br/><br/>
                  做法：喺舊 Output 加上 4-bit Binary Adder，設定加 2 (0010_2) 即完成改裝！
                </div>
              </div>

              <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 shadow-xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><CheckCircle2 className="text-orange-400 w-5 h-5"/> 非同步計數器 (Mod-13)</h3>
                <p className="text-slate-300 text-sm mb-4">Asynchronous Counter 特性：去到目標數字瞬間即刻 Reset。</p>
                <div className="bg-red-950/30 p-4 rounded-xl border border-red-900/50 font-mono text-xs md:text-sm text-red-200">
                  Mod-13 代表數 0 到 12。<br/>
                  當去到 13 ({renderFormattedText("1101_2")}) 時要瞬間清零。<br/><br/>
                  接駁：將等於 1 嘅腳 (Q3, Q2, Q0) 駁入一隻 NAND gate，NAND 輸出駁去所有 Flip-flop 嘅 CLR 腳。
                </div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-6 mt-12">
            <h2 className="text-2xl font-bold text-emerald-400 flex items-center gap-3 pb-3 border-b border-emerald-900/30">
              <span className="bg-emerald-900/50 p-2 rounded-xl">4</span> 模擬電路與 CMOS
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-emerald-400 w-5 h-5"/> ADC / DAC 送分公式</h3>
                <ul className="list-none space-y-3 font-mono text-sm md:text-base">
                  <li className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span className="text-cyan-400 block mb-1">Flash ADC (最快):</span>
                    Comparators = {renderFormattedText("2^n - 1")}<br/>
                    Step Size = {renderFormattedText("V_{ref} / 2^n")}
                  </li>
                  <li className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span className="text-purple-400 block mb-1">Dual-slope ADC:</span>
                    {renderFormattedText("t_2 = t_1 \\times (V_{in} / V_{ref})")}
                  </li>
                  <li className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span className="text-yellow-400 block mb-1">R-2R DAC:</span>
                    % Res = {renderFormattedText("(1 / (2^n - 1)) \\times 100\\%")}<br/>
                    {renderFormattedText("V_{out} = V_{High} \\times (Input / 2^n)")}
                  </li>
                </ul>
              </div>

              <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-emerald-400 w-5 h-5"/> CMOS 邏輯設計</h3>
                <p className="text-slate-300 text-sm mb-4">實作 {renderFormattedText("F = (A+B) \\cdot C")}</p>
                <div className="space-y-3 font-mono text-sm">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span className="text-blue-400 font-bold block mb-1">NMOS (Pull-down 駁地線)</span>
                    <span className="text-slate-300">+ = 並聯, · = 串聯</span><br/>
                    A同B並聯，然後同C串聯。
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                    <span className="text-red-400 font-bold block mb-1">PMOS (Pull-up 駁 Vdd)</span>
                    <span className="text-slate-300">+ = 串聯, · = 並聯 (相反!)</span><br/>
                    A同B串聯，然後同C並聯。
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/40 p-5 md:p-8 rounded-3xl border border-slate-700/50 space-y-6 shadow-xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle2 className="text-emerald-400 w-5 h-5"/> Power Amplifiers (功率放大器)</h3>
              <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/30 mb-4">
                <p className="text-red-300 text-sm">
                  <strong className="text-red-400">Class AB 致命缺點：</strong> 用電阻 (Resistors) 做 Biasing 會引發 <strong>Thermal Runaway (熱失控)</strong>，燒毀電路。<br/>
                  <strong className="text-emerald-400 mt-2 block">解決方案：</strong> 換成 <strong>Diodes (二極管)</strong>，完美穩定偏壓並消除 Crossover Distortion。
                </p>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl font-mono text-sm md:text-base text-cyan-300 border border-cyan-900/30 overflow-x-auto shadow-inner">
                <span className="text-slate-500 block mb-2">// 效率 (η) 計算 6 步曲 (殺手題)</span>
                [1] Peak Voltage:  V_p = V_pp / 2<br/>
                [2] Peak Current:  I_p = V_p / R_L<br/>
                [3] DC 電流:        I_dc = (2 × I_p) / π<br/>
                [4] DC Input Pwr:  P_in = V_cc × I_dc<br/>
                [5] AC Output Pwr: P_out= (V_p × I_p) / 2<br/>
                [6] 效率 (Eff):     η = (P_out / P_in) × 100%
              </div>
            </div>
          </section>

          <div className="flex justify-center pt-8">
            <button onClick={() => setView('game')} className="px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl font-bold text-xl md:text-2xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95 flex items-center gap-3">
              <Play className="w-6 h-6 fill-current" /> 溫完，即刻去實戰！
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: REPORT ---
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
              <button onClick={() => setView('start')} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all border border-slate-600">
                返回首頁
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
            {GAME_LEVELS.map((level, lIdx) => {
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

  // --- VIEW: GAME ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans flex flex-col items-center relative">
      <TaskMenu />
      
      {saveStatus && (
        <div className="fixed top-4 right-4 bg-slate-800 text-emerald-400 px-4 py-2 rounded-full border border-slate-700 shadow-lg text-sm font-medium flex items-center gap-2 animate-pulse z-40">
          <Save className="w-4 h-4" /> {saveStatus}
        </div>
      )}

      {showScratchpad && (
        <Scratchpad 
          onClose={() => setShowScratchpad(false)} 
          currentStep={currentStep}
          initialData={scratchpads[stepKey]}
          onSave={(data) => setScratchpads(prev => ({...prev, [stepKey]: data}))}
        />
      )}

      <div className="max-w-3xl w-full">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(true)} className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors shadow-lg group" title="打開任務選單">
              <Menu className="w-6 h-6 text-slate-300 group-hover:text-cyan-400 transition-colors" />
            </button>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 hidden sm:flex items-center gap-2">
              <Cpu className="text-cyan-400" />
              SEHS3313 終極特訓 RPG
            </h1>
          </div>
          
          <div className="bg-slate-800/80 backdrop-blur px-5 py-2.5 rounded-full border border-slate-700 font-mono text-sm shadow-lg flex items-center">
            <span className="text-slate-400 hidden sm:inline mr-2">Score:</span> 
            <span className="text-emerald-400 font-bold text-lg">{score}</span>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-xs font-medium text-slate-400 mb-2 px-1">
            <span>Overall Progress ({currentLevelIdx + 1}/{GAME_LEVELS.length})</span>
            <span>{Math.round(calculateProgress())}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 shadow-inner overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 h-full transition-all duration-500 ease-out" style={{ width: `${calculateProgress()}%` }}></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden mb-6 flex flex-col relative">
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

            <div className="mt-6 flex flex-wrap gap-3">
              {!hasAnswered && currentStep.hint && (
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${showHint ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
                >
                  <Lightbulb className="w-4 h-4" />
                  {showHint ? '隱藏提示' : '需要提示 (Hint)？'}
                </button>
              )}
              
              <button 
                onClick={() => setShowScratchpad(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-cyan-900/40 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-800/50 transition-all"
              >
                <PenTool className="w-4 h-4" />
                🖊️ 草稿紙 (計數/畫 K-map)
              </button>
            </div>

            {!hasAnswered && currentStep.hint && showHint && (
              <div className="mt-4 p-4 bg-yellow-950/30 border border-yellow-900/50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-yellow-200/90 text-base leading-relaxed">
                  💡 <strong>提示：</strong>{renderFormattedText(currentStep.hint)}
                </p>
              </div>
            )}
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
              <button key={idx} onClick={() => handleOptionClick(option)} disabled={hasAnswered} className={`group relative p-5 rounded-2xl border-2 text-left font-mono text-xl transition-all ${btnClass}`}>
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
            {currentLevelIdx === GAME_LEVELS.length - 1 && currentStepIdx === currentLevel.steps.length - 1 ? '查看成績報告' : '下一步'}
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}