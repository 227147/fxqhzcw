/* ═══════════ 蓝图工坊 · 逻辑层 ═══════════ */
"use strict";

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ── 工具切换 ── */
$("#index").addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  $$(".tab").forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  $$(".tool").forEach((t) => (t.hidden = t.id !== tab.dataset.t));
  const cur = $("#" + tab.dataset.t);
  cur.style.animation = "none"; void cur.offsetWidth; cur.style.animation = "";
});

/* ═════ 01 JSON 校验与格式化 ═════ */
let jsonCache = "";
function tryParse(text) {
  try { return { ok: true, val: JSON.parse(text) }; }
  catch (err) { return { ok: false, err }; }
}
function showJson(obj) {
  $("#jsonOut").textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}
$("#jsonFmt").addEventListener("click", () => {
  const r = tryParse($("#jsonIn").value.trim());
  if (!r.ok) { showJson("✗ 解析失败\n\n" + r.err.message); stamp("#jsonStamp", "✗ 非法 JSON", false); return; }
  showJson(r.val); jsonCache = JSON.stringify(r.val, null, 2);
  stamp("#jsonStamp", `✓ 合法 JSON · ${typeOf(r.val)} · ${jsonCache.length} 字符`, true);
});
$("#jsonMin").addEventListener("click", () => {
  const r = tryParse($("#jsonIn").value.trim());
  if (!r.ok) { showJson("✗ 解析失败\n\n" + r.err.message); stamp("#jsonStamp", "✗ 非法 JSON", false); return; }
  jsonCache = JSON.stringify(r.val);
  showJson(jsonCache);
  stamp("#jsonStamp", `✓ 已压缩 · ${jsonCache.length} 字符`, true);
});
$("#jsonCopy").addEventListener("click", () => {
  if (!jsonCache) return;
  navigator.clipboard?.writeText(jsonCache);
  toast("#jsonStamp", "已复制到剪贴板");
});
function typeOf(v) {
  if (Array.isArray(v)) return `数组[${v.length}]`;
  if (v === null) return "null";
  const t = typeof v;
  if (t === "object") return `对象{${Object.keys(v).length}键}`;
  return t;
}
function stamp(sel, text, ok) {
  const el = $(sel);
  el.textContent = text;
  el.className = "stamp " + (ok === null ? "" : ok ? "ok" : "bad");
}
function toast(sel, text) {
  const el = $(sel); const old = el.textContent;
  el.textContent = text; el.className = "stamp ok";
  setTimeout(() => { el.textContent = old; }, 1100);
}

/* ═════ 02 编码转换 ═════ */
const b64encode = (s) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64decode = (s) => new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));

$("#codecIn").addEventListener("input", () => stamp("#codecStamp", ""));
$("#enc64").addEventListener("click", () => {
  const t = $("#codecIn").value;
  if (!t) return;
  try { $("#codecOut").value = b64encode(t); stamp("#codecStamp", "✓ 已编码为 Base64（UTF-8 安全）", true); }
  catch { stamp("#codecStamp", "✗ 编码失败", false); }
});
$("#dec64").addEventListener("click", () => {
  const t = $("#codecOut").value.trim();
  if (!t) return;
  try {
    $("#codecIn").value = b64decode(t);
    stamp("#codecStamp", "✓ 已从 Base64 解码（UTF-8）", true);
  } catch { stamp("#codecStamp", "✗ 不是合法 Base64", false); }
});
$("#encUrl").addEventListener("click", () => {
  const t = $("#codecIn").value;
  if (!t) return;
  $("#codecOut").value = encodeURIComponent(t);
  stamp("#codecStamp", "✓ 已编码为 URL 形式", true);
});
$("#decUrl").addEventListener("click", () => {
  const t = $("#codecOut").value.trim();
  if (!t) return;
  try { $("#codecIn").value = decodeURIComponent(t); stamp("#codecStamp", "✓ 已解码 URL 形式", true); }
  catch { stamp("#codecStamp", "✗ 不是合法 URL 编码", false); }
});
$("#codecSwap").addEventListener("click", () => {
  const a = $("#codecIn").value;
  $("#codecIn").value = $("#codecOut").value;
  $("#codecOut").value = a;
});

/* ═════ 03 SHA 哈希 ═════ */
const ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function hashAll() {
  const text = $("#hashIn").value;
  const data = new TextEncoder().encode(text);
  for (const algo of ALGOS) {
    const el = $("#" + algo.toLowerCase().replace("-", ""));
    if (!text) { el.textContent = "—"; continue; }
    try {
      const digest = await crypto.subtle.digest(algo, data);
      el.textContent = hex(digest);
    } catch { el.textContent = "✗ 此环境不支持 " + algo; }
  }
}
$("#hashIn").addEventListener("input", hashAll);

$$(".hash-list .mini").forEach((btn) => {
  btn.addEventListener("click", () => {
    navigator.clipboard?.writeText($("#" + btn.dataset.h).textContent);
    const old = btn.textContent;
    btn.textContent = "已复制";
    setTimeout(() => (btn.textContent = old), 900);
  });
});

/* ═════ 04 UUID v4 ═════ */
function uuidv4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c / 4)).toString(16));
}
function genUuids() {
  const n = +$("#uuidCount").value;
  const list = $("#uuidList");
  list.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const li = document.createElement("li");
    li.textContent = uuidv4();
    li.title = "点击复制";
    li.style.animationDelay = i * 0.03 + "s";
    li.addEventListener("click", () => {
      navigator.clipboard?.writeText(li.textContent);
      li.style.color = "#ffe58f";
      setTimeout(() => (li.style.color = ""), 600);
    });
    list.appendChild(li);
  }
}
$("#uuidCount").addEventListener("input", (e) => { $("#uuidN").textContent = e.target.value; genUuids(); });
$("#uuidGen").addEventListener("click", genUuids);
$("#uuidCopy").addEventListener("click", () => {
  const all = [...$$("#uuidList li")].map((li) => li.textContent).join("\n");
  navigator.clipboard?.writeText(all);
});

/* ═════ 05 时间戳 ═════ */
function tick() {
  const now = Date.now();
  $("#nowTs").textContent = now;
  $("#nowStr").textContent = new Date(now).toLocaleString("zh-CN", { hour12: false });
}
setInterval(tick, 1000); tick();

function fmtDate(d) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
$("#tsGo").addEventListener("click", () => {
  const raw = $("#tsIn").value.trim().replace(/\s/g, "");
  if (!raw) return;
  let num = Number(raw);
  if (!/^\d+$/.test(raw) || !isFinite(num)) { $("#tsOut").textContent = "✗ 请输入纯数字时间戳"; return; }
  // 10 位秒级自动转毫秒
  const ms = raw.length === 10 ? num * 1000 : num;
  const d = new Date(ms);
  $("#tsOut").textContent =
    `秒级   ${Math.floor(ms / 1000)}\n` +
    `毫秒级 ${ms}\n` +
    `本地   ${fmtDate(d)}\n` +
    `UTC    ${d.toISOString().replace("T", " ").slice(0, 19)}`;
});
$("#dateGo").addEventListener("click", () => {
  const v = $("#dateIn").value;
  if (!v) return;
  const d = new Date(v);
  $("#dateOut").textContent =
    `秒级   ${Math.floor(d.getTime() / 1000)}\n` +
    `毫秒级 ${d.getTime()}\n` +
    `UTC    ${d.toISOString().replace("T", " ").slice(0, 19)}`;
});

/* ═════ 06 正则测试台 ═════ */
let reTimer = null;
function runRegex() {
  const pat = $("#rePat").value;
  const flags = $("#reFlags").value;
  const text = $("#reText").value;
  const canvas = $("#reCanvas");
  const stats = $("#reStats");

  let re;
  try { re = new RegExp(pat, flags); }
  catch (err) {
    canvas.innerHTML = `<span class="re-err">✗ ${err.message}</span>`;
    stats.textContent = "表达式错误";
    return;
  }
  if (!pat) { canvas.textContent = text; stats.textContent = "—"; return; }

  if (flags.includes("g")) {
    const hits = [...text.matchAll(re)];
    let html = "", last = 0;
    hits.forEach((m) => {
      const i = m.index ?? 0;
      html += esc(text.slice(last, i)) + `<mark>${esc(m[0])}</mark>`;
      last = i + m[0].length;
    });
    html += esc(text.slice(last));
    canvas.innerHTML = html || esc(text);
    stats.textContent = `命中 ${hits.length} 处` + (hits[0]?.groups || hits[0]?.length > 1 ? " · 含捕获组" : "");
  } else {
    const m = text.match(re);
    if (m) {
      canvas.innerHTML = esc(text.slice(0, m.index)) + `<mark>${esc(m[0])}</mark>` + esc(text.slice(m.index + m[0].length));
      stats.textContent = `命中 1 处 · 位置 ${m.index}`;
    } else {
      canvas.textContent = text;
      stats.textContent = "命中 0 处";
    }
  }
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

["#rePat", "#reFlags", "#reText"].forEach((sel) => {
  $(sel).addEventListener("input", () => {
    clearTimeout(reTimer);
    reTimer = setTimeout(runRegex, 180);
  });
});

/* ── 初始化 ── */
genUuids();
runRegex();
hashAll();
