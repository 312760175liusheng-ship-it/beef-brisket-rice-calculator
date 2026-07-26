"use client";

import { useEffect, useMemo, useState } from "react";

type CalculatorData = {
  salePrice: number;
  platformRate: number;
  dineInPrice: number;
  dineInShare: number;
  dineInConsumables: number;
  beefPrice: number;
  yieldRate: number;
  cookedWeight: number;
  operationLoss: number;
  riceCost: number;
  sideCost: number;
  seasoningCost: number;
  packageCost: number;
  otherUnitCost: number;
  dailyOrders: number;
  openDays: number;
  rent: number;
  labor: number;
  utilities: number;
  otherFixed: number;
};

type SlotKey = "A" | "B" | "C";
type SavedScenario = {
  savedAt: string;
  data: CalculatorData;
};

const STORAGE_KEY = "beef-brisket-calculator-scenarios-v1";

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
  const [dineInPrice, setDineInPrice] = useState(20);
  const [dineInShare, setDineInShare] = useState(10);
  const [dineInConsumables, setDineInConsumables] = useState(0.3);
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
  const [savedScenarios, setSavedScenarios] = useState<
    Partial<Record<SlotKey, SavedScenario>>
  >({});
  const [exportFeedback, setExportFeedback] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedScenarios(JSON.parse(saved));
      }
    } catch {
      // 浏览器禁用本地存储时，计算功能仍可正常使用。
    }
  }, []);

  const currentData = useMemo<CalculatorData>(
    () => ({
      salePrice,
      platformRate,
      dineInPrice,
      dineInShare,
      dineInConsumables,
      beefPrice,
      yieldRate,
      cookedWeight,
      operationLoss,
      riceCost,
      sideCost,
      seasoningCost,
      packageCost,
      otherUnitCost,
      dailyOrders,
      openDays,
      rent,
      labor,
      utilities,
      otherFixed,
    }),
    [
      salePrice,
      platformRate,
      dineInPrice,
      dineInShare,
      dineInConsumables,
      beefPrice,
      yieldRate,
      cookedWeight,
      operationLoss,
      riceCost,
      sideCost,
      seasoningCost,
      packageCost,
      otherUnitCost,
      dailyOrders,
      openDays,
      rent,
      labor,
      utilities,
      otherFixed,
    ],
  );

  const calc = useMemo(() => {
    const safeYield = Math.max(yieldRate, 1) / 100;
    const beefBase = (beefPrice / 500) * (cookedWeight / safeYield);
    const beefCost = beefBase * (1 + operationLoss / 100);
    const otherFood =
      riceCost + sideCost + seasoningCost + packageCost + otherUnitCost;
    const unitCost = beefCost + otherFood;
    const settlement = salePrice * (1 - platformRate / 100);
    const contribution = settlement - unitCost;
    const dineInOtherFood =
      riceCost +
      sideCost +
      seasoningCost +
      dineInConsumables +
      otherUnitCost;
    const dineInUnitCost = beefCost + dineInOtherFood;
    const dineInContribution = dineInPrice - dineInUnitCost;
    const fixed = rent + labor + utilities + otherFixed;
    const safeDineInShare = Math.min(Math.max(dineInShare, 0), 100) / 100;
    const dineInDailyOrders = dailyOrders * safeDineInShare;
    const deliveryDailyOrders = dailyOrders - dineInDailyOrders;
    const monthlyOrders = dailyOrders * openDays;
    const monthlyDineInOrders = dineInDailyOrders * openDays;
    const monthlyDeliveryOrders = deliveryDailyOrders * openDays;
    const monthlyRevenue =
      salePrice * monthlyDeliveryOrders + dineInPrice * monthlyDineInOrders;
    const monthlySettlement =
      settlement * monthlyDeliveryOrders + dineInPrice * monthlyDineInOrders;
    const monthlyPlatformCost = monthlyRevenue - monthlySettlement;
    const monthlyBeefCost = beefCost * monthlyOrders;
    const monthlyOtherUnitCost =
      otherFood * monthlyDeliveryOrders +
      dineInOtherFood * monthlyDineInOrders;
    const monthlyVariableCost =
      unitCost * monthlyDeliveryOrders +
      dineInUnitCost * monthlyDineInOrders;
    const grossProfit = monthlyRevenue - monthlyVariableCost;
    const grossMargin =
      monthlyRevenue > 0 ? (grossProfit / monthlyRevenue) * 100 : 0;
    const monthlyContribution =
      contribution * monthlyDeliveryOrders +
      dineInContribution * monthlyDineInOrders;
    const weightedContribution =
      monthlyOrders > 0 ? monthlyContribution / monthlyOrders : 0;
    const monthlyProfit = monthlyContribution - fixed;
    const breakEvenDaily =
      weightedContribution > 0 && openDays > 0
        ? Math.ceil(fixed / weightedContribution / openDays)
        : Infinity;
    const margin =
      settlement > 0 ? (contribution / settlement) * 100 : 0;
    const monthlyMargin =
      monthlyRevenue > 0 ? (monthlyProfit / monthlyRevenue) * 100 : 0;
    const foodRate = salePrice > 0 ? (unitCost / salePrice) * 100 : 0;
    const rawWeight = cookedWeight / safeYield;
    const piecesMin = Math.ceil(cookedWeight / 22);
    const piecesMax = Math.ceil(cookedWeight / 18);

    return {
      beefBase,
      beefCost,
      otherFood,
      unitCost,
      settlement,
      contribution,
      dineInOtherFood,
      dineInUnitCost,
      dineInContribution,
      dineInDailyOrders,
      deliveryDailyOrders,
      monthlyDineInOrders,
      monthlyDeliveryOrders,
      weightedContribution,
      fixed,
      monthlyOrders,
      monthlyRevenue,
      monthlySettlement,
      monthlyPlatformCost,
      monthlyBeefCost,
      monthlyOtherUnitCost,
      monthlyVariableCost,
      grossProfit,
      grossMargin,
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
    dineInConsumables,
    dineInPrice,
    dineInShare,
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
    calc.monthlyProfit > 0 && calc.monthlyMargin >= 8
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

  const applyData = (data: CalculatorData) => {
    setSalePrice(data.salePrice);
    setPlatformRate(data.platformRate);
    setDineInPrice(data.dineInPrice ?? 20);
    setDineInShare(data.dineInShare ?? 10);
    setDineInConsumables(data.dineInConsumables ?? 0.3);
    setBeefPrice(data.beefPrice);
    setYieldRate(data.yieldRate);
    setCookedWeight(data.cookedWeight);
    setOperationLoss(data.operationLoss);
    setRiceCost(data.riceCost);
    setSideCost(data.sideCost);
    setSeasoningCost(data.seasoningCost);
    setPackageCost(data.packageCost);
    setOtherUnitCost(data.otherUnitCost);
    setDailyOrders(data.dailyOrders);
    setOpenDays(data.openDays);
    setRent(data.rent);
    setLabor(data.labor);
    setUtilities(data.utilities);
    setOtherFixed(data.otherFixed);
  };

  const persistScenarios = (
    next: Partial<Record<SlotKey, SavedScenario>>,
  ) => {
    setSavedScenarios(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // 浏览器禁用本地存储时不阻断当前计算。
    }
  };

  const saveScenario = (slot: SlotKey) => {
    if (
      savedScenarios[slot] &&
      !window.confirm(`存档 ${slot} 已有数据，确定覆盖吗？`)
    ) {
      return;
    }
    persistScenarios({
      ...savedScenarios,
      [slot]: { savedAt: new Date().toISOString(), data: currentData },
    });
  };

  const deleteScenario = (slot: SlotKey) => {
    if (!savedScenarios[slot]) return;
    const next = { ...savedScenarios };
    delete next[slot];
    persistScenarios(next);
  };

  const reportText = `牛腩饭盈利测算
生成时间：${new Date().toLocaleString("zh-CN")}

【核心参数】
外卖顾客实付：${money(salePrice)}
美团综合扣除：${platformRate}%
商家每单到账：${money(calc.settlement)}
外卖平台后毛利率：${calc.margin.toFixed(1)}%
堂食价格：${money(dineInPrice)}
堂食每份变动成本：${money(calc.dineInUnitCost)}
堂食毛利率：${(dineInPrice > 0 ? calc.dineInContribution / dineInPrice * 100 : 0).toFixed(1)}%
生牛腩采购价：${beefPrice}元/斤
熟制出成率：${yieldRate}%
熟牛腩净重：${cookedWeight}克
操作损耗：${operationLoss}%
牛腩成本：${money(calc.beefCost)}
每份总变动成本：${money(calc.unitCost)}
每单贡献利润：${money(calc.contribution)}

【门店参数】
每日总订单：${dailyOrders}单
堂食占比：${dineInShare}%（约${calc.dineInDailyOrders.toFixed(1)}单/天）
外卖占比：${(100 - dineInShare).toFixed(0)}%（约${calc.deliveryDailyOrders.toFixed(1)}单/天）
每月营业：${openDays}天
月总营业额：${money(calc.monthlyRevenue)}
产品毛利率：${calc.grossMargin.toFixed(1)}%
平台费用：${money(calc.monthlyPlatformCost)}（占营业额${(calc.monthlyRevenue > 0 ? calc.monthlyPlatformCost / calc.monthlyRevenue * 100 : 0).toFixed(1)}%）
牛腩成本：${money(calc.monthlyBeefCost)}（占营业额${(calc.monthlyRevenue > 0 ? calc.monthlyBeefCost / calc.monthlyRevenue * 100 : 0).toFixed(1)}%）
其他单份成本：${money(calc.monthlyOtherUnitCost)}（占营业额${(calc.monthlyRevenue > 0 ? calc.monthlyOtherUnitCost / calc.monthlyRevenue * 100 : 0).toFixed(1)}%）
每月固定成本：${money(calc.fixed)}
每日保本单量：${Number.isFinite(calc.breakEvenDaily) ? `${integer(calc.breakEvenDaily)}单` : "无法保本"}
预计月利润：${money(calc.monthlyProfit)}
预计月净利率：${calc.monthlyMargin.toFixed(1)}%

【完整公式】
混合月利润 =（外卖每单贡献 × 外卖单量＋堂食每单贡献 × 堂食单量）× 营业天数－月固定成本
外卖每单贡献 = 外卖售价 × (1−平台扣除率) − 外卖每份变动成本
堂食每单贡献 = 堂食售价 − 堂食每份变动成本
牛腩成本 = (采购价 ÷ 500) × (熟牛腩克重 ÷ 出成率) × (1＋操作损耗率)

说明：熟牛腩均指沥掉明显汤汁后的熟肉净重。`;

  const copyTextReport = async () => {
    setExportFeedback("");
    try {
      await navigator.clipboard.writeText(reportText);
      setExportFeedback("文字报告已复制，可直接粘贴给AI");
    } catch {
      setExportFeedback("复制失败，请稍后重试");
    }
  };

  const exportImageReport = async () => {
    setExportFeedback("正在生成经营测算图片…");

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setExportFeedback("图片生成失败，请稍后重试");
      return;
    }

    const colors = {
      bg: "#F3EEE6",
      card: "#FFFFFF",
      ink: "#181713",
      muted: "#746F66",
      line: "#DED8CE",
      brand: "#9A332C",
      green: "#297A68",
      amber: "#B6781E",
      dark: "#25221E",
    };

    const roundRect = (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
      fill: string,
    ) => {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      ctx.fillStyle = fill;
      ctx.fill();
    };

    const text = (
      value: string,
      x: number,
      y: number,
      size: number,
      color = colors.ink,
      weight = 500,
      align: CanvasTextAlign = "left",
    ) => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif`;
      ctx.textAlign = align;
      ctx.textBaseline = "alphabetic";
      ctx.fillText(value, x, y);
    };

    const profitAtOrders = (orders: number) =>
      calc.weightedContribution * orders * openDays - calc.fixed;

    const safeBreakEven = Number.isFinite(calc.breakEvenDaily)
      ? calc.breakEvenDaily
      : 0;
    const targetOrders = Math.max(dailyOrders + 20, safeBreakEven + 20);
    const beefRate =
      calc.monthlyRevenue > 0
        ? (calc.monthlyBeefCost / calc.monthlyRevenue) * 100
        : 0;
    const otherRate =
      calc.monthlyRevenue > 0
        ? (calc.monthlyOtherUnitCost / calc.monthlyRevenue) * 100
        : 0;
    const fixedRate =
      calc.monthlyRevenue > 0 ? (calc.fixed / calc.monthlyRevenue) * 100 : 0;

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    text("牛腩饭盈利测算", 72, 104, 30, colors.brand, 800);
    text("这套模型怎么保本、怎么赚钱", 72, 174, 54, colors.ink, 900);
    text(
      `熟牛腩${cookedWeight}克 · 外卖${salePrice}元 · 堂食${dineInPrice}元 · 堂食占${dineInShare}%`,
      72,
      222,
      24,
      colors.muted,
      500,
    );

    roundRect(72, 270, 936, 300, 30, colors.dark);
    text("预计每月净利润", 112, 332, 25, "#D9CDBD", 600);
    text(
      money(calc.monthlyProfit),
      112,
      440,
      76,
      calc.monthlyProfit >= 0 ? "#74C4AE" : "#ED8A7E",
      900,
    );
    text(
      `月营业额 ${money(calc.monthlyRevenue)}  ·  净利率 ${calc.monthlyMargin.toFixed(1)}%`,
      112,
      502,
      27,
      "#FFFFFF",
      650,
    );
    text(
      `每天比保本线多 ${integer(Math.max(dailyOrders - safeBreakEven, 0))} 单`,
      820,
      332,
      22,
      "#D9CDBD",
      600,
      "right",
    );

    const metrics = [
      ["每天保本", `${integer(safeBreakEven)}单`],
      ["混合每单平均贡献", money(calc.weightedContribution)],
      ["外卖平台后毛利率", `${calc.margin.toFixed(1)}%`],
    ];
    metrics.forEach((item, index) => {
      const x = 72 + index * 316;
      roundRect(x, 610, 296, 164, 22, colors.card);
      text(item[0], x + 26, 660, 21, colors.muted, 600);
      text(item[1], x + 26, 732, 39, colors.ink, 850);
    });

    text("做到多少单，能赚多少钱", 72, 850, 36, colors.ink, 850);
    const orderScenarios = [
      {
        label: "保本线",
        orders: safeBreakEven,
        profit: profitAtOrders(safeBreakEven),
      },
      {
        label: "当前目标",
        orders: dailyOrders,
        profit: calc.monthlyProfit,
      },
      {
        label: "增长目标",
        orders: targetOrders,
        profit: profitAtOrders(targetOrders),
      },
    ];
    orderScenarios.forEach((scenario, index) => {
      const y = 890 + index * 106;
      roundRect(
        72,
        y,
        936,
        86,
        18,
        index === 1 ? "#FFF7F4" : colors.card,
      );
      text(scenario.label, 102, y + 54, 22, colors.brand, 750);
      text(
        `${integer(scenario.orders)}单/天`,
        340,
        y + 54,
        27,
        colors.ink,
        800,
      );
      text(
        scenario.profit > 0
          ? `月赚约 ${money(scenario.profit)}`
          : scenario.profit < -1
            ? `月亏约 ${money(Math.abs(scenario.profit))}`
            : "基本保本",
        970,
        y + 54,
        27,
        scenario.profit >= 0 ? colors.green : colors.brand,
        850,
        "right",
      );
    });

    text("两种渠道每份能留下多少", 72, 1255, 36, colors.ink, 850);
    const unitRows = [
      ["外卖：顾客实付", money(salePrice), `到账${money(calc.settlement)}`],
      ["外卖：平台后贡献", money(calc.contribution), `到账口径${calc.margin.toFixed(1)}%`],
      ["堂食：顾客实付", money(dineInPrice), "无平台扣除"],
      ["堂食：每份贡献", money(calc.dineInContribution), `毛利率${(dineInPrice > 0 ? calc.dineInContribution / dineInPrice * 100 : 0).toFixed(1)}%`],
    ];
    roundRect(72, 1290, 936, 310, 24, colors.card);
    unitRows.forEach((row, index) => {
      const y = 1350 + index * 66;
      text(row[0], 106, y, 22, colors.muted, 600);
      text(
        row[1],
        800,
        y,
        25,
        index === 3 ? colors.green : colors.ink,
        800,
        "right",
      );
      text(row[2], 970, y, 21, colors.muted, 650, "right");
      if (index < unitRows.length - 1) {
        ctx.strokeStyle = colors.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(106, y + 23);
        ctx.lineTo(970, y + 23);
        ctx.stroke();
      }
    });

    text("这套利润成立的关键条件", 72, 1668, 32, colors.ink, 850);
    const conditions = [
      `美团综合扣除不超过 ${platformRate}%`,
      `熟制出成率达到 ${yieldRate}%，每份熟牛腩 ${cookedWeight} 克`,
      `每天达到 ${dailyOrders} 单，其中堂食约 ${calc.dineInDailyOrders.toFixed(0)} 单`,
      `每月固定成本控制在 ${money(calc.fixed)}`,
    ];
    conditions.forEach((condition, index) => {
      const y = 1720 + index * 43;
      ctx.fillStyle = index === 0 ? colors.amber : colors.brand;
      ctx.beginPath();
      ctx.arc(82, y - 7, 5, 0, Math.PI * 2);
      ctx.fill();
      text(condition, 104, y, 21, colors.muted, 550);
    });

    text(
      `成本占营业额：平台${(calc.monthlyRevenue > 0 ? calc.monthlyPlatformCost / calc.monthlyRevenue * 100 : 0).toFixed(1)}% · 牛腩${beefRate.toFixed(1)}% · 其他单份${otherRate.toFixed(1)}% · 固定成本${fixedRate.toFixed(1)}%`,
      72,
      1882,
      18,
      colors.muted,
      500,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png", 1),
    );
    if (!blob) {
      setExportFeedback("图片生成失败，请稍后重试");
      return;
    }

    const file = new File([blob], "牛腩饭盈利测算.png", {
      type: "image/png",
    });

    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "牛腩饭盈利测算",
          text: "这套牛腩饭模型怎么保本、怎么赚钱",
          files: [file],
        });
        setExportFeedback("已打开图片分享");
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setExportFeedback("");
        return;
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "牛腩饭盈利测算.png";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportFeedback("测算图片已下载，可直接发送");
  };

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">牛腩饭单品测算</p>
        <h1>牛腩饭盈利计算器</h1>
        <p className="hero-copy">
          统一按<strong>熟牛腩净重</strong>计算，先看一份饭真正剩下多少钱。
        </p>
      </header>

      <section className="toolbar" aria-label="数据操作">
        <div>
          <strong>数据操作</strong>
          <span>分享当前结果，或保存三组方案反复比较</span>
        </div>
        <div className="toolbar-actions">
          <button className="export-button" onClick={exportImageReport}>
            导出经营测算图片
          </button>
          <button className="copy-button" onClick={copyTextReport}>
            复制文字给AI
          </button>
        </div>
        {exportFeedback && (
          <span className="export-feedback" role="status">
            {exportFeedback}
          </span>
        )}
      </section>

      <section className="dashboard" aria-label="核心结果">
        <article className="primary-card">
          <span>预计月利润</span>
          <strong className={calc.monthlyProfit >= 0 ? "positive" : "negative"}>
            {money(calc.monthlyProfit)}
          </strong>
          <div className={`status ${status.tone}`}>{status.label}</div>
          <p>
            按每日 {integer(dailyOrders)} 单，其中堂食约{" "}
            {integer(calc.dineInDailyOrders)} 单
          </p>
        </article>
        <article className="result-card">
          <span>外卖每单实际到手</span>
          <strong>{money(calc.settlement)}</strong>
          <p>售价扣除美团综合扣除比例</p>
        </article>
        <article className="result-card">
          <span>外卖每份变动成本</span>
          <strong>{money(calc.unitCost)}</strong>
          <p>熟牛腩、米饭、配菜、调味及包装</p>
        </article>
        <article className="result-card">
          <span>外卖每单贡献利润</span>
          <strong className={calc.contribution >= 0 ? "positive" : "negative"}>
            {money(calc.contribution)}
          </strong>
          <p>用于支付房租、人工、水电并产生利润</p>
        </article>
        <article className="result-card">
          <span>堂食每单贡献利润</span>
          <strong className={calc.dineInContribution >= 0 ? "positive" : "negative"}>
            {money(calc.dineInContribution)}
          </strong>
          <p>堂食售价扣除堂食单份变动成本</p>
        </article>
        <article className="result-card">
          <span>月总营业额</span>
          <strong>{money(calc.monthlyRevenue)}</strong>
          <p>顾客实付金额，不扣平台费用</p>
        </article>
        <article className="result-card">
          <span>堂食毛利率</span>
          <strong>
            {(dineInPrice > 0
              ? (calc.dineInContribution / dineInPrice) * 100
              : 0
            ).toFixed(1)}
            %
          </strong>
          <p>堂食售价扣除食材及堂食耗材</p>
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

      <section className="section overview-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">数据总览</p>
            <h2>月度收入与费用占比</h2>
          </div>
          <span>全部比例统一按总营业额计算</span>
        </div>
        <div className="overview-grid">
          <article>
            <span>月总营业额</span>
            <strong>{money(calc.monthlyRevenue)}</strong>
            <p>
              外卖{integer(calc.monthlyDeliveryOrders)}单＋堂食
              {integer(calc.monthlyDineInOrders)}单
            </p>
          </article>
          <article>
            <span>平台扣除后到账</span>
            <strong>{money(calc.monthlySettlement)}</strong>
            <p>占营业额 {(calc.monthlyRevenue > 0 ? calc.monthlySettlement / calc.monthlyRevenue * 100 : 0).toFixed(1)}%</p>
          </article>
          <article>
            <span>产品毛利润</span>
            <strong>{money(calc.grossProfit)}</strong>
            <p>毛利率 {calc.grossMargin.toFixed(1)}%</p>
          </article>
          <article>
            <span>预计月净利润</span>
            <strong className={calc.monthlyProfit >= 0 ? "positive" : "negative"}>
              {money(calc.monthlyProfit)}
            </strong>
            <p>净利率 {calc.monthlyMargin.toFixed(1)}%</p>
          </article>
        </div>

        <div className="cost-share-list">
          {[
            {
              label: "美团及活动综合扣除",
              amount: calc.monthlyPlatformCost,
              rate:
                calc.monthlyRevenue > 0
                  ? (calc.monthlyPlatformCost / calc.monthlyRevenue) * 100
                  : 0,
              tone: "platform",
            },
            {
              label: "熟牛腩成本",
              amount: calc.monthlyBeefCost,
              rate:
                calc.monthlyRevenue > 0
                  ? (calc.monthlyBeefCost / calc.monthlyRevenue) * 100
                  : 0,
              tone: "beef",
            },
            {
              label: "米饭、配菜、调味及包装",
              amount: calc.monthlyOtherUnitCost,
              rate:
                calc.monthlyRevenue > 0
                  ? (calc.monthlyOtherUnitCost / calc.monthlyRevenue) * 100
                  : 0,
              tone: "other",
            },
            {
              label: "房租、人工、水电等固定成本",
              amount: calc.fixed,
              rate:
                calc.monthlyRevenue > 0
                  ? (calc.fixed / calc.monthlyRevenue) * 100
                  : 0,
              tone: "fixed",
            },
            {
              label: "最终净利润",
              amount: calc.monthlyProfit,
              rate:
                calc.monthlyRevenue > 0
                  ? (calc.monthlyProfit / calc.monthlyRevenue) * 100
                  : 0,
              tone: calc.monthlyProfit >= 0 ? "profit" : "loss",
            },
          ].map((item) => (
            <article key={item.label}>
              <div className="cost-share-head">
                <span>{item.label}</span>
                <strong>
                  {money(item.amount)} · {item.rate.toFixed(1)}%
                </strong>
              </div>
              <div className="share-track" aria-hidden="true">
                <span
                  className={item.tone}
                  style={{
                    width: `${Math.min(Math.max(Math.abs(item.rate), 0), 100)}%`,
                  }}
                />
              </div>
            </article>
          ))}
        </div>
        <p className="notice">
          产品毛利率只扣食材和包装，适合判断产品本身；最终净利率还扣除了平台费用、房租、人工、水电等支出，适合判断整店经营结果。
        </p>
      </section>

      <section className="section scenario-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">方案存档</p>
            <h2>A / B / C 三组参数</h2>
          </div>
          <span>只保存在当前浏览器</span>
        </div>
        <div className="scenario-grid">
          {(["A", "B", "C"] as SlotKey[]).map((slot) => {
            const saved = savedScenarios[slot];
            return (
              <article key={slot} className={saved ? "has-data" : ""}>
                <div className="scenario-name">方案 {slot}</div>
                {saved ? (
                  <>
                    <strong>
                      外卖{saved.data.salePrice}元 · 堂食
                      {saved.data.dineInPrice ?? 20}元
                    </strong>
                    <p>
                      保存于
                      {new Date(saved.savedAt).toLocaleString("zh-CN", {
                        month: "numeric",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div className="scenario-actions">
                      <button onClick={() => applyData(saved.data)}>载入</button>
                      <button onClick={() => saveScenario(slot)}>覆盖</button>
                      <button
                        className="text-button"
                        onClick={() => deleteScenario(slot)}
                      >
                        删除
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <strong>尚未保存</strong>
                    <p>保存当前页面的全部参数。</p>
                    <button
                      className="save-button"
                      onClick={() => saveScenario(slot)}
                    >
                      保存当前方案
                    </button>
                  </>
                )}
              </article>
            );
          })}
        </div>
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
            label="外卖顾客实际支付"
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
        <div className="channel-controls">
          <NumberField
            label="堂食售价"
            value={dineInPrice}
            onChange={setDineInPrice}
            unit="元"
            step={0.5}
            max={100}
            hint="默认20元，可根据实际菜单价格调整。"
          />
          <RangeField
            label="堂食订单占比"
            value={dineInShare}
            onChange={setDineInShare}
            unit="%"
            min={0}
            max={60}
            step={5}
            hint={`按当前每日${dailyOrders}单计算：堂食约${calc.dineInDailyOrders.toFixed(0)}单，外卖约${calc.deliveryDailyOrders.toFixed(0)}单。`}
          />
          <NumberField
            label="堂食餐具及清洁耗材"
            value={dineInConsumables}
            onChange={setDineInConsumables}
            unit="元/份"
            step={0.1}
            max={10}
            hint="堂食不计外卖餐盒，另计纸巾、餐具清洗等耗材。"
          />
        </div>
        <div className="channel-summary">
          <div>
            <span>堂食约</span>
            <strong>{calc.dineInDailyOrders.toFixed(0)}单/天</strong>
          </div>
          <div>
            <span>外卖约</span>
            <strong>{calc.deliveryDailyOrders.toFixed(0)}单/天</strong>
          </div>
          <div>
            <span>混合每单平均贡献</span>
            <strong>{money(calc.weightedContribution)}</strong>
          </div>
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
            label="每日总订单量"
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
          <div><span>外卖每单到账</span><strong>{money(calc.settlement)}</strong></div>
          <div><span>牛腩成本</span><strong>{money(calc.beefCost)}</strong></div>
          <div><span>外卖每份变动成本</span><strong>{money(calc.unitCost)}</strong></div>
          <div><span>堂食每份变动成本</span><strong>{money(calc.dineInUnitCost)}</strong></div>
          <div><span>月总营业额</span><strong>{money(calc.monthlyRevenue)}</strong></div>
          <div><span>产品毛利率</span><strong>{calc.grossMargin.toFixed(1)}%</strong></div>
          <div><span>外卖每单贡献</span><strong>{money(calc.contribution)}</strong></div>
          <div><span>外卖平台后毛利率</span><strong>{calc.margin.toFixed(1)}%</strong></div>
          <div><span>堂食每单贡献</span><strong>{money(calc.dineInContribution)}</strong></div>
          <div><span>堂食毛利率</span><strong>{(dineInPrice > 0 ? calc.dineInContribution / dineInPrice * 100 : 0).toFixed(1)}%</strong></div>
          <div><span>堂食/外卖日单量</span><strong>{calc.dineInDailyOrders.toFixed(0)} / {calc.deliveryDailyOrders.toFixed(0)}单</strong></div>
          <div><span>每月固定成本</span><strong>{money(calc.fixed)}</strong></div>
          <div><span>每日保本单量</span><strong>{Number.isFinite(calc.breakEvenDaily) ? `${integer(calc.breakEvenDaily)}单` : "无法保本"}</strong></div>
          <div><span>预计月净利率</span><strong>{calc.monthlyMargin.toFixed(1)}%</strong></div>
        </div>
        <p className="notice strong-notice">
          这是经营推演，不是开店结论。牛腩出成率、实际到账和员工平均打肉重量，必须通过实测替换默认值。
        </p>
      </section>

      <section className="section formula-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">计算口径</p>
            <h2>总体计算公式</h2>
          </div>
          <span>所有结果都由这组公式得出</span>
        </div>
        <div className="main-formula">
          <span>混合渠道月利润</span>
          <strong>
            ＝（外卖每单贡献 × 外卖日单量＋堂食每单贡献 ×
            堂食日单量）× 营业天数－月固定成本
          </strong>
        </div>
        <div className="formula-grid">
          <article>
            <span>外卖每单实际到手</span>
            <strong>售价 ×（1－平台扣除率）</strong>
            <p>
              {money(salePrice)} ×（1－{platformRate}%）＝
              {money(calc.settlement)}
            </p>
          </article>
          <article>
            <span>熟牛腩成本</span>
            <strong>
              （采购价 ÷ 500）×（熟肉克重 ÷ 出成率）×（1＋损耗率）
            </strong>
            <p>
              当前计算结果：{money(calc.beefCost)}
            </p>
          </article>
          <article>
            <span>外卖每单贡献利润</span>
            <strong>每单实际到手－每份总变动成本</strong>
            <p>
              {money(calc.settlement)}－{money(calc.unitCost)}＝
              {money(calc.contribution)}
            </p>
          </article>
          <article>
            <span>堂食每单贡献利润</span>
            <strong>堂食售价－堂食每份变动成本</strong>
            <p>
              {money(dineInPrice)}－{money(calc.dineInUnitCost)}＝
              {money(calc.dineInContribution)}
            </p>
          </article>
          <article>
            <span>每日保本单量</span>
            <strong>月固定成本 ÷ 混合每单平均贡献 ÷ 营业天数</strong>
            <p>
              当前需要：
              {Number.isFinite(calc.breakEvenDaily)
                ? `${integer(calc.breakEvenDaily)}单/天`
                : "无法保本"}
            </p>
          </article>
        </div>
        <p className="notice">
          外卖计入餐盒包装；堂食不计外卖餐盒，改计堂食餐具及清洁耗材。“月固定成本”包括房租、全部人工、水电燃气和其他固定支出。
        </p>
      </section>

      <footer>
        <p>牛腩饭盈利计算器 · 数据仅保存在当前页面，不会上传</p>
      </footer>
    </main>
  );
}
