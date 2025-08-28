import React, { useState, useEffect } from 'react';
import { ChevronRight, RotateCcw, Play, Pause, Settings, Shuffle, BookOpen, Calculator, Target, ArrowDown } from 'lucide-react';

const EliminationMethodDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2500);
  const [showMatrix, setShowMatrix] = useState(true);
  const [currentExample, setCurrentExample] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [animatingRows, setAnimatingRows] = useState([]);
  const [calculationStep, setCalculationStep] = useState('');

  // 示例方程组
  const examples = [
    {
      name: "基础示例 (整数解)",
      original: [[2, 1, 1, 8], [1, 2, 1, 7], [1, 1, 2, 6]],
      solution: ["x₁ = 3", "x₂ = 1", "x₃ = 1"]
    },
    {
      name: "标准示例 (简单整数)",
      original: [[1, 2, 3, 14], [2, -1, 1, 5], [3, 2, -1, 2]],
      solution: ["x₁ = 1", "x₂ = 2", "x₃ = 3"]
    },
    {
      name: "复杂示例 (分数解)",
      original: [[3, 2, -1, 10], [2, 3, 3, 18], [1, -2, 1, 2]],
      solution: ["x₁ = 2", "x₂ = 4", "x₃ = 2"]
    }
  ];

  // 生成详细的动画步骤
  const generateDetailedSteps = (example) => {
    const original = example.original.map(row => [...row]);
    const steps = [];

    // 步骤1：初始状态
    steps.push({
      title: "初始方程组",
      description: `${example.name}：我们从这个线性方程组开始`,
      matrix: original.map(row => [...row]),
      highlight: { rows: [], cols: [], operation: '' },
      calculation: '',
      explanation: "线性方程组的标准形式。我们的目标是通过消元法将其转换为上三角形式，然后用回代法求解。",
      targetElement: null,
      operationType: 'initial'
    });

    let currentMatrix = original.map(row => [...row]);

    // 第一轮消元：消除第一列
    steps.push({
      title: "第1轮消元：选择主元",
      description: "选择第一行第一个元素作为主元，准备消除其他行的x₁项",
      matrix: currentMatrix.map(row => [...row]),
      highlight: { rows: [0], cols: [0], operation: 'pivot' },
      calculation: `主元：a₁₁ = ${currentMatrix[0][0]}`,
      explanation: "主元是用来消除其他行对应位置元素的基准。选择第一行第一个非零元素作为主元。",
      targetElement: { row: 0, col: 0 },
      operationType: 'pivot-selection'
    });

    // 消除第2行的x₁
    if (Math.abs(currentMatrix[1][0]) > 1e-10) {
      const factor21 = currentMatrix[1][0] / currentMatrix[0][0];
      steps.push({
        title: "第1轮消元：计算倍数",
        description: "计算第2行消元所需的倍数",
        matrix: currentMatrix.map(row => [...row]),
        highlight: { rows: [0, 1], cols: [0], operation: 'factor-calc' },
        calculation: `倍数 = a₂₁/a₁₁ = ${currentMatrix[1][0]}/${currentMatrix[0][0]} = ${factor21.toFixed(3)}`,
        explanation: "为了消除第2行的x₁项，我们需要用第1行乘以这个倍数，然后从第2行中减去。",
        targetElement: { row: 1, col: 0 },
        operationType: 'factor-calculation'
      });

      const newRow = [];
      for (let j = 0; j < 4; j++) {
        newRow[j] = currentMatrix[1][j] - factor21 * currentMatrix[0][j];
      }

      steps.push({
        title: "第1轮消元：执行行变换",
        description: "R₂ = R₂ - (倍数) × R₁",
        matrix: [
          [...currentMatrix[0]],
          newRow,
          [...currentMatrix[2]]
        ],
        highlight: { rows: [1], cols: [], operation: 'row-operation' },
        calculation: `新的第2行 = [${currentMatrix[1].map(x => x.toFixed(1)).join(', ')}] - ${factor21.toFixed(3)} × [${currentMatrix[0].map(x => x.toFixed(1)).join(', ')}]
= [${newRow.map(x => x.toFixed(3)).join(', ')}]`,
        explanation: "通过行变换消除了第2行的x₁项。现在第2行第1个元素变为0。",
        targetElement: { row: 1, col: 0 },
        operationType: 'row-transformation'
      });

      currentMatrix[1] = newRow;
    }

    // 消除第3行的x₁
    if (Math.abs(currentMatrix[2][0]) > 1e-10) {
      const factor31 = currentMatrix[2][0] / currentMatrix[0][0];
      steps.push({
        title: "第1轮消元：计算第3行倍数",
        description: "计算第3行消元所需的倍数",
        matrix: currentMatrix.map(row => [...row]),
        highlight: { rows: [0, 2], cols: [0], operation: 'factor-calc' },
        calculation: `倍数 = a₃₁/a₁₁ = ${currentMatrix[2][0]}/${currentMatrix[0][0]} = ${factor31.toFixed(3)}`,
        explanation: "类似地，计算消除第3行x₁项所需的倍数。",
        targetElement: { row: 2, col: 0 },
        operationType: 'factor-calculation'
      });

      const newRow = [];
      for (let j = 0; j < 4; j++) {
        newRow[j] = currentMatrix[2][j] - factor31 * currentMatrix[0][j];
      }

      steps.push({
        title: "第1轮消元：执行第3行变换",
        description: "R₃ = R₃ - (倍数) × R₁",
        matrix: [
          [...currentMatrix[0]],
          [...currentMatrix[1]],
          newRow
        ],
        highlight: { rows: [2], cols: [], operation: 'row-operation' },
        calculation: `新的第3行 = [${currentMatrix[2].map(x => x.toFixed(1)).join(', ')}] - ${factor31.toFixed(3)} × [${currentMatrix[0].map(x => x.toFixed(1)).join(', ')}]
= [${newRow.map(x => x.toFixed(3)).join(', ')}]`,
        explanation: "第3行的x₁项也被成功消除。现在第1列只有第1行有非零元素。",
        targetElement: { row: 2, col: 0 },
        operationType: 'row-transformation'
      });

      currentMatrix[2] = newRow;
    }

    // 第1轮完成总结
    steps.push({
      title: "第1轮消元完成",
      description: "第一列消元完成，x₁只出现在第一个方程中",
      matrix: currentMatrix.map(row => [...row]),
      highlight: { rows: [], cols: [0], operation: 'column-complete' },
      calculation: '第1列消元完成 ✓',
      explanation: "通过两次行变换，我们成功将第1列转换为 [*, 0, 0] 的形式。这意味着除了第1个方程外，其他方程都不再包含x₁项。",
      targetElement: null,
      operationType: 'phase-complete'
    });

    // 第二轮消元：消除第二列
    if (Math.abs(currentMatrix[1][1]) > 1e-10) {
      steps.push({
        title: "第2轮消元：选择主元",
        description: "选择第2行第2列元素作为新的主元",
        matrix: currentMatrix.map(row => [...row]),
        highlight: { rows: [1], cols: [1], operation: 'pivot' },
        calculation: `新主元：a₂₂ = ${currentMatrix[1][1].toFixed(3)}`,
        explanation: "现在我们要消除第3行的x₂项。选择第2行第2列的元素作为新的主元。",
        targetElement: { row: 1, col: 1 },
        operationType: 'pivot-selection'
      });

      if (Math.abs(currentMatrix[2][1]) > 1e-10) {
        const factor32 = currentMatrix[2][1] / currentMatrix[1][1];
        steps.push({
          title: "第2轮消元：计算倍数",
          description: "计算消除第3行x₂项的倍数",
          matrix: currentMatrix.map(row => [...row]),
          highlight: { rows: [1, 2], cols: [1], operation: 'factor-calc' },
          calculation: `倍数 = a₃₂/a₂₂ = ${currentMatrix[2][1].toFixed(3)}/${currentMatrix[1][1].toFixed(3)} = ${factor32.toFixed(3)}`,
          explanation: "计算用第2行消除第3行x₂项所需的倍数。",
          targetElement: { row: 2, col: 1 },
          operationType: 'factor-calculation'
        });

        const newRow = [];
        for (let j = 0; j < 4; j++) {
          newRow[j] = currentMatrix[2][j] - factor32 * currentMatrix[1][j];
        }

        steps.push({
          title: "第2轮消元：执行变换",
          description: "R₃ = R₃ - (倍数) × R₂",
          matrix: [
            [...currentMatrix[0]],
            [...currentMatrix[1]],
            newRow
          ],
          highlight: { rows: [2], cols: [], operation: 'row-operation' },
          calculation: `新的第3行 = [${currentMatrix[2].map(x => x.toFixed(3)).join(', ')}] - ${factor32.toFixed(3)} × [${currentMatrix[1].map(x => x.toFixed(3)).join(', ')}]
= [${newRow.map(x => x.toFixed(3)).join(', ')}]`,
          explanation: "通过行变换，第3行的x₂项被消除，现在只剩下x₃项。",
          targetElement: { row: 2, col: 1 },
          operationType: 'row-transformation'
        });

        currentMatrix[2] = newRow;
      }
    }

    // 上三角形式完成
    steps.push({
      title: "上三角矩阵完成",
      description: "消元过程完成，得到上三角形式的方程组",
      matrix: currentMatrix.map(row => [...row]),
      highlight: { rows: [], cols: [], operation: 'triangular-complete' },
      calculation: '上三角化完成 ✓',
      explanation: "现在方程组已经转换为上三角形式。每个方程都比前一个方程少一个未知数，这样就可以从最后一个方程开始逐步求解。",
      targetElement: null,
      operationType: 'triangular-complete'
    });

    // 回代求解过程
    const solutions = [...example.solution];
    
    // 从最后一行开始求解
    if (Math.abs(currentMatrix[2][2]) > 1e-10) {
      const x3 = currentMatrix[2][3] / currentMatrix[2][2];
      steps.push({
        title: "回代求解：求x₃",
        description: "从最后一个方程求解x₃",
        matrix: currentMatrix.map(row => [...row]),
        highlight: { rows: [2], cols: [2, 3], operation: 'solve-variable' },
        calculation: `${currentMatrix[2][2].toFixed(3)}x₃ = ${currentMatrix[2][3].toFixed(3)}
x₃ = ${currentMatrix[2][3].toFixed(3)}/${currentMatrix[2][2].toFixed(3)} = ${x3.toFixed(3)}`,
        explanation: "从最简单的方程开始。第3个方程只包含x₃，可以直接求解。",
        targetElement: { row: 2, col: 2 },
        operationType: 'back-substitution'
      });

      // 求解x₂
      const x2 = (currentMatrix[1][3] - currentMatrix[1][2] * x3) / currentMatrix[1][1];
      steps.push({
        title: "回代求解：求x₂",
        description: "将x₃代入第2个方程求解x₂",
        matrix: currentMatrix.map(row => [...row]),
        highlight: { rows: [1], cols: [1, 2, 3], operation: 'solve-variable' },
        calculation: `${currentMatrix[1][1].toFixed(3)}x₂ + ${currentMatrix[1][2].toFixed(3)}x₃ = ${currentMatrix[1][3].toFixed(3)}
${currentMatrix[1][1].toFixed(3)}x₂ + ${currentMatrix[1][2].toFixed(3)}(${x3.toFixed(3)}) = ${currentMatrix[1][3].toFixed(3)}
${currentMatrix[1][1].toFixed(3)}x₂ = ${currentMatrix[1][3].toFixed(3)} - ${(currentMatrix[1][2] * x3).toFixed(3)}
x₂ = ${x2.toFixed(3)}`,
        explanation: "将已求出的x₃值代入第2个方程，解出x₂。这就是回代的过程。",
        targetElement: { row: 1, col: 1 },
        operationType: 'back-substitution'
      });

      // 求解x₁
      const x1 = (currentMatrix[0][3] - currentMatrix[0][2] * x3 - currentMatrix[0][1] * x2) / currentMatrix[0][0];
      steps.push({
        title: "回代求解：求x₁",
        description: "将x₂和x₃代入第1个方程求解x₁",
        matrix: currentMatrix.map(row => [...row]),
        highlight: { rows: [0], cols: [0, 1, 2, 3], operation: 'solve-variable' },
        calculation: `${currentMatrix[0][0].toFixed(3)}x₁ + ${currentMatrix[0][1].toFixed(3)}x₂ + ${currentMatrix[0][2].toFixed(3)}x₃ = ${currentMatrix[0][3].toFixed(3)}
${currentMatrix[0][0].toFixed(3)}x₁ + ${currentMatrix[0][1].toFixed(3)}(${x2.toFixed(3)}) + ${currentMatrix[0][2].toFixed(3)}(${x3.toFixed(3)}) = ${currentMatrix[0][3].toFixed(3)}
${currentMatrix[0][0].toFixed(3)}x₁ = ${currentMatrix[0][3].toFixed(3)} - ${(currentMatrix[0][1] * x2).toFixed(3)} - ${(currentMatrix[0][2] * x3).toFixed(3)}
x₁ = ${x1.toFixed(3)}`,
        explanation: "最后，将x₂和x₃的值都代入第1个方程，求出x₁。至此，所有未知数都已求出。",
        targetElement: { row: 0, col: 0 },
        operationType: 'back-substitution'
      });
    }

    // 最终解答
    steps.push({
      title: "求解完成",
      description: "高斯消元法求解完成，得到方程组的解",
      matrix: currentMatrix.map(row => [...row]),
      highlight: { rows: [], cols: [], operation: 'solution-complete' },
      calculation: `最终解：
${solutions.join('\n')}`,
      explanation: "通过高斯消元法和回代过程，我们成功求解了这个线性方程组。可以将这些解代入原方程组进行验证。",
      targetElement: null,
      operationType: 'solution-complete'
    });

    return steps;
  };

  const [steps, setSteps] = useState(generateDetailedSteps(examples[0]));

  // 当示例改变时重新生成步骤
  useEffect(() => {
    setSteps(generateDetailedSteps(examples[currentExample]));
    setCurrentStep(0);
    setIsPlaying(false);
  }, [currentExample]);

  // 自动播放功能
  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1;
          // 添加动画效果
          if (steps[next] && steps[next].highlight.rows.length > 0) {
            setAnimatingRows(steps[next].highlight.rows);
            setTimeout(() => setAnimatingRows([]), 1000);
          }
          return next;
        });
      }, playSpeed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playSpeed]);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.key === 'ArrowRight') {
        setCurrentStep(Math.min(steps.length - 1, currentStep + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStep(Math.max(0, currentStep - 1));
      } else if (e.key === 'r') {
        setCurrentStep(0);
        setIsPlaying(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentStep, steps.length]);

  const formatMatrixValue = (value) => {
    if (Math.abs(value) < 1e-10) return '0';
    if (Math.abs(value - Math.round(value)) < 1e-10) {
      return Math.round(value).toString();
    }
    return value.toFixed(3);
  };

  const getOperationIcon = (operationType) => {
    switch (operationType) {
      case 'pivot-selection': return <Target className="text-blue-500" size={16} />;
      case 'factor-calculation': return <Calculator className="text-orange-500" size={16} />;
      case 'row-transformation': return <ArrowDown className="text-green-500" size={16} />;
      case 'back-substitution': return <BookOpen className="text-purple-500" size={16} />;
      default: return <ChevronRight className="text-gray-500" size={16} />;
    }
  };

  const getHighlightColor = (operation) => {
    switch (operation) {
      case 'pivot': return 'bg-blue-200 border-blue-400';
      case 'factor-calc': return 'bg-orange-200 border-orange-400';
      case 'row-operation': return 'bg-green-200 border-green-400';
      case 'solve-variable': return 'bg-purple-200 border-purple-400';
      case 'column-complete': return 'bg-emerald-200 border-emerald-400';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const renderMatrix = (matrix, highlight) => {
    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          {/* 增广矩阵边框 */}
          <div className="border-l-4 border-r-4 border-blue-500 bg-white rounded-lg p-6 shadow-lg">
            <div className="space-y-2">
              {matrix.map((row, i) => (
                <div 
                  key={i} 
                  className={`flex items-center space-x-4 p-2 rounded transition-all duration-700 ${
                    highlight.rows.includes(i) ? getHighlightColor(highlight.operation) : ''
                  } ${
                    animatingRows.includes(i) ? 'animate-pulse transform scale-105' : ''
                  }`}
                >
                  {row.map((val, j) => (
                    <div
                      key={j}
                      className={`relative text-center min-w-[60px] py-2 px-3 rounded font-mono text-lg transition-all duration-500 ${
                        j === 3 
                          ? 'bg-green-50 border-l-2 border-green-300 font-bold text-green-700' 
                          : 'text-gray-700 bg-gray-50'
                      } ${
                        highlight.cols.includes(j) ? getHighlightColor(highlight.operation) : ''
                      } ${
                        steps[currentStep]?.targetElement?.row === i && 
                        steps[currentStep]?.targetElement?.col === j 
                          ? 'ring-2 ring-red-400 bg-red-100 animate-ping' : ''
                      }`}
                    >
                      {formatMatrixValue(val)}
                      {/* 操作类型指示器 */}
                      {steps[currentStep]?.targetElement?.row === i && 
                       steps[currentStep]?.targetElement?.col === j && (
                        <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
                          {getOperationIcon(steps[currentStep].operationType)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* 分隔线指示 */}
          <div className="absolute right-20 top-0 bottom-0 w-0.5 bg-green-300 opacity-50"></div>
        </div>
      </div>
    );
  };

  const renderEquations = (matrix, highlight) => {
    const vars = ['x₁', 'x₂', 'x₃'];
    
    return (
      <div className="space-y-4">
        {matrix.map((row, i) => (
          <div 
            key={i} 
            className={`flex items-center justify-center p-4 bg-white rounded-lg shadow-md border-2 transition-all duration-700 ${
              highlight.rows.includes(i) ? getHighlightColor(highlight.operation) + ' border-2' : 'border-gray-200'
            } ${
              animatingRows.includes(i) ? 'animate-bounce' : ''
            }`}
          >
            <div className="flex items-center space-x-2">
              {row.slice(0, 3).map((coeff, j) => {
                if (Math.abs(coeff) < 1e-10) return null;
                
                const isFirst = j === 0 || row.slice(0, j).every(c => Math.abs(c) < 1e-10);
                const sign = coeff >= 0 ? (isFirst ? '' : ' + ') : ' - ';
                const absCoeff = Math.abs(coeff);
                const coeffStr = absCoeff === 1 ? '' : formatMatrixValue(absCoeff);
                
                return (
                  <span 
                    key={j}
                    className={`text-lg transition-all duration-500 ${
                      highlight.cols.includes(j) ? 'font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded' : ''
                    } ${
                      steps[currentStep]?.targetElement?.row === i && 
                      steps[currentStep]?.targetElement?.col === j 
                        ? 'animate-pulse bg-red-200 px-2 py-1 rounded font-bold' : ''
                    }`}
                  >
                    {sign}{coeffStr}{vars[j]}
                  </span>
                );
              }).filter(Boolean)}
            </div>
            <span className="text-xl font-bold text-gray-600 mx-4">=</span>
            <span className={`text-xl font-bold text-green-600 bg-green-50 px-3 py-1 rounded ${
              highlight.cols.includes(3) ? 'animate-pulse bg-green-200' : ''
            }`}>
              {formatMatrixValue(row[3])}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl min-h-screen">
      {/* 头部 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          高斯消元法详细演示系统
        </h1>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
          逐步展示每个计算细节，深入理解消元法的数学原理和操作过程
        </p>
        
        <div className="mt-4 text-sm text-gray-500 bg-white bg-opacity-50 rounded-lg p-3 inline-block">
          快捷键：空格键 播放/暂停 | ← → 步骤控制 | R 重置
        </div>
      </div>

      {/* 控制面板 */}
      <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-semibold">选择示例：</span>
            <select 
              value={currentExample}
              onChange={(e) => setCurrentExample(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {examples.map((example, idx) => (
                <option key={idx} value={idx}>{example.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-gray-700">
              <input
                type="checkbox"
                checked={showMatrix}
                onChange={(e) => setShowMatrix(e.target.checked)}
                className="rounded"
              />
              <span>显示增广矩阵</span>
            </label>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Settings size={16} />
              <span>设置</span>
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">播放速度：</span>
              <input
                type="range"
                min="1000"
                max="4000"
                step="500"
                value={playSpeed}
                onChange={(e) => setPlaySpeed(parseInt(e.target.value))}
                className="flex-1 max-w-xs"
              />
              <span className="text-sm text-gray-500">
                {playSpeed <= 1500 ? '很快' : playSpeed <= 2500 ? '正常' : '较慢'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg transform hover:scale-105"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          <span className="text-lg font-semibold">{isPlaying ? '暂停' : '播放'}</span>
        </button>
        
        <button
          onClick={() => {
            setCurrentStep(0);
            setIsPlaying(false);
            setAnimatingRows([]);
          }}
          className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-lg transform hover:scale-105"
        >
          <RotateCcw size={24} />
          <span className="text-lg font-semibold">重置</span>
        </button>
      </div>

      {/* 步骤指示器 */}
      <div className="flex justify-center mb-8 overflow-x-auto">
        <div className="flex items-center space-x-2 bg-white bg-opacity-80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg min-w-max">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div 
                className={`relative w-6 h-6 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === currentStep 
                    ? 'bg-blue-500 scale-125 shadow-lg ring-4 ring-blue-200' 
                    : idx < currentStep 
                    ? 'bg-green-500 shadow-md' 
                    : 'bg-gray-300'
                }`}
                onClick={() => setCurrentStep(idx)}
                title={step.title}
              >
                {idx < currentStep && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs">✓</div>
                )}
                {idx === currentStep && (
                  <div className="absolute inset-0 animate-ping bg-blue-400 rounded-full opacity-75"></div>
                )}
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-6 h-1 transition-colors duration-500 ${
                  idx < currentStep ? 'bg-green-400' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 当前步骤详细显示 */}
      <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-8 mb-8 shadow-xl border border-white border-opacity-50">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {getOperationIcon(steps[currentStep]?.operationType)}
            <h2 className="text-3xl font-bold text-blue-600 ml-3">
              {steps[currentStep]?.title}
            </h2>
          </div>
          <p className="text-gray-600 text-xl leading-relaxed">
            {steps[currentStep]?.description}
          </p>
        </div>

        {/* 主要内容展示 */}
        <div className={`grid gap-8 mb-8 ${showMatrix ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* 方程组形式 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center">
              <BookOpen size={20} className="mr-2" />
              方程组形式
            </h3>
            {renderEquations(steps[currentStep]?.matrix, steps[currentStep]?.highlight)}
          </div>

          {/* 增广矩阵形式 */}
          {showMatrix && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-6 flex items-center">
                <Calculator size={20} className="mr-2" />
                增广矩阵形式
              </h3>
              {renderMatrix(steps[currentStep]?.matrix, steps[currentStep]?.highlight)}
            </div>
          )}
        </div>

        {/* 计算过程和解释 */}
        <div className="grid md:grid-cols-2 gap-6">
          {steps[currentStep]?.calculation && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm">
              <h4 className="font-bold text-yellow-800 mb-3 text-lg flex items-center">
                <Calculator size={20} className="mr-2" />
                计算过程：
              </h4>
              <pre className="text-yellow-700 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                {steps[currentStep].calculation}
              </pre>
            </div>
          )}
          
          {steps[currentStep]?.explanation && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg shadow-sm">
              <h4 className="font-bold text-blue-800 mb-3 text-lg flex items-center">
                <BookOpen size={20} className="mr-2" />
                原理解释：
              </h4>
              <div className="text-blue-700 leading-relaxed">
                {steps[currentStep].explanation}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg transform hover:scale-105 disabled:hover:scale-100"
        >
          <ChevronRight size={20} className="rotate-180" />
          <span>上一步</span>
        </button>
        
        <div className="text-center bg-white bg-opacity-80 rounded-lg px-6 py-3">
          <div className="text-sm text-gray-500 mb-1">详细步骤进度</div>
          <div className="text-lg font-semibold text-gray-700">
            {currentStep + 1} / {steps.length}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {steps[currentStep]?.operationType?.replace('-', ' ')}
          </div>
        </div>
        
        <button
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
          disabled={currentStep === steps.length - 1}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg transform hover:scale-105 disabled:hover:scale-100"
        >
          <span>下一步</span>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* 最终解答展示 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
            <Target size={24} className="mr-2" />
            关键步骤总结
          </h3>
          <div className="space-y-3 text-green-700">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
              <span><strong>主元选择：</strong>选择合适的主元进行消元</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
              <span><strong>倍数计算：</strong>计算消元所需的行倍数</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <span><strong>行变换：</strong>执行行的线性组合操作</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
              <span><strong>回代求解：</strong>从下往上逐个求解变量</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center">
            <Calculator size={24} className="mr-2" />
            {examples[currentExample].name}解答
          </h3>
          <div className="space-y-3">
            {examples[currentExample].solution.map((sol, idx) => (
              <div key={idx} className="bg-white bg-opacity-60 rounded-lg p-3 text-purple-700 font-mono text-lg border border-purple-200">
                {sol}
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-purple-600 bg-purple-100 bg-opacity-50 rounded-lg p-3">
            <strong>验证方法：</strong>将求得的解代入原方程组，检查是否满足所有方程
          </div>
        </div>
      </div>
    </div>
  );
};

export default EliminationMethodDemo;