# 品类经营分析系统 — 开发计划

版本：V1  
整理日期：2026-06-01  
需求来源：`doc/category-operations-analysis-requirements.md`

---

## 一、项目概况

| 项目 | 说明 |
|------|------|
| 系统名称 | 品类经营分析系统 |
| 第一用户 | 经营分析岗（月度经营会前数据整理、诊断与汇报输出） |
| V1 交付形态 | 本地可跑 Web 应用 + 标准 Excel 模板 |
| 技术栈 | React 18 + TypeScript + Vite 6 + Tailwind CSS v4 |
| 运行环境 | Node.js 22.x，开发端口 5173 |

---

## 二、模块清单与状态

共 12 个导航模块：

| # | 模块 ID | 模块名称 | 状态 | 备注 |
|---|---------|----------|------|------|
| 1 | `dashboard` | 经营驾驶舱 | ✅ 已完成 | BP 版本栏、质量横幅、4 期趋势、结论卡、8 KPI、利润桥、下月 3 项动作、品类表、渠道表 |
| 2 | `bp` | 年度 BP 管理 | 🔲 待开发 | BP 上传与锁定、目标版本管理 |
| 3 | `roadmap` | 新品/SPU Roadmap | 🔲 待开发 | ANALYSIS_MOCK.roadmap 数据已就绪 |
| 4 | `import` | 数据导入/编辑 | ✅ 基础可用 | Excel 上传 + 固定成本表单；后续需配合正式模板调整 |
| 5 | `settings` | 参数设置 | 🔲 占位页 | 分摊规则、平台扣点、费用归属等参数配置 |
| 6 | `methodology` | 口径说明 | 🔲 占位页 | 5 层 P&L 口径定义文档页 |
| 7 | `product` | 产品/品类利润 | 🔲 待开发 | ANALYSIS_MOCK.categories 数据已就绪 |
| 8 | `channel` | 渠道盈亏 | ⚠️ 需重构 | 当前用 CVP legacy；需切换到 5 层 P&L + ANALYSIS_MOCK.channels |
| 9 | `marketing` | 营销敏感性 | 🔲 待开发 | ANALYSIS_MOCK.marketing 数据已就绪 |
| 10 | `cost` | 成本敏感性 | ✅ 已完成 | CVP 模型场景推演，保留 |
| 11 | `variance` | BP 偏差归因 | 🔲 待开发 | 需要 BP 目标 vs 实际的差异分解结构 |
| 12 | `report` | 经营会报告 | 🔲 待开发 | 汇报导出（PDF/打印），依赖其他模块完成 |

---

## 三、开发优先级与排期

### 第一阶段：核心分析模块（高优先级）

**原则**：ANALYSIS_MOCK 数据已就绪的模块优先，可直接看到效果。

| 优先级 | 模块 | 工作量估算 | 依赖 |
|--------|------|-----------|------|
| P1 | 渠道盈亏（重构） | M | 无（数据已有） |
| P1 | 产品/品类利润 | M | 无（数据已有） |
| P1 | 新品/SPU Roadmap | S | 无（数据已有） |
| P2 | 营销敏感性 | M | 无（数据已有） |

### 第二阶段：BP 管理与偏差分析

| 优先级 | 模块 | 工作量估算 | 依赖 |
|--------|------|-----------|------|
| P2 | 年度 BP 管理 | L | 需确认 BP 模板字段映射 |
| P3 | BP 偏差归因 | L | 依赖年度 BP 管理完成 |

### 第三阶段：配置与输出

| 优先级 | 模块 | 工作量估算 | 依赖 |
|--------|------|-----------|------|
| P3 | 参数设置 | M | 无 |
| P3 | 口径说明 | S | 无 |
| P4 | 经营会报告（导出） | L | 依赖主要分析模块完成 |

> 工作量参考：S = 半天内，M = 1-2 天，L = 3 天以上

---

## 四、数据架构说明

### 4.1 两套模型并存

| 模型 | 用途 | 数据来源 |
|------|------|---------|
| 5 层 P&L（主模型） | 经营驾驶舱、渠道盈亏、产品利润、营销分析、BP 偏差 | `src/lib/mockData.ts` → `ANALYSIS_MOCK` |
| CVP 盈亏平衡（辅助） | 成本敏感性场景推演 | `src/lib/mockData.ts` → `MOCK_PERIODS` |

### 4.2 5 层 P&L 结构

```
GMV
  └─ 扣减：退货/折扣 → GSV
       └─ 扣减：平台扣点/运费 → 净销售收入
            └─ 扣减：商品成本(COGS) → 商品毛利
                 └─ 扣减：渠道直接费用 → 渠道贡献
                      └─ 扣减：营销费用 → 营销后贡献
                           └─ 扣减：品类分摊费用 → 品类经营贡献
```

### 4.3 数据颗粒度

V1 核心颗粒度：`月份 × 品类/系列 × SPU × SKU × 渠道 × 客户类型`

---

## 五、关键文件索引

| 文件 | 说明 |
|------|------|
| `dashboard-app/src/types/index.ts` | 全部类型定义（TabId、BridgeItem、KpiItem、CategoryData、ChannelData 等） |
| `dashboard-app/src/lib/mockData.ts` | ANALYSIS_MOCK（5 层 P&L 模拟数据）+ MOCK_PERIODS（CVP legacy） |
| `dashboard-app/src/lib/calculations.ts` | CVP 计算引擎 |
| `dashboard-app/src/store/index.ts` | useAppState()：periods / activePeriod / activeTab |
| `dashboard-app/src/components/layout/Header.tsx` | 12 Tab 导航 + 操作按钮 |
| `dashboard-app/src/pages/Dashboard.tsx` | 经营驾驶舱（已完成） |
| `dashboard-app/src/pages/ChannelAnalysis.tsx` | 渠道盈亏（需重构） |
| `dashboard-app/src/pages/ScenarioSimulation.tsx` | 成本敏感性（已完成） |
| `dashboard-app/src/pages/DataEntry.tsx` | 数据导入/编辑（基础可用） |
| `doc/category-operations-analysis-requirements.md` | 完整需求文档（923 行） |
| `doc/2026BP.xlsx` | 年度 BP 模板参考 |

---

## 六、V1 暂不做

- BP 审批流
- 云端多人协作 / 账号权限体系
- ERP / 电商平台 API 自动同步
- 复杂机器学习归因模型
- 财务总账系统替代

---

## 七、待澄清的开放问题

以下问题在需求校准时已记录，待后续单独讨论：

1. BP 模板字段与系统 5 层 P&L 字段的精确映射关系
2. 客户类型（新客/老客/渠道经销商）的数据可用性
3. 行业大盘数据的录入方式（手动输入 vs 导入）
4. 复购数据的来源与颗粒度
5. 库存明细（原材料/在制品/成品）的拆分口径

---

*本文档由 Claude Code 根据项目记忆与需求文档自动整理，如有出入请以需求文档为准。*
