export async function onRequest(context) {
  const { env } = context;
  const cors = { 'Access-Control-Allow-Origin': '*' };
  
  try {
    const [products, batches, sales, suppliers, purchases, settingsRes] = await Promise.all([
      env.DB.prepare('SELECT * FROM products').all(),
      env.DB.prepare('SELECT * FROM batches').all(),
      env.DB.prepare('SELECT * FROM sales').all(),
      env.DB.prepare('SELECT * FROM suppliers').all(),
      env.DB.prepare('SELECT * FROM purchases').all(),
      env.DB.prepare("SELECT value FROM settings WHERE key = 'ims_settings'").first()
    ]);
    
    const parsedSales = sales.results.map(s => ({ ...s, items: typeof s.items === 'string' ? JSON.parse(s.items) : s.items }));
    const parsedPurchases = purchases.results.map(p => ({ ...p, items: typeof p.items === 'string' ? JSON.parse(p.items) : p.items }));
    const settings = settingsRes ? JSON.parse(settingsRes.value) : null;

    return new Response(JSON.stringify({
      products: products.results,
      batches: batches.results,
      sales: parsedSales,
      suppliers: suppliers.results,
      purchases: parsedPurchases,
      settings
    }), { headers: { 'Content-Type': 'application/json', ...cors } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...cors } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}   