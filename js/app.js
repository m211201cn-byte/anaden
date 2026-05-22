let database = [];
let queryTokens = [];
let currentSkill = null;
let personalityIndex = [];
let toastTimer = null;

const skillGroups = [
  [["f120","HP・UP"],["f121","HP回復"],["f122","HP治癒"],["f123","MP・UP"],["f124","MP回復"],["f125","MP治癒"]],
  [["f128","シールド"],["f127","ダメージ軽減"],["f151","踏ん張る"],["f152","戦闘不能回復"],["f149","守護"],["f150","守勢"],["f133","庇立て"],["f52","クリティカルガード"]],
  [["f131","状態異常回復"],["f130","状態異常無効"],["f129","吹き飛ばし無効"]],
  [["f49","クリティカル率・UP"],["f51","魔法クリティカル率・UP"],["f48","オーバークリティカル"],["f50","魔法オーバークリティカル"]],
  [["f134","変幻自在"],["f146","臨機応変"],["f132","バリア貫通"],["f140","下剋上"],["f142","精神統一"],["f143","心技一体"],["f144","多段強化"],["f148","弱点看破"]],
  [["f139","ブレイク"],["f137","ウェポンブレイク"],["f138","エレメンタルブレイク"]],
  [["f141","歌唱"],["f147","祈祷"],["f145","連携"],["f136","AZ延長"],["f46","ZONE覚醒"],["f47","覚醒強化"],["f126","消費MP・DOWN"],["f135","AFゲージ回復量・UP"]],
  [["f19","毒"],["f18","ペイン"],["f20","挑発"],["f21","気絶"],["f22","睡眠"]],
  [["f23","挺身"],["f24","捨身"],["f25","帯電"],["f26","放電"],["f27","複写"],["f28","心眼"]],
  [["f30","風王陣"],["f29","地裂陣"],["f40","水天陣"],["f37","烈火陣"],["f45","招雷陣"],["f34","輝晶陣"],["f36","刻陰陣"],["f33","煌斬陣"],["f42","瞬突陣"],["f31","轟打陣"],["f32","幻魔陣"],["f39","閃撃陣"],["f35","堅守陣"],["f44","星海陣"],["f43","月光陣"],["f41","双撃陣・斬突"],["f38","双撃陣・斬魔"]],
  [["f53","地属性攻撃・UP"],["f54","風属性攻撃・UP"],["f55","火属性攻撃・UP"],["f56","晶属性攻撃・UP"],["f57","雷属性攻撃・UP"],["f58","全属性攻撃・UP"],["f59","水属性攻撃・UP"],["f60","無属性攻撃・UP"],["f61","陰属性攻撃・UP"],["f62","地属性攻撃・DOWN"],["f63","風属性攻撃・DOWN"],["f64","火属性攻撃・DOWN"],["f65","晶属性攻撃・DOWN"],["f66","雷属性攻撃・DOWN"],["f67","全属性攻撃・DOWN"],["f68","水属性攻撃・DOWN"],["f69","無属性攻撃・DOWN"],["f70","陰属性攻撃・DOWN"]],
  [["f71","地属性耐性・UP"],["f72","風属性耐性・UP"],["f73","火属性耐性・UP"],["f74","晶属性耐性・UP"],["f75","雷属性耐性・UP"],["f76","全属性耐性・UP"],["f77","水属性耐性・UP"],["f78","陰属性耐性・UP"],["f79","無属性耐性・UP"],["f80","地属性耐性・DOWN"],["f81","風属性耐性・DOWN"],["f82","火属性耐性・DOWN"],["f83","晶属性耐性・DOWN"],["f84","雷属性耐性・DOWN"],["f85","全属性耐性・DOWN"],["f86","水属性耐性・DOWN"],["f87","陰属性耐性・DOWN"],["f88","無属性耐性・DOWN"]],
  [["f89","物理耐性・UP"],["f90","魔法耐性・UP"],["f91","物理耐性・DOWN"],["f92","魔法耐性・DOWN"]],
  [["f93","打耐性・UP"],["f94","斬耐性・UP"],["f95","突耐性・UP"],["f96","打耐性・DOWN"],["f97","斬耐性・DOWN"],["f98","突耐性・DOWN"]],
  [["f99","腕力・UP"],["f100","知性・UP"],["f101","速度・UP"],["f102","幸運・UP"],["f103","耐久・UP"],["f104","精神・UP"],["f105","腕力・DOWN"],["f106","知性・DOWN"],["f107","速度・DOWN"],["f108","幸運・DOWN"],["f109","耐久・DOWN"],["f110","精神・DOWN"]],
  [["f111","槌装備者ダメージ・UP"],["f112","刀装備者ダメージ・UP"],["f113","斧装備者ダメージ・UP"],["f114","槍装備者ダメージ・UP"],["f115","弓装備者ダメージ・UP"],["f116","剣装備者ダメージ・UP"],["f117","杖装備者ダメージ・UP"],["f118","拳装備者ダメージ・UP"],["f119","全武器種ダメージ・UP"]],
  [["f14","ダメージ回避","special"],["f15","耐性弱点入替","special"],["f16","後攻関連","special"],["f17","迎撃","special"]]
];

const zoneSkillNames = new Set([
  "風王陣","地裂陣","水天陣","烈火陣","招雷陣","輝晶陣","刻陰陣","煌斬陣","瞬突陣","轟打陣","幻魔陣","閃撃陣","堅守陣","星海陣","月光陣","双撃陣・斬突","双撃陣・斬魔"
]);

const defaultBits = {
  enemy: [3,4,5,12,13,14],
  ally: [3,4,5,8,9,10,11],
  sourceOnly: [3,4,5]
};

const enemyKeywords = ["DOWN","毒","ペイン","挑発","気絶","睡眠","ブレイク","弱点看破"];
const sourceOnlyKeywords = ["陣","ZONE","覚醒","歌唱","祈祷","AZ","AFゲージ","守護","守勢"];

async function loadDatabase(){
  try{
    const response = await fetch("./database.json?t=" + Date.now());
    const jsonData = await response.json();
    database = jsonData.data || jsonData.characters || jsonData;

    if(!Array.isArray(database)){
      throw new Error("database is not array");
    }

    if(jsonData.meta && jsonData.meta.lastUpdated){
      document.getElementById("dataVersion").innerText = "Data Ver " + String(jsonData.meta.lastUpdated).split(" ")[0];
    }

    buildSkillButtons();
    buildPersonalityIndex();
  }catch(error){
    console.error(error);
    showToast("database.json の読み込みに失敗しました");
  }
}

loadDatabase();

function buildSkillButtons(){
  const container = document.getElementById("skillButtons");
  container.innerHTML = "";

  skillGroups.forEach(group=>{
    const groupDiv = document.createElement("div");
    groupDiv.className = "skill-group";
    const buttons = document.createElement("div");
    buttons.className = "skill-group-buttons";

    group.forEach(([field,label,type])=>{
      const btn = document.createElement("button");
      btn.className = "chip";
      btn.innerText = label;
      btn.onclick = type === "special" ? () => addFieldCondition(field,"y",label) : () => openSkillModal(field,label);
      buttons.appendChild(btn);
    });

    groupDiv.appendChild(buttons);
    container.appendChild(groupDiv);
  });
}

function buildPersonalityIndex(){
  const set = new Set();
  database.forEach(row=>{
    const text = row.f13 || "";
    text.split(/[、,]/).forEach(x=>{
      const v = x.trim();
      if(v) set.add(v);
    });
  });
  personalityIndex = Array.from(set).sort();
}

function normalizeKana(text){
  return String(text || "").toLowerCase().replace(/[ァ-ン]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

function searchPersonality(){
  const keyword = normalizeKana(document.getElementById("personalitySearch").value);
  const container = document.getElementById("personalityResult");
  container.innerHTML = "";
  if(!keyword) return;
  personalityIndex.filter(item => normalizeKana(item).includes(keyword)).slice(0,24).forEach(item=>{
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.innerText = item;
    btn.onclick = () => addContainsCondition("f13", item, item);
    container.appendChild(btn);
  });
}

function addOperator(operator){
  queryTokens.push({type:"operator", value:operator});
  renderTokens();
}

function addFieldCondition(field,value,label){
  queryTokens.push({type:"condition", mode:"equals", field, value, label});
  renderTokens();
}

function addContainsCondition(field,value,label){
  queryTokens.push({type:"condition", mode:"contains", field, value, label});
  renderTokens();
}

function renderTokens(){
  const container = document.getElementById("tokenContainer");
  container.innerHTML = "";

  queryTokens.forEach((token,index)=>{
    const div = document.createElement("div");
    div.className = "token " + (token.type === "operator" ? "operator" : token.type === "skill" ? "skill" : "");
    if(token.tooltip) div.dataset.tooltip = token.tooltip;
    div.innerHTML = `${escapeHtml(token.label || token.value)}<button class="token-close">×</button>`;

    attachTooltipEvents(div);

    div.querySelector(".token-close").onclick = ()=>{
      queryTokens.splice(index,1);
      hideTooltip();
      renderTokens();
    };
    container.appendChild(div);
  });
}

function attachTooltipEvents(el){
  el.addEventListener("mouseenter", e => showTooltip(e, el.dataset.tooltip));
  el.addEventListener("mouseleave", hideTooltip);
  el.addEventListener("click", e => {
    if(e.target.classList.contains("token-close")) return;
    if(el.dataset.tooltip) toggleTooltip(e, el.dataset.tooltip, el);
  });
}

function showTooltip(event,text){
  if(!text) return;
  const tooltip = document.getElementById("customTooltip");
  tooltip.textContent = text;
  tooltip.classList.remove("hidden");
  const rect = event.currentTarget.getBoundingClientRect();
  tooltip.style.left = Math.min(rect.left, window.innerWidth - 330) + "px";
  tooltip.style.top = (rect.bottom + 6) + "px";
}

function hideTooltip(){
  const tooltip = document.getElementById("customTooltip");
  if(tooltip) tooltip.classList.add("hidden");
  document.querySelectorAll(".active-tooltip").forEach(el => el.classList.remove("active-tooltip"));
}

function toggleTooltip(event,text,el){
  const tooltip = document.getElementById("customTooltip");
  if(!tooltip.classList.contains("hidden") && el.classList.contains("active-tooltip")){
    hideTooltip();
    return;
  }
  document.querySelectorAll(".active-tooltip").forEach(x => x.classList.remove("active-tooltip"));
  el.classList.add("active-tooltip");
  showTooltip(event,text);
}

function clearTokens(){
  queryTokens = [];
  hideTooltip();
  renderTokens();
}

function openSkillModal(field,label){
  currentSkill = {field,label};
  document.getElementById("modalSkillTitle").innerText = label;
  document.querySelectorAll("#skillModal input[type='checkbox']").forEach(cb=>{
    cb.checked = false;
    cb.disabled = false;
    cb.closest("label").classList.remove("disabled");
  });

  const isZoneSkill = zoneSkillNames.has(label);
  document.querySelectorAll("#skillModal input[data-bit='18'], #skillModal input[data-bit='19']").forEach(cb=>{
    if(!isZoneSkill){
      cb.checked = false;
      cb.disabled = true;
      cb.closest("label").classList.add("disabled");
    }
  });

  getDefaultBits(label).forEach(bit=>{
    const cb = document.querySelector(`#skillModal input[data-bit="${bit}"]`);
    if(cb && !cb.disabled) cb.checked = true;
  });

  document.getElementById("skillModal").classList.remove("hidden");
}

function closeSkillModal(){
  document.getElementById("skillModal").classList.add("hidden");
}

function getDefaultBits(label){
  if(sourceOnlyKeywords.some(k => label.includes(k))) return defaultBits.sourceOnly;
  if(enemyKeywords.some(k => label.includes(k))) return defaultBits.enemy;
  return defaultBits.ally;
}

function confirmSkillCondition(){
  if(!currentSkill) return;
  const bits = Array.from(document.querySelectorAll("#skillModal input[type='checkbox']:checked")).map(cb => Number(cb.dataset.bit));
  const labels = bits.map(bitToLabel);
  queryTokens.push({type:"skill", field:currentSkill.field, label:currentSkill.label, bits, tooltip: labels.length ? labels.join("\n") : "追加条件なし"});
  renderTokens();
  closeSkillModal();
}

function executeSearch(){
  if(!Array.isArray(database)){
    showToast("データ構造が正しくありません");
    return;
  }
  if(queryTokens.length === 0){
    showToast("条件を入力してください");
    return;
  }
  try{
    const ast = parseExpression(queryTokens);
    const result = database.filter(row => evaluateAst(ast,row));
    openResultWindow(result);
  }catch(error){
    console.error(error);
    showToast("検索条件の構文が正しくありません");
  }
}

function parseExpression(tokens){
  let pos = 0;
  function parsePrimary(){
    const token = tokens[pos];
    if(!token) throw new Error("unexpected end");
    if(token.type === "operator" && token.value === "("){
      pos++;
      const node = parseOr();
      if(!tokens[pos] || tokens[pos].value !== ")") throw new Error("missing )");
      pos++;
      return node;
    }
    if(token.type === "condition" || token.type === "skill"){
      pos++;
      return {type:"leaf", token};
    }
    throw new Error("invalid token");
  }
  function parseAnd(){
    let node = parsePrimary();
    while(tokens[pos] && tokens[pos].type === "operator" && tokens[pos].value === "AND"){
      pos++;
      node = {type:"and", left:node, right:parsePrimary()};
    }
    return node;
  }
  function parseOr(){
    let node = parseAnd();
    while(tokens[pos] && tokens[pos].type === "operator" && tokens[pos].value === "OR"){
      pos++;
      node = {type:"or", left:node, right:parseAnd()};
    }
    return node;
  }
  const ast = parseOr();
  if(pos !== tokens.length) throw new Error("extra token");
  return ast;
}

function evaluateAst(node,row){
  if(node.type === "leaf") return evaluateToken(node.token,row);
  if(node.type === "and") return evaluateAst(node.left,row) && evaluateAst(node.right,row);
  if(node.type === "or") return evaluateAst(node.left,row) || evaluateAst(node.right,row);
  return false;
}

function evaluateToken(token,row){
  if(token.type === "condition"){
    const value = String(row[token.field] ?? "");
    if(token.mode === "equals") return value === token.value;
    if(token.mode === "contains") return value.includes(token.value);
  }
  if(token.type === "skill") return evaluateSkill(token,row);
  return false;
}

function evaluateSkill(token,row){
  const raw = Number(row[token.field] || 0);
  if(!hasBit(raw,2)) return false;
  const sourceBits = token.bits.filter(bit => [3,4,5].includes(bit));
  const targetBits = token.bits.filter(bit => [8,9,10,11,12,13,14].includes(bit));
  const andBits = token.bits.filter(bit => ![3,4,5,8,9,10,11,12,13,14].includes(bit));
  if(sourceBits.length > 0 && !sourceBits.some(bit => hasBit(raw,bit))) return false;
  if(targetBits.length > 0 && !targetBits.some(bit => hasBit(raw,bit))) return false;
  if(andBits.length > 0 && !andBits.every(bit => hasBit(raw,bit))) return false;
  return true;
}

function hasBit(value,bitNumber){
  const mask = 1 << (19 - bitNumber);
  return (value & mask) !== 0;
}

function bitToLabel(bit){
  const labels = {3:"ヴァリアブルチャント",4:"固有スキル",5:"星導スキル",6:"先制",7:"戦闘開始時",8:"味方単体",9:"味方全体（前衛）",10:"味方後衛",11:"味方その他",12:"敵方単体",13:"敵方全体",14:"敵方その他",16:"永続",17:"耐性無視",18:"極ZONE",19:"絶ZONE"};
  return labels[bit] || `bit${bit}`;
}

function openResultWindow(result){
  const win = window.open("", "_blank");
  if(!win){
    showToast("ポップアップがブロックされました");
    return;
  }

  const tokenHtml = queryTokens.map(token=>{
    const cls = "token result-token " + (token.type === "operator" ? "operator" : token.type === "skill" ? "skill" : "");
    const tip = token.tooltip ? ` data-tooltip="${escapeAttr(token.tooltip)}"` : "";
    return `<span class="${cls}"${tip}>${escapeHtml(token.label || token.value)}</span>`;
  }).join("");

  const resultHtml = result.map(character=>{
    const imagePath = character.f4 !== undefined && character.f4 !== null && character.f4 !== "" ? `./images/${character.f4}.avif` : "./images/noimage.avif";
    return `<div class="character-card"><img class="character-image" src="${imagePath}" alt="${escapeHtml(character.f1 || "")}" onerror="this.style.visibility='hidden'"><div class="character-info"><div class="character-name">${escapeHtml(character.f1 || "Unknown")}</div><div class="link-buttons"><a href="${escapeAttr(character.f2 || "#")}" target="_blank">ALTEMA</a><a href="${escapeAttr(character.f3 || "#")}" target="_blank">SEESAA</a></div></div></div>`;
  }).join("");

  win.document.open();
  win.document.write(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><title>検索結果</title><link rel="stylesheet" href="./css/style.css"></head><body class="result-body"><header class="topbar"><div class="topbar-inner"><div class="site-title">検索結果</div><div class="top-links"><button class="close-result-btn" onclick="window.close(); setTimeout(()=>{ location.href='./index.html'; }, 150);">このタブを閉じる</button></div></div></header><section class="query-panel"><div class="query-inner"><div class="token-container">${tokenHtml}</div></div></section><main class="result-page"><div class="result-header">${result.length} 件</div><div class="result-container">${result.length ? resultHtml : "<p>該当するキャラクターが見つかりませんでした。</p>"}</div></main><div id="customTooltip" class="custom-tooltip hidden"></div><script>function showTooltip(e,t){if(!t)return;const p=document.getElementById('customTooltip');p.textContent=t;p.classList.remove('hidden');const r=e.currentTarget.getBoundingClientRect();p.style.left=Math.min(r.left,window.innerWidth-330)+'px';p.style.top=(r.bottom+6)+'px';}function hideTooltip(){const p=document.getElementById('customTooltip');if(p)p.classList.add('hidden');document.querySelectorAll('.active-tooltip').forEach(x=>x.classList.remove('active-tooltip'));}function toggleTooltip(e,t,el){const p=document.getElementById('customTooltip');if(!p.classList.contains('hidden')&&el.classList.contains('active-tooltip')){hideTooltip();return;}document.querySelectorAll('.active-tooltip').forEach(x=>x.classList.remove('active-tooltip'));el.classList.add('active-tooltip');showTooltip(e,t);}document.querySelectorAll('[data-tooltip]').forEach(el=>{el.addEventListener('mouseenter',e=>showTooltip(e,el.dataset.tooltip));el.addEventListener('mouseleave',hideTooltip);el.addEventListener('click',e=>toggleTooltip(e,el.dataset.tooltip,el));});document.addEventListener('click',e=>{if(!e.target.closest('[data-tooltip]'))hideTooltip();});<\/script></body></html>`);
  win.document.close();
}

function showToast(message){
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.style.animation = "none";
  void toast.offsetWidth;
  toast.style.animation = "toastFade 1s ease forwards";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>toast.classList.add("hidden"), 1000);
}

window.addEventListener("click",(event)=>{
  const modal = document.getElementById("skillModal");
  if(event.target === modal) closeSkillModal();
  if(!event.target.closest(".token") && !event.target.closest("#customTooltip")) hideTooltip();
});

function escapeHtml(value){
  return String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function escapeAttr(value){ return escapeHtml(value); }
