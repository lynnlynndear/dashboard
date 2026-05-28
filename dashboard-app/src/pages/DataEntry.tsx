import { useState, useRef } from 'react';
import type { PeriodData, OrderRecord, FixedCostItem } from '../types';
import { MOCK_FIXED_COSTS } from '../lib/mockData';

interface DataEntryProps {
  onDataLoaded: (data: PeriodData) => void;
}

export function DataEntry({ onDataLoaded }: DataEntryProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [period, setPeriod] = useState('2024-11');
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>(MOCK_FIXED_COSTS);
  const [preview, setPreview] = useState<OrderRecord[]>([]);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    // Placeholder: in real app, use xlsx library to parse
    // For static prototype, we generate sample preview data
    const mockPreview: OrderRecord[] = Array.from({ length: 8 }, (_, i) => ({
      id: `${period}-${String(i + 1).padStart(4, '0')}`,
      date: `${period}-${String(i + 5).padStart(2, '0')}`,
      channel: ['天猫', '抖音', '线下门店', '京东'][i % 4],
      category: ['主力款', '引流款', '利润款'][i % 3],
      product: ['A款连衣裙', 'B款上衣', 'C款裤装', 'F款高端外套'][i % 4],
      quantity: (i + 1) * 2,
      revenue: (i + 1) * 3800,
      directCost: (i + 1) * 2800,
      platformFee: (i + 1) * 190,
      commission: (i + 1) * 304,
      freight: (i + 1) * 50,
      returnAmount: i === 3 ? 3800 : 0,
    }));
    setPreview(mockPreview);
    setActiveStep(2);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = () => {
    const data: PeriodData = {
      period,
      orders: preview,
      fixedCosts,
    };
    onDataLoaded(data);
    setActiveStep(3);
  };

  const updateFixedCost = (id: string, amount: number) => {
    setFixedCosts((prev) => prev.map((f) => f.id === id ? { ...f, amount } : f));
  };

  const totalFixed = fixedCosts.reduce((s, f) => s + f.amount, 0);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        {([1, 2, 3] as const).map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${activeStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {step}
            </div>
            <span className={`text-xs ${activeStep >= step ? 'text-gray-800' : 'text-gray-400'}`}>
              {step === 1 ? '上传数据' : step === 2 ? '确认配置' : '完成录入'}
            </span>
            {step < 3 && <span className="text-gray-200 text-lg">›</span>}
          </div>
        ))}
      </div>

      {activeStep === 3 ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <div className="font-bold text-emerald-800 text-lg">数据录入成功</div>
          <div className="text-sm text-emerald-700 mt-1">{period} 期数据已加载，可切换到经营看板查看分析结果</div>
          <button onClick={() => setActiveStep(1)} className="mt-4 text-sm text-blue-600 underline">重新上传</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Upload + Preview */}
          <div className="lg:col-span-2 space-y-4">
            {/* Period selector */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-3">1. 选择数据期间</h3>
              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-500">期间</label>
                <input
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Upload Zone */}
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-3">2. 上传订单数据</h3>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
                <div className="text-3xl mb-2">📄</div>
                <div className="text-sm font-medium text-gray-700">拖拽文件到此处，或点击上传</div>
                <div className="text-xs text-gray-400 mt-1">支持 .xlsx · .xls · .csv 格式</div>
                {fileName && <div className="mt-2 text-xs text-blue-600 font-medium">已选择：{fileName}</div>}
              </div>

              <div className="mt-3 bg-blue-50 rounded-lg p-3">
                <div className="text-xs font-medium text-blue-800 mb-1.5">📋 数据格式要求</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                  {['日期', '渠道', '产品/品类', '数量', '销售额', '直接成本', '平台费', '佣金/推广费', '运费', '退款金额'].map((col) => (
                    <span key={col} className="text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{col}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Table */}
            {preview.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-gray-800">数据预览</h3>
                  <span className="text-xs text-gray-400">共 {preview.length} 条（示例）</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        {['日期', '渠道', '产品', '数量', '销售额', '直接成本', '平台费', '佣金', '运费', '退款'].map((h) => (
                          <th key={h} className="px-2 py-2 text-left text-gray-500 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row) => (
                        <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-2 py-1.5 text-gray-600">{row.date}</td>
                          <td className="px-2 py-1.5 text-gray-700 font-medium">{row.channel}</td>
                          <td className="px-2 py-1.5 text-gray-600 max-w-24 truncate">{row.product}</td>
                          <td className="px-2 py-1.5 text-gray-600">{row.quantity}</td>
                          <td className="px-2 py-1.5 text-gray-800 font-medium">¥{row.revenue.toLocaleString()}</td>
                          <td className="px-2 py-1.5 text-gray-600">¥{row.directCost.toLocaleString()}</td>
                          <td className="px-2 py-1.5 text-gray-600">¥{row.platformFee.toLocaleString()}</td>
                          <td className="px-2 py-1.5 text-gray-600">¥{row.commission.toLocaleString()}</td>
                          <td className="px-2 py-1.5 text-gray-600">¥{row.freight.toLocaleString()}</td>
                          <td className={`px-2 py-1.5 ${row.returnAmount > 0 ? 'text-red-600' : 'text-gray-300'}`}>
                            {row.returnAmount > 0 ? `¥${row.returnAmount.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 p-2.5 bg-amber-50 border border-amber-100 rounded text-xs text-amber-800">
                  ⚠ 请检查<strong>渠道名称</strong>是否与系统一致（天猫、抖音、线下门店、京东），不一致会导致渠道分析出错
                </div>
              </div>
            )}
          </div>

          {/* Right: Fixed Costs Config */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 h-fit">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">3. 配置固定成本</h3>
            <div className="text-xs text-gray-400 mb-3">每月固定发生，与销量无关</div>
            <div className="space-y-3">
              {(['人工', '房租', '管理', '营销', '其他'] as const).map((cat) => {
                const items = fixedCosts.filter((f) => f.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <div className="text-xs font-semibold text-gray-500 mb-1.5">{cat}</div>
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-gray-600 flex-1 min-w-0 truncate">{item.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">¥</span>
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateFixedCost(item.id, Number(e.target.value))}
                            className="w-24 text-xs border border-gray-200 rounded px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">固定成本合计</span>
              <span className="text-sm font-bold text-gray-800">¥{totalFixed.toLocaleString()}</span>
            </div>

            {preview.length > 0 && (
              <button
                onClick={handleConfirm}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                确认录入 →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
