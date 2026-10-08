export async function onRequestPost(context) {
  const { request, env } = context;
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
  
  try {
    const body = await request.json();
    const ops = [];
    
    for (const p of (body.products || [])) ops.push(env.DB.prepare(`INSERT OR REPLACE INTO products (id,name,code,category,isWeight,unlimitedStock,priceIn,priceOut,stock,warn,imgKey,createdAt,updatedAt,schema_version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(p.id, p.name, p.code || '', p.category || '', p.isWeight ? 1 : 0, p.unlimitedStock ? 1 : 0, p.priceIn || 0, p.priceOut || 0, p.stock || 0, p.warn || 5, p.imgKey || null, p.createdAt || Date.now(), p.updatedAt || Date.now(), p.schema_version || 2));
      
    for (const b of (body.batches || [])) ops.push(env.DB.prepare(`INSERT OR REPLACE INTO batches (id,productId,batchNo,initWeight,remainWeight,cost,parentId,status,createdAt,updatedAt,schema_version) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(b.id, b.productId, b.batchNo || '', b.initWeight || 0, b.remainWeight || 0, b.cost || 0, b.parentId || null, b.status || 'active', b.createdAt || Date.now(), b.updatedAt || Date.now(), b.schema_version || 2));
      
    for (const s of (body.sales || [])) ops.push(env.DB.prepare(`INSERT OR REPLACE INTO sales (id,no,time,items,total,received,change,pay,status,updatedAt,schema_version) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).bind(s.id, s.no || '', s.time || Date.now(), JSON.stringify(s.items || []), s.total || 0, s.received || 0, s.change || 0, s.pay || '现金', s.status || 'done', s.updatedAt || Date.now(), s.schema_version || 2));
      
    for (const s of (body.suppliers || [])) ops.push(env.DB.prepare(`INSERT OR REPLACE INTO suppliers (id,name,contact,phone,address,note,createdAt,updatedAt,schema_version) VALUES (?,?,?,?,?,?,?,?,?)`).bind(s.id, s.name || '', s.contact || '', s.phone || '', s.address || '', s.note || '', s.createdAt || Date.now(), s.updatedAt || Date.now(), s.schema_version || 2));
      
    for (const p of (body.purchases || [])) ops.push(env.DB.prepare(`INSERT OR REPLACE INTO purchases (id,no,time,supplierId,supplierName,items,total,note,updatedAt,schema_version) VALUES (?,?,?,?,?,?,?,?,?,?)`).bind(p.id, p.no || '', p.time || Date.now(), p.supplierId || '', p.supplierName || '', JSON.stringify(p.items || []), p.total || 0, p.note || '', p.updatedAt || Date.now(), p.schema_version || 2));

    if (body.settings) {
      // 直接把设置存到 D1 的 settings 表，彻底解决中文乱码问题！
      ops.push(env.DB.prepare("INSERT OR REPLACE INTO settings (key, value, updatedAt) VALUES ('ims_settings', ?, ?)").bind(JSON.stringify(body.settings), Date.now()));
    }

    if (ops.length) await env.DB.batch(ops);
    return new Response(JSON.stringify({ ok: true, count: ops.length }), { headers: { 'Content-Type': 'application/json', ...cors } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...cors } });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
} 