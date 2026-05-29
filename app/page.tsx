"use client";
import { useEffect, useMemo, useState } from "react";

type Product = { id: string; name: string; price: string; image: string; category: string; sku: string; createdAt: string };
type Row = { productId: string; qty: string; note: string };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("保温杯");
  const [sku, setSku] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("vtop-products");
    if (saved) setProducts(JSON.parse(saved));
  }, []);
  useEffect(() => localStorage.setItem("vtop-products", JSON.stringify(products)), [products]);

  const summary = useMemo(() => {
    const valid = rows
      .filter((r) => r.productId && Number(r.qty) > 0)
      .map((r) => {
        const p = products.find((x) => x.id === r.productId);
        const qty = Number(r.qty);
        const unit = Number(p?.price || 0);
        return { ...r, p, qty, unit, amount: qty * unit };
      })
      .filter((r) => r.p);
    return {
      valid,
      totalQty: valid.reduce((s, r) => s + r.qty, 0),
      totalAmount: valid.reduce((s, r) => s + r.amount, 0),
    };
  }, [rows, products]);

  const addProduct = () => {
    if (!name || !price) return;
    setProducts([{ id: Date.now().toString(), name, price, image, category, sku, createdAt: new Date().toLocaleString() }, ...products]);
    setName(""); setPrice(""); setImage(""); setSku("");
  };

  const onFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(f);
  };

  const exportCsv = () => {
    const headers = ["产品名称","分类","SKU","数量","单价","小计","备注"];
    const lines = summary.valid.map((r) => [r.p?.name || "", r.p?.category || "", r.p?.sku || "", r.qty, r.unit, r.amount, r.note]);
    lines.push(["合计","","",summary.totalQty,"",summary.totalAmount,""]);
    const csv = [headers, ...lines].map((l) => l.map((x) => `"${String(x).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `下单表-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1>产品下单系统</h1>
      <h2>1) 添加产品</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        <input placeholder="产品名称" value={name} onChange={(e)=>setName(e.target.value)} />
        <input placeholder="价格" value={price} onChange={(e)=>setPrice(e.target.value)} />
        <input placeholder="SKU" value={sku} onChange={(e)=>setSku(e.target.value)} />
        <select value={category} onChange={(e)=>setCategory(e.target.value)}><option>保温杯</option><option>儿童水杯</option><option>咖啡杯</option><option>配件</option></select>
        <input type="file" accept="image/*" onChange={(e)=>onFile(e.target.files?.[0])} />
        <button onClick={addProduct}>保存产品</button>
      </div>

      <h2>2) 下单表（可按图片选产品并填数量）</h2>
      <button onClick={()=>setRows((v)=>[...v,{productId:"",qty:"",note:""}])}>+ 添加一行</button>
      {rows.map((r, i) => {
        const selected = products.find((p) => p.id === r.productId);
        return <div key={i} style={{ display:"grid", gridTemplateColumns:"160px 1fr 120px 1fr 80px", gap:8, alignItems:"center", marginTop:8 }}>
          <div style={{ width: 150, height: 110, background: "#f1f5f9", display:"grid", placeItems:"center" }}>{selected?.image ? <img src={selected.image} alt={selected.name} style={{maxWidth:"100%",maxHeight:"100%"}} /> : "无图"}</div>
          <select value={r.productId} onChange={(e)=>setRows(rows.map((x,idx)=>idx===i?{...x,productId:e.target.value}:x))}>
            <option value="">选择产品</option>
            {products.map((p)=><option key={p.id} value={p.id}>{p.name}（¥{p.price}）</option>)}
          </select>
          <input placeholder="数量" value={r.qty} onChange={(e)=>setRows(rows.map((x,idx)=>idx===i?{...x,qty:e.target.value}:x))} />
          <input placeholder="备注" value={r.note} onChange={(e)=>setRows(rows.map((x,idx)=>idx===i?{...x,note:e.target.value}:x))} />
          <button onClick={()=>setRows(rows.filter((_,idx)=>idx!==i))}>删除</button>
        </div>;
      })}

      <p>总数量：{summary.totalQty}，总金额：¥{summary.totalAmount.toFixed(2)}</p>
      <button onClick={exportCsv}>导出下单表 CSV</button>
    </main>
  );
}
