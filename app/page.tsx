"use client";

import { useMemo, useState } from "react";

type NumberFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
};

function NumberField({
  label,
  value,
  onChange,
  unit,
  min = 0,
  max,
  step = 0.1,
  hint,
}: NumberFieldProps) {
  return (
    <label className="field">
      <span className="field-head">
        <span>{label}</span>
        <span className="number-wrap">
          <input
            type="number"
            inputMode="decimal"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) onChange(next);
            }}
          />
          <small>{unit}</small>
        </span>
      </span>
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

function RangeField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  step = 1,
  hint,
}: NumberFieldProps & { min: number; max: number }) {
  return (
    <label className="range-field">
      <span className="field-head">
        <span>{label}</span>
        <strong>
          {value}
          {unit}
        </strong>
      </span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {hint && <span className="hint">{hint}</span>}
    </label>
  );
}

const money = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

const integer = (value: number) =>
  new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 0 }).format(
    Number.isFinite(value) ? value : 0,
  );

export default function Home() {
  const [salePrice, setSalePrice] = useState(25);
  const [platformRate, setPlatformRate] = useState(25);
  const [beefPrice, setBeefPrice] = useState(29);
  const [yieldRate, setYieldRate] = useState(70);
  const [cookedWeight, setCookedWeight] = useState(80);
  const [operationLoss, setOperationLoss] = useState(3);

  const [riceCost, setRiceCost] = useState(0.8);
  const [sideCost, setSideCost] = useState(0.5);
  const [seasoningCost, setSeasoningCost] = useState(0.65);
  const [packageCost, setPackageCost] = useState(1);
  const [otherUnitCost, setOtherUnitCost] = useState(0.25);

  const [dailyOrders, setDailyOrders] = useState(80);
  const [openDays, setOpenDays] = useState(30);
  const [rent, setRent] = useState(8000);
  const [labor, setLabor] = useState(12000);
  const [utilities, setUtilities] = useState(2500);
  const [otherFixed, setOtherFixed] = useState(1000);

  const calc = useMemo(() => {
    const safeYield = Math.max(yieldRate, 1) / 100;
    const beefBase = (beefPrice / 500) * (cookedWeight / safeYield);
    const beefCost = beefBase * (1 + operationLoss / 100);
    const otherFood =
      riceCost + sideCost + seasoningCost + packageCost + otherUnitCost;
    const unitCost = beefCost + otherFood;
    const settlement = salePrice * (1 - platformRate / 100);
    const contribution = settlement - unitCost;
    const fixed = rent + labor + utilities + otherFixed;
    const monthlyOrders = dailyOrders * openDays;
    const monthlyProfit = contribution * monthlyOrders - fixed;
    const breakEvenDaily =
      contribution > 0 && openDays > 0
        ? Math.ceil(fixed / contribution / openDays)
        : Infinity;
    const margin =
      settlement > 0 ? (contribution / settlement) * 100 : 0;
    const monthlyMargin =
      settlement * monthlyOrders > 0
        ? (monthlyProfit / (settlement * monthlyOrders)) * 100
        : 0;
    const foodRate = salePrice > 0 ? (unitCost / salePrice) * 100 : 0;
    const rawWeight = cookedWeight / safeYield;
    const piecesMin = Math.ceil(cookedWeight / 22);
    const piecesMax = Math.ceil(cookedWeight / 18);

    return {
      beefBase,
      beefCost,
      unitCost,
      settlement,
      contribution,
      fixed,
      monthlyProfit,
      breakEvenDaily,
      margin,
      monthlyMargin,
      foodRate,
      rawWeight,
      piecesMin,
      piecesMax,
    };
  }, [
    beefPrice,
    cookedWeight,
    dailyOrders,
    labor,
    openDays,
    operationLoss,
    otherFixed,
    otherUnitCost,
    packageCost,
    platformRate,
    rent,
    riceCost,
    salePrice,
    seasoningCost,
    sideCost,
    utilities,
    yieldRate,
  ]);

  const status =
    calc.monthlyProfit > 0 && calc.margin >= 35
      ? { label: "当前模型较健康", tone: "good" }
      : calc.contribution > 0 && calc.monthlyProfit > -3000
        ? { label: "利润偏紧，需要实测", tone: "warn" }
        : { label: "当前模型危险", tone: "bad" };

  const weightOptions = [80, 100, 120].map((weight) => {
    const safeYield = Math.max(yieldRate, 1) / 100;
    const cost =
      (beefPrice / 500) *
      (weight / safeYield) *
      (1 + operationLoss / 100);
    return {
      weight,
      cost,
      raw: weight / safeYield,
      min: Math.ceil(weight / 22),
      max: Math.ceil(weight / 18),
    };
  });

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">牛腩饭单品测算</p>
        <h1>牛腩饭盈利计算器</h1>
        <p className="hero-copy">
          统一按<strong>熟牛腩净重</strong>计算，先看一份饭真正剩下多少钱。
        </p>
      </header>

      <section className="dashboard" aria-label="核心结果">
        <article className="primary-card">
          <span>预计月利润</span>
          <strong className={calc.monthlyProfit >= 0 ? "positive" : "negative"}>
            {money(calc.monthlyProfit)}
          </strong>
          <div className={`status ${status.tone}`}>{status.label}</div>
          <p>
            按每日 {integer(dailyOrders)} 单、每月营业 {openDays} 天计算
          </p>
        </article>
        <article className="result-card">
          <span>每单实际到手</span>
          <strong>{money(calc.settlement)}</strong>
          <p>售价扣除美团综合扣除比例</p>
        </article>
        <article className="result-card">
          <span>每份变动成本</span>
          <strong>{money(calc.unitCost)}</strong>
          <p>熟牛腩、米饭、配菜、调味及包装</p>
        </article>
        <article className="result-card">
          <span>每单贡献利润</span>
          <strong className={calc.contribution >= 0 ? "positive" : "negative"}>
            {money(calc.contribution)}
          </strong>
          <p>用于支付房租、人工、水电并产生利润</p>
        </article>
        <article className="result-card">
          <span>每日保本单量</span>
          <strong>
            {Number.isFinite(calc.breakEvenDaily)
              ? `${integer(calc.breakEvenDaily)}单`
              : "无法保本"}
          </strong>
          <p>已把两位合伙人的工资计入人工</p>
        </article>
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">第一步</p>
            <h2>售价与美团扣除</h2>
          </div>
          <span>到手金额口径</span>
        </div>
        <div className="two-column">
          <NumberField
            label="顾客实际支付"
            value={salePrice}
            onChange={setSalePrice}
            unit="元"
            step={0.5}
            max={100}
          />
          <RangeField
            label="美团综合扣除比例"
            value={platformRate}
            onChange={setPlatformRate}
            unit="%"
            min={0}
            max={40}
            hint="把平台扣点、商家承担活动、推广等合并成一个比例。拿到真实账单后，按实际比例调整。"
          />
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">第二步</p>
            <h2>熟牛腩成本</h2>
          </div>
          <span>熟肉净重口径</span>
        </div>
        <div className="three-column">
          <NumberField
            label="生牛腩采购价"
            value={beefPrice}
            onChange={setBeefPrice}
            unit="元/斤"
            step={0.5}
            max={100}
          />
          <NumberField
            label="熟制出成率"
            value={yieldRate}
            onChange={setYieldRate}
            unit="%"
            min={30}
            max={100}
            step={1}
            hint="70%表示500克生牛腩约得到350克熟牛腩。"
          />
          <NumberField
            label="操作损耗"
            value={operationLoss}
            onChange={setOperationLoss}
            unit="%"
            max={30}
            step={1}
            hint="覆盖称重手重、锅底剩余和零碎损耗。"
          />
        </div>

        <div className="weight-switcher" aria-label="熟牛腩份量选择">
          {[80, 100, 120].map((weight) => (
            <button
              key={weight}
              className={cookedWeight === weight ? "active" : ""}
              onClick={() => setCookedWeight(weight)}
            >
              {weight}克
            </button>
          ))}
        </div>
        <RangeField
          label="每份熟牛腩净重"
          value={cookedWeight}
          onChange={setCookedWeight}
          unit="克"
          min={60}
          max={150}
          step={5}
          hint="装盒时沥掉明显汤汁后的熟牛腩重量。"
        />

        <div className="meat-summary">
          <div>
            <span>本份牛腩成本</span>
            <strong>{money(calc.beefCost)}</strong>
          </div>
          <div>
            <span>约需生牛腩</span>
            <strong>{integer(calc.rawWeight)}克</strong>
          </div>
          <div>
            <span>约有多少块</span>
            <strong>
              {calc.piecesMin}–{calc.piecesMax}块
            </strong>
          </div>
        </div>

        <div className="portion-grid">
          {weightOptions.map((item) => (
            <article
              key={item.weight}
              className={item.weight === cookedWeight ? "selected" : ""}
            >
              <span>熟牛腩 {item.weight}克</span>
              <strong>{money(item.cost)}</strong>
              <p>
                约 {item.min}–{item.max} 块 · 需生肉约 {integer(item.raw)} 克
              </p>
            </article>
          ))}
        </div>
        <p className="notice">
          块数按熟制后每块约18–22克估算。切块大小、肥瘦和筋肉比例不同，块数会变化；正式营业应以称重为准，块数只帮助顾客直观感受份量。
        </p>
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">第三步</p>
            <h2>每份其他成本</h2>
          </div>
          <span>随采购实价修改</span>
        </div>
        <div className="cost-grid">
          <NumberField
            label="米饭"
            value={riceCost}
            onChange={setRiceCost}
            unit="元"
          />
          <NumberField
            label="萝卜及配菜"
            value={sideCost}
            onChange={setSideCost}
            unit="元"
          />
          <NumberField
            label="酱汁及调味"
            value={seasoningCost}
            onChange={setSeasoningCost}
            unit="元"
          />
          <NumberField
            label="餐盒及包装"
            value={packageCost}
            onChange={setPackageCost}
            unit="元"
          />
          <NumberField
            label="其他单份成本"
            value={otherUnitCost}
            onChange={setOtherUnitCost}
            unit="元"
          />
        </div>
        <div className="inline-result">
          <span>当前食材及包装成本率</span>
          <strong>{calc.foodRate.toFixed(1)}%</strong>
          <small>每份变动成本 ÷ 顾客实付价格</small>
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <p className="eyebrow">第四步</p>
            <h2>销量与每月固定成本</h2>
          </div>
          <span>判断整店能否活下来</span>
        </div>
        <div className="two-column">
          <NumberField
            label="每日订单量"
            value={dailyOrders}
            onChange={setDailyOrders}
            unit="单"
            step={1}
            max={1000}
          />
          <NumberField
            label="每月营业天数"
            value={openDays}
            onChange={setOpenDays}
            unit="天"
            step={1}
            max={31}
          />
        </div>
        <div className="cost-grid fixed">
          <NumberField
            label="房租"
            value={rent}
            onChange={setRent}
            unit="元/月"
            step={100}
          />
          <NumberField
            label="全部人工"
            value={labor}
            onChange={setLabor}
            unit="元/月"
            step={100}
            hint="包括你和合伙人的合理工资。"
          />
          <NumberField
            label="水电燃气"
            value={utilities}
            onChange={setUtilities}
            unit="元/月"
            step={100}
          />
          <NumberField
            label="其他固定支出"
            value={otherFixed}
            onChange={setOtherFixed}
            unit="元/月"
            step={100}
          />
        </div>
      </section>

      <section className="section final-result">
        <div className="section-title">
          <div>
            <p className="eyebrow">经营判断</p>
            <h2>这组参数意味着什么</h2>
          </div>
        </div>
        <div className="ledger">
          <div><span>每单到账</span><strong>{money(calc.settlement)}</strong></div>
          <div><span>牛腩成本</span><strong>{money(calc.beefCost)}</strong></div>
          <div><span>每份总变动成本</span><strong>{money(calc.unitCost)}</strong></div>
          <div><span>每单贡献利润</span><strong>{money(calc.contribution)}</strong></div>
          <div><span>贡献利润率</span><strong>{calc.margin.toFixed(1)}%</strong></div>
          <div><span>每月固定成本</span><strong>{money(calc.fixed)}</strong></div>
          <div><span>每日保本单量</span><strong>{Number.isFinite(calc.breakEvenDaily) ? `${integer(calc.breakEvenDaily)}单` : "无法保本"}</strong></div>
          <div><span>预计月净利率</span><strong>{calc.monthlyMargin.toFixed(1)}%</strong></div>
        </div>
        <p className="notice strong-notice">
          这是经营推演，不是开店结论。牛腩出成率、实际到账和员工平均打肉重量，必须通过实测替换默认值。
        </p>
      </section>

      <footer>
        <p>牛腩饭盈利计算器 · 数据仅保存在当前页面，不会上传</p>
      </footer>
    </main>
  );
}
