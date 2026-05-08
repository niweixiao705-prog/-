"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  price: string;
  category: string;
  stock: string;
  capacity: string;
  sku: string;
  sellingPoint: string;
  description: string;
  image: string;
  createdAt: string;
};

const emptyProduct = {
  name: "",
  price: "",
  category: "保温杯",
  stock: "",
  capacity: "",
  sku: "",
  sellingPoint: "",
  description: "",
  image: "",
};

export default function Home() {
  const [page, setPage] = useState<"show" | "admin">("show");
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyProduct);
  const [keyword, setKeyword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("vtop-products");
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("vtop-products", JSON.stringify(products));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return products;
    return products.filter((p) =>
      [p.name, p.category, p.sku, p.sellingPoint, p.description]
        .join(" ")
        .toLowerCase()
        .includes(k)
    );
  }, [products, keyword]);

  function updateForm(key: keyof typeof emptyProduct, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImage(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateForm("image", String(reader.result));
    };
    reader.readAsDataURL(file);
  }

  function submitProduct(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("请填写产品名称");
      return;
    }

    if (!form.price.trim()) {
      alert("请填写产品价格");
      return;
    }

    if (editingId) {
      setProducts((list) =>
        list.map((p) =>
          p.id === editingId
            ? {
                ...p,
                ...form,
              }
            : p
        )
      );
      setEditingId(null);
    } else {
      setProducts((list) => [
        {
          id: Date.now().toString(),
          ...form,
          createdAt: new Date().toLocaleString(),
        },
        ...list,
      ]);
    }

    setForm(emptyProduct);
  }

  function editProduct(product: Product) {
    setPage("admin");
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      capacity: product.capacity,
      sku: product.sku,
      sellingPoint: product.sellingPoint,
      description: product.description,
      image: product.image,
    });
  }

  function deleteProduct(id: string) {
    if (!confirm("确定删除这个产品吗？")) return;
    setProducts((list) => list.filter((p) => p.id !== id));
  }

  return (
    <main>
      <header className="topbar">
        <div className="brand">
          <div className="logo">V</div>
          <strong>VTOP 产品系统</strong>
        </div>

        <nav>
          <button
            className={page === "show" ? "active" : ""}
            onClick={() => setPage("show")}
          >
            前台展示
          </button>
          <button
            className={page === "admin" ? "active" : ""}
            onClick={() => setPage("admin")}
          >
            后台上传
          </button>
        </nav>
      </header>

      {page === "show" && (
        <section>
          <div className="hero">
            <div>
              <span className="tag">产品展示页面</span>
              <h1>VTOP 产品展示馆</h1>
              <p>
                后台上传产品后，这里会自动显示。适合保温杯、儿童水杯、咖啡杯、配件和包装展示。
              </p>
            </div>
            <div className="stat">
              <span>当前产品数量</span>
              <b>{products.length}</b>
            </div>
          </div>

          <div className="toolbar">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索产品名称、分类、SKU、卖点"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty">
              <h2>还没有产品</h2>
              <p>点击“后台上传”，先录入第一个产品。</p>
              <button onClick={() => setPage("admin")}>去上传产品</button>
            </div>
          ) : (
            <div className="grid">
              {filteredProducts.map((p) => (
                <article className="card" key={p.id}>
                  <div className="imageBox">
                    {p.image ? <img src={p.image} alt={p.name} /> : <span>暂无图片</span>}
                  </div>
                  <div className="cardBody">
                    <h3>{p.name}</h3>
                    <div className="chips">
                      <span>{p.category}</span>
                      {p.capacity && <span>{p.capacity}</span>}
                      {p.sku && <span>{p.sku}</span>}
                    </div>
                    <p className="selling">{p.sellingPoint || "暂无卖点"}</p>
                    <div className="priceRow">
                      <strong>¥{p.price}</strong>
                      <button onClick={() => editProduct(p)}>编辑</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {page === "admin" && (
        <section className="admin">
          <div className="formPanel">
            <h2>{editingId ? "编辑产品" : "上传新产品"}</h2>

            <form onSubmit={submitProduct}>
              <label>产品图片</label>
              <div className="upload">
                {form.image ? <img src={form.image} alt="预览图" /> : <span>点击上传图片</span>}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImage(e.target.files?.[0])}
                />
              </div>

              <div className="two">
                <div>
                  <label>产品名称 *</label>
                  <input
                    value={form.name}
                    onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="例：VTOP 陶瓷内胆吸管杯"
                  />
                </div>

                <div>
                  <label>销售价格 *</label>
                  <input
                    value={form.price}
                    onChange={(e) => updateForm("price", e.target.value)}
                    placeholder="例：39.9"
                  />
                </div>
              </div>

              <div className="two">
                <div>
                  <label>分类</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                  >
                    <option>保温杯</option>
                    <option>儿童水杯</option>
                    <option>咖啡杯</option>
                    <option>配件</option>
                    <option>包装礼盒</option>
                  </select>
                </div>

                <div>
                  <label>库存</label>
                  <input
                    value={form.stock}
                    onChange={(e) => updateForm("stock", e.target.value)}
                    placeholder="例：500"
                  />
                </div>
              </div>

              <div className="two">
                <div>
                  <label>容量 / 规格</label>
                  <input
                    value={form.capacity}
                    onChange={(e) => updateForm("capacity", e.target.value)}
                    placeholder="例：350ML"
                  />
                </div>

                <div>
                  <label>颜色 / SKU</label>
                  <input
                    value={form.sku}
                    onChange={(e) => updateForm("sku", e.target.value)}
                    placeholder="例：奶油白、雾霾蓝"
                  />
                </div>
              </div>

              <label>核心卖点</label>
              <input
                value={form.sellingPoint}
                onChange={(e) => updateForm("sellingPoint", e.target.value)}
                placeholder="例：316不锈钢 / 防漏吸管 / 高颜值配色"
              />

              <label>产品描述</label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                placeholder="填写材质、颜色、适用场景、包装信息等"
              />

              <button className="submit" type="submit">
                {editingId ? "保存修改" : "上传产品"}
              </button>
            </form>
          </div>

          <div className="listPanel">
            <h2>后台产品列表</h2>

            {products.length === 0 ? (
              <p className="muted">暂无产品，请先上传。</p>
            ) : (
              products.map((p) => (
                <div className="row" key={p.id}>
                  <div>
                    <b>{p.name}</b>
                    <p>{p.category} / ¥{p.price}</p>
                  </div>
                  <div>
                    <button onClick={() => editProduct(p)}>编辑</button>
                    <button className="danger" onClick={() => deleteProduct(p.id)}>
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
            "Microsoft YaHei", sans-serif;
          background: linear-gradient(135deg, #fff7ed, #ffffff, #eff6ff);
          color: #111827;
        }

        main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px;
        }

        .topbar {
          position: sticky;
          top: 16px;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 12px 35px rgba(15, 23, 42, 0.08);
          margin-bottom: 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-left: 8px;
        }

        .logo {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          background: #111827;
          color: #fff;
          display: grid;
          place-items: center;
          font-weight: 900;
        }

        nav {
          display: flex;
          gap: 8px;
          background: #f8fafc;
          padding: 5px;
          border-radius: 999px;
        }

        nav button {
          border: none;
          padding: 10px 18px;
          border-radius: 999px;
          background: transparent;
          font-weight: 700;
          cursor: pointer;
        }

        nav button.active {
          background: #111827;
          color: white;
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr 220px;
          gap: 24px;
          align-items: stretch;
          background: white;
          padding: 46px;
          border-radius: 34px;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
          margin-bottom: 24px;
        }

        .tag {
          display: inline-block;
          padding: 8px 14px;
          border-radius: 999px;
          background: #fff7ed;
          color: #c2410c;
          font-weight: 700;
        }

        h1 {
          font-size: 54px;
          margin: 18px 0 12px;
          letter-spacing: -2px;
        }

        .hero p,
        .muted {
          color: #64748b;
          line-height: 1.7;
        }

        .stat {
          background: #111827;
          color: white;
          border-radius: 26px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .stat span {
          color: #cbd5e1;
        }

        .stat b {
          font-size: 46px;
          margin-top: 12px;
        }

        .toolbar {
          background: white;
          padding: 14px;
          border-radius: 24px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 13px 14px;
          font-size: 15px;
          outline: none;
        }

        textarea {
          min-height: 110px;
          resize: vertical;
        }

        label {
          display: block;
          font-size: 13px;
          font-weight: 800;
          margin: 14px 0 7px;
          color: #334155;
        }

        button {
          border: none;
          cursor: pointer;
          font-weight: 800;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .card {
          background: white;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
        }

        .imageBox {
          height: 240px;
          background: #f8fafc;
          display: grid;
          place-items: center;
          color: #94a3b8;
        }

        .imageBox img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 16px;
        }

        .cardBody {
          padding: 18px;
        }

        .card h3 {
          margin: 0;
          font-size: 18px;
        }

        .chips {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin: 12px 0;
        }

        .chips span {
          background: #f1f5f9;
          color: #475569;
          border-radius: 999px;
          padding: 5px 9px;
          font-size: 12px;
        }

        .selling {
          background: #eff6ff;
          color: #1e3a8a;
          padding: 10px;
          border-radius: 16px;
          min-height: 42px;
        }

        .priceRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .priceRow strong {
          font-size: 22px;
          color: #ea580c;
        }

        .priceRow button,
        .empty button,
        .row button {
          background: #111827;
          color: white;
          border-radius: 999px;
          padding: 10px 14px;
        }

        .empty {
          text-align: center;
          background: white;
          border-radius: 30px;
          padding: 80px 20px;
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
        }

        .admin {
          display: grid;
          grid-template-columns: 430px 1fr;
          gap: 24px;
        }

        .formPanel,
        .listPanel {
          background: white;
          border-radius: 30px;
          padding: 24px;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
        }

        .two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .upload {
          position: relative;
          height: 260px;
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 24px;
          display: grid;
          place-items: center;
          overflow: hidden;
          color: #64748b;
        }

        .upload img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 12px;
        }

        .upload input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .submit {
          width: 100%;
          margin-top: 18px;
          padding: 15px;
          border-radius: 18px;
          background: #111827;
          color: white;
          font-size: 16px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
          padding: 16px 0;
        }

        .row p {
          color: #64748b;
          margin: 6px 0 0;
        }

        .row div:last-child {
          display: flex;
          gap: 8px;
        }

        .row button.danger {
          background: #dc2626;
        }

        @media (max-width: 960px) {
          .hero,
          .admin {
            grid-template-columns: 1fr;
          }

          .grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          main {
            padding: 14px;
          }

          .topbar {
            border-radius: 24px;
            flex-direction: column;
          }

          .grid,
          .two {
            grid-template-columns: 1fr;
          }

          h1 {
            font-size: 38px;
          }
        }
      `}</style>
    </main>
  );
}