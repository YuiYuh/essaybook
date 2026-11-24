/* EssayBook: public application shell. Private writing data is never bundled here. */
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const NAMES={home:'首页',history:'背诵记录',challenge:'随机默写',essays:'我的作文',sentences:'分类背诵',study:'好句背诵',phrases:'替换表达',favorites:'我的收藏',settings:'设置'};
const NAV=[['home','◧'],['essays','▤'],['sentences','✎'],['phrases','⌕'],['favorites','☆']];
const KEY='essaybook-local-v1',CONFIG='essaybook-cloud-config-v1';
const LOCAL_OWNER = 'essaybook-local-owner';
const RECOVERY_PREFIX = 'essaybook-recovery-';
const blank=()=>({schemaVersion:1,essays:[],phrases:[],favorites:[],reviews:{},collections:[]});
let data=loadData(), config=loadConfig(), db=null, user=null, synced=false, localDirty=false;
let localRevision = 0;
let cloudError = '';
let initialCloudPending = Boolean(config.url && config.key);
const PHRASE_PAGE_SIZE = 40;
let ui={page:'home',challenge:null,essay:null,variant:'final',readMode:'cn',shown:{},phraseQuery:'',phraseFilter:'expressions',phraseLimit:PHRASE_PAGE_SIZE,essayFilter:'all',onlyFavorites:false,sentenceKind:'essay',sentenceFormat:'picture',sentenceSection:'opening',studySelection:new Set(),showStudySelection:false,studyList:[],studyResults:new Map(),studyIndex:0,studyTitle:'好句背诵',studyReturn:'phrases',reveal:false,typed:'',comparison:false};
function loadData(){try{return {...blank(),...JSON.parse(localStorage.getItem(KEY))}}catch{return blank()}}
function loadConfig(){let stored={};try{stored=JSON.parse(localStorage.getItem(CONFIG))||{}}catch{}const preset=window.ESSAYBOOK_CLOUD||{};const ready=preset.key && !preset.key.startsWith('REPLACE_WITH_');return ready?{url:preset.url,key:preset.key}:stored}
function recoveryKeys() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(RECOVERY_PREFIX)) keys.push(key);
  }
  return keys.sort().reverse();
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    if (error.name !== 'QuotaExceededError') throw error;
    const keys = recoveryKeys();
    const copies = new Set();
    let removedDuplicate = false;
    for (const recoveryKey of keys) {
      const copy = localStorage.getItem(recoveryKey);
      if (copy === null) continue;
      if (copies.has(copy)) {
        localStorage.removeItem(recoveryKey);
        removedDuplicate = true;
      } else {
        copies.add(copy);
      }
    }
    if (!removedDuplicate) throw error;
    localStorage.setItem(key, value);
  }
}

function saveLocal(snapshot = data) {
  writeLocal(KEY, JSON.stringify(snapshot));
}

function saveRecoveryCopy(snapshot) {
  const value = JSON.stringify(snapshot);
  if (recoveryKeys().some(key => localStorage.getItem(key) === value)) return;
  let timestamp = Date.now();
  while (localStorage.getItem(RECOVERY_PREFIX + timestamp) !== null) timestamp++;
  writeLocal(RECOVERY_PREFIX + timestamp, value);
}

// Supabase's JSONB output can reorder object keys without changing any data.
function sameSnapshot(left, right) {
  if (left === right) return true;
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length &&
    keys.every(key => Object.hasOwn(right, key) && sameSnapshot(left[key], right[key]));
}
let saveTimer;
function save() {
  localDirty = true;
  localRevision++;
  try {
    saveLocal();
  } catch (error) {
    reportCloudError('本机保存失败', error);
    if (!user || !db) throw error;
  }
  if (!user || !db) return;
  const owner = user.id;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (user?.id === owner) cloudSave();
  }, 900);
}
function toast(s){const e=$('#toast');e.textContent=s;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2700)}
function cloudNotice() {
  if (cloudError) return cloudError;
  if (user) return synced ? '✓ 已连接云端，修改自动同步' : '正在连接或同步中';
  return config.url && config.key ? '连接已预配置，不用填写 URL 和 Key。' : '尚未配置公开连接密钥。';
}

function refreshCloudStatus() {
  $('#cloudBadge').innerHTML = `<span class="dot ${user && synced ? 'green' : ''}"></span><span>${user && synced ? '云端已连接' : user ? '云端未同步' : '本地模式'}</span>`;
  const notice = $('#cloudSyncNotice');
  if (notice) notice.textContent = cloudNotice();
}

function reportCloudError(label, error) {
  synced = false;
  const message = error.name === 'QuotaExceededError'
    ? '浏览器的本机存储空间已满。请先导出完整备份。'
    : error.message;
  cloudError = `${label}：${message}`;
  refreshCloudStatus();
  toast(cloudError);
}
const countWords=s=>(String(s||'').match(/\b[\w'-]+\b/g)||[]).length;
const paras=s=>String(s||'').split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean);
const uniq=a=>[...new Set(a)];
function showPage(p){if(p!=='challenge')clearChallenge();ui.page=p;ui.comparison=false;draw();scrollTo(0,0)}
function btn(label, action, cls = '') {
  return `<button type="button" class="btn ${cls}" data-action="${esc(action)}">${label}</button>`;
}
function empty(title,desc,action='导入我的学习资料'){return `<div class="empty"><div style="font-size:29px">◌</div><strong>${title}</strong><p>${desc}</p>${btn(action,'import','primary')}</div>`}
function navBar() {
  const current = ui.page === 'study' ? ui.studyReturn : ui.page === 'challenge' ? 'home' : ui.page;
  const link = ([id, icon], active) => `<button type="button" class="navItem${active === id ? ' active' : ''}"
    data-page="${id}" ${active === id ? 'aria-current="page"' : ''}><span class="glyph" aria-hidden="true">${icon}</span>${NAMES[id]}</button>`;
  $('#nav').innerHTML = [...NAV.slice(0, 3), ['history', '◷']].map(item => link(item, current)).join('');
  $('#toolnav').innerHTML = NAV.slice(3).map(item => link(item, current)).join('');
  $('.mobileBottom').innerHTML = NAV.map(item => link(item, current === 'history' ? 'home' : current)).join('');
  $('#breadcrumbs').textContent = NAMES[ui.page];
  $('#statPill').textContent = `${data.essays.length} 篇作文 · ${data.phrases.length} 条素材`;
  refreshCloudStatus();
}
function draw() {
  navBar();
  if (ui.page !== 'phrases' || !$('#phraseSearch')) {
    const render = {home:renderHome,history:renderHistory,challenge:renderChallenge,essays:renderEssays,sentences:renderSentenceBank,study:renderStudy,phrases:renderPhrases,favorites:renderFavorites,settings:renderSettings};
    $('#app').innerHTML = render[ui.page]();
    if (ui.page === 'phrases') attachPhraseSearch();
  }
  if (ui.page === 'phrases') updatePhraseResults();
  attach();
}
function layoutHeader(title, subtitle) {
  return `<h1 class="pageTitle">${title}</h1><p class="sub">${subtitle}</p>`;
}
function essayRow(e){return `<button class="essayItem" data-essay="${esc(e.id)}"><div class="fileIcon">▤</div><div class="details"><b>${esc(e.year)} · ${esc(e.title)}</b><small>${esc(e.kind)}　/　${esc(e.topic)}</small></div><span class="arrow">→</span></button>`}
function renderHome() {
  if (ui.essay) return renderEssayDetail();
  const recent = data.essays.slice().reverse().slice(0, 3);
  const daily = renderDailyStudy();
  return `<h1 class="pageTitle">学习首页</h1>
    ${daily || '<div class="actions"><button type="button" class="btn soft" data-page="history">背诵记录 →</button></div>'}
    <div class="home-tools" aria-label="学习工具">
      ${btn('按题型分类背诵', 'sentenceMode')}
      ${btn('随机默写', 'randomChallenge')}
      ${btn('按中文查替换表达 →', 'toPhrases')}
    </div>
    <section class="home-archive" aria-labelledby="home-essays">
      <div class="panelTitle">
        <h2 class="sectionTitle" id="home-essays">我的作文</h2>
        <button type="button" class="btn ghost" data-page="essays">全部作文 →</button>
      </div>
      ${recent.length ? `<div class="home-essay-list">${recent.map(essayRow).join('')}</div>`
        : empty('暂无作文', '可以导入已有作文，或新建一篇。')}
      <div class="actions home-secondary">
        ${btn('整篇背诵 →', 'chooseEssay', 'ghost')}
        ${btn('打开 ChatGPT ↗', 'chatgpt', 'ghost')}
      </div>
    </section>`;
}
function renderEssays(){if(ui.essay)return renderEssayDetail();const list=data.essays.filter(e=>ui.essayFilter==='all'||e.kind===ui.essayFilter);return `${layoutHeader('我的作文','原稿、修改稿与推荐背诵版。')}<div class="toolbar"><div class="seg">${[['all','全部'],['大作文','大作文'],['小作文','小作文']].map(([k,v])=>`<button class="${ui.essayFilter===k?'on':''}" data-essayfilter="${k}">${v}</button>`).join('')}</div>${btn('导入作文数据','import')}${btn('新增作文','addEssay','soft')}</div>${list.length?`<div class="essayGrid">${list.map(e=>`<button class="essayCard" data-essay="${esc(e.id)}"><div><span class="tag">${esc(e.kind)}</span><span class="tag grey">${esc(e.topic)}</span><h3>${esc(e.year)} · ${esc(e.title)}</h3></div><div class="foot"><span>${countWords(e.original)} 词原稿</span><span>查看并背诵 →</span></div></button>`).join('')}</div>`:empty('暂无作文','请先导入作文数据，或者新建一篇。')}`}
function renderEssayDetail(){const e=data.essays.find(x=>x.id===ui.essay);if(!e){ui.essay=null;return renderEssays()}const source=e[ui.variant]||'';const arr=paras(source);const labels={original:'手写原稿',revised:'AI修改稿',final:'背诵版'};let comparison=ui.comparison?`<div class="compare"><div class="readingBox"><div class="eyebrow">ORIGINAL / 原稿</div><div class="article">${esc(e.original)}</div></div><div class="readingBox"><div class="eyebrow">REVISED / 修改稿</div><div class="article">${esc(e.revised)}</div></div></div>`:'';let article=arr.map((p,i)=>`<div class="readingBlock"><div class="paraHeader"><span class="paraLabel">PARAGRAPH ${String(i+1).padStart(2,'0')}</span>${btn(ui.shown[i]?'隐藏':'显示','togglePara:'+i,'ghost')}</div>${ui.readMode==='cn'?`<div class="cnHint">第 ${i+1} 段 · 根据这一段的观点自行回忆英文，点击下面区域查看原文。</div>`:''}${ui.readMode==='en'||ui.shown[i]?`<p class="article paragraph">${esc(p)}</p>`:`<div class="hiddenText" data-action="togglePara:${i}">英文已隐藏 · 点击展开核对</div>`}</div>`).join('');return `<button class="btn ghost" data-action="backEssays">← 返回作文库</button><div class="eyebrow" style="margin-top:20px">${esc(e.year)} / ${esc(e.kind)}</div><h1 class="pageTitle">${esc(e.title)}</h1><p class="sub">${esc(e.note||'')} · ${countWords(source)} 词</p><div class="toolbar"><div class="seg">${[['original','原稿'],['revised','AI修改'],['final','背诵版']].map(([k,v])=>`<button class="${ui.variant===k?'on':''}" data-variant="${k}">${v}</button>`).join('')}</div>${btn(ui.comparison?'退出对照':'左右对照','compare')}${btn('编辑当前版本','editEssay')}${btn('添加到句子库','extractSentences','soft')}</div>${ui.comparison?comparison:`<div class="toolbar"><div class="seg">${[['en','全文显示'],['cn','隐藏英文']].map(([k,v])=>`<button class="${ui.readMode===k?'on':''}" data-readmode="${k}">${v}</button>`).join('')}</div>${btn('全部显示','showAll')}${btn('全部隐藏','hideAll')}${source.trim() ? btn('记录整篇背诵', 'recordEssay', 'soft') : ''}</div><div class="readingBox">${article}</div>`}`}
function normalizeSearch(value) {
  return String(value ?? '').normalize('NFKC').toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, ' ').trim();
}

const writingConcepts = (typeof WRITING_EXPRESSIONS === 'undefined' ? [] : WRITING_EXPRESSIONS).map(({ meaning, aliases, groups }) => ({
  terms: [meaning, ...aliases].map(normalizeSearch),
  groups: groups.map(({ id, label, keywords, entries }) => ({
    label,
    terms: [label, ...keywords].map(normalizeSearch),
    phrases: entries.map(([en, zh, example]) => ({ id: `builtin:${id}:${en}`, en, zh, example })),
  })),
}));
const builtinPhrases = writingConcepts.flatMap(concept => concept.groups.flatMap(group => group.phrases));

function isSentenceMaterial(phrase) {
  return phrase?.id && typeof phrase.en === 'string' && phrase.en.trim() && /句/.test(phrase.category || '');
}

const SENTENCE_KINDS = [
  {id:'essay', label:'大作文'},
  {id:'task', label:'小作文'},
  {id:'other', label:'其他好句'},
];
const SENTENCE_FORMATS = [
  {id:'picture', kind:'essay', label:'看图大作文', plan:'先写画面里的动作或对比，再用画面证据解释寓意，最后给出具体建议。'},
  {id:'chart', kind:'essay', label:'图表大作文', plan:'先交代图表主题，选最能说明问题的数据，再解释可能原因并给出判断。'},
  {id:'material', kind:'essay', label:'材料大作文', plan:'先用自己的话概括材料并表态，再写理由或反例，最后收回同一个观点。'},
  {id:'reply', kind:'task', label:'回信与多任务', plan:'先接住来信，主体按题干顺序逐点回答，结尾说清下一步。'},
  {id:'invitation', kind:'task', label:'邀请函', plan:'开头说明邀请谁做什么，主体写时间、地点和安排，需要时在结尾请对方确认。'},
  {id:'suggestion', kind:'task', label:'建议信', plan:'开头交代要解决的问题，主体每条建议都配一个理由，结尾可以建议试行。'},
  {id:'introduction', kind:'task', label:'介绍与推荐', plan:'先说清介绍对象，再给具体特点或推荐理由，结尾给出体验或报名方式。'},
  {id:'notice', kind:'task', label:'通知与招募', plan:'先说通知什么和面向谁，主体写安排或要求，结尾交代截止和联系方式。'},
  {id:'minutes', kind:'task', label:'会议纪要', plan:'先记会议基本信息，主体记讨论和决议，结尾记负责人、期限或下次检查。'},
  {id:'apology', kind:'task', label:'道歉信', plan:'先为具体失误道歉，主体简述原因并提出补救，结尾确认对方是否方便。'},
  {id:'courtesy', kind:'task', label:'感谢与祝贺', plan:'开头点明感谢的帮助或祝贺的成就，主体补一处具体细节，结尾给贴合的祝愿。'},
  {id:'inquiry', kind:'task', label:'询问与求助', plan:'先写所问事项，按条说明问题或困难，结尾给方便对方回复的方式。'},
  {id:'complaint', kind:'task', label:'投诉信', plan:'先写具体问题，主体说明影响和期望的解决办法，结尾请对方确认处理时间。'},
  {id:'application', kind:'task', label:'申请信', plan:'先写申请的岗位，再用一个经历证明能力，结尾说明可面试或补充材料。'},
  {id:'other', kind:'other', label:'其他好句'},
];
const SENTENCE_SECTIONS = [
  {id:'opening', label:'首段'},
  {id:'body', label:'主体段'},
  {id:'closing', label:'结尾'},
];
const STUDY_MINUTE = 60 * 1000;
const STUDY_DAY = 24 * 60 * STUDY_MINUTE;
const STUDY_LEVELS = [
  {id:'again', label:'不熟', interval:30 * STUDY_MINUTE},
  {id:'familiar', label:'有点熟', interval:STUDY_DAY},
  {id:'known', label:'熟练', interval:3 * STUDY_DAY},
];
const STUDY_LEVEL_LABELS = new Map(STUDY_LEVELS.map(({id, label}) => [id, label]));
const ESSAY_VERSIONS = {original:'原稿', revised:'AI 修改稿', final:'背诵版'};
const HISTORY_FILTERS = ['今天', '昨天', '前天', '累计'];
const HISTORY_PAGE_SIZE = 30;
const historyDateFormat = new Intl.DateTimeFormat('zh-CN', {year:'numeric', month:'numeric', day:'numeric'});
const historyTimeFormat = new Intl.DateTimeFormat('zh-CN', {hour:'2-digit', minute:'2-digit', hourCycle:'h23'});
let historyFilter = '0', historyDate = '', historyLimit = HISTORY_PAGE_SIZE;

function practiceLog(snapshot) {
  const log = snapshot.practiceLog;
  return log && typeof log === 'object' && !Array.isArray(log) ? log : {};
}

function isPracticeEntry(entry) {
  return Array.isArray(entry) && typeof entry[0] === 'string' && typeof entry[1] === 'string' &&
    Number.isFinite(Date.parse(entry[1])) &&
    (STUDY_LEVEL_LABELS.has(entry[2]) || entry[2] === 'essay' || entry[2] === 'legacy');
}

function datedPractice(snapshot) {
  const events = Object.entries(practiceLog(snapshot)).filter(([, entry]) => isPracticeEntry(entry));
  const dated = new Set(events.filter(([, entry]) => entry[2] !== 'essay')
    .map(([, [id, at]]) => JSON.stringify([id, Date.parse(at)])));
  for (const [id, review] of Object.entries(snapshot.reviews || {})) {
    const at = Date.parse(review?.at);
    const key = JSON.stringify([id, at]);
    if (Number.isFinite(at) && !dated.has(key)) {
      events.push(['legacy:' + key, [id, new Date(at).toISOString(), 'legacy', review.last || '']]);
    }
  }
  return Object.fromEntries(events);
}

function gradeCounts(log) {
  const counts = new Map();
  for (const [id, , grade] of Object.values(log)) {
    if (!STUDY_LEVEL_LABELS.has(grade)) continue;
    if (!counts.has(id)) counts.set(id, {});
    const byGrade = counts.get(id);
    byGrade[grade] = (byGrade[grade] || 0) + 1;
  }
  return counts;
}

function reviewCount(value) {
  return Number.isSafeInteger(value) && value > 0 ? value : 0;
}

function mergePractice(first, second) {
  const firstLog = datedPractice(first);
  const secondLog = datedPractice(second);
  const combinedLog = {...firstLog, ...secondLog};
  // Historical timestamps can also arrive from a backup that predates the event log.
  // When both sources contain the same practice, keep its precise event only.
  for (const [id, at, grade] of Object.values(combinedLog)) {
    if (STUDY_LEVEL_LABELS.has(grade)) delete combinedLog['legacy:' + JSON.stringify([id, Date.parse(at)])];
  }
  const firstCounts = gradeCounts(firstLog);
  const secondCounts = gradeCounts(secondLog);
  const counts = gradeCounts(combinedLog);
  const ids = new Set([...Object.keys(first.reviews || {}), ...Object.keys(second.reviews || {}), ...counts.keys()]);
  const reviews = Object.fromEntries([...ids].map(id => {
    const left = Object.hasOwn(first.reviews || {}, id) ? first.reviews[id] : {};
    const right = Object.hasOwn(second.reviews || {}, id) ? second.reviews[id] : {};
    const latest = Date.parse(left?.at) > (Date.parse(right?.at) || -Infinity) ? left : right;
    const review = {...left, ...right, ...latest};
    for (const grade of STUDY_LEVEL_LABELS.keys()) {
      const legacy = Math.max(0,
        reviewCount(left?.[grade]) - (firstCounts.get(id)?.[grade] || 0),
        reviewCount(right?.[grade]) - (secondCounts.get(id)?.[grade] || 0));
      const total = legacy + (counts.get(id)?.[grade] || 0);
      if (total || Object.hasOwn(review, grade)) review[grade] = total;
    }
    return [id, review];
  }));
  return Object.keys(combinedLog).length ? {reviews, practiceLog:combinedLog} : {reviews};
}

function addPractice(id, at, grade, detail) {
  const random = crypto.getRandomValues(new Uint32Array(3));
  const key = Array.from(random, part => part.toString(36)).join('-');
  const entry = detail ? [id, at, grade, detail] : [id, at, grade];
  data.practiceLog = {...practiceLog(data), [key]:entry};
}

function localPracticeDate(date) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map(part => String(part).padStart(2, '0')).join('-');
}

function dateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return localPracticeDate(date);
}

function getHistory(day) {
  const items = new Map();
  const preciseCounts = new Map();
  for (const [id, at, grade, detail] of Object.values(datedPractice(data))) {
    const essay = grade === 'essay';
    if (!essay && grade !== 'legacy') preciseCounts.set(id, (preciseCounts.get(id) || 0) + 1);
    if (day && localPracticeDate(new Date(at)) !== day) continue;
    const key = JSON.stringify([essay, id]);
    const item = items.get(key) || {id, essay, count:0, at:'', grade:'', detail:'', legacy:false};
    item.count++;
    item.legacy ||= grade === 'legacy';
    if (Date.parse(at) > (Date.parse(item.at) || -Infinity)) {
      Object.assign(item, {at, grade, detail});
    }
    items.set(key, item);
  }
  let hasLegacy = false;
  for (const [id, review] of Object.entries(data.reviews || {})) {
    const total = [...STUDY_LEVEL_LABELS.keys()].reduce((sum, grade) => sum + reviewCount(review?.[grade]), 0);
    const key = JSON.stringify([false, id]);
    const item = items.get(key);
    const legacy = total > (preciseCounts.get(id) || 0);
    hasLegacy ||= legacy;
    if (!day && total) {
      items.set(key, {...(item || {id, essay:false, at:'', grade:review?.last}), count:Math.max(total, item?.count || 0), legacy:legacy || item?.legacy});
    }
  }
  const rows = [...items.values()].sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0));
  return {rows, hasLegacy:hasLegacy || rows.some(item => item.legacy)};
}

function renderHistory() {
  const all = historyFilter === '3';
  const day = all ? '' : historyFilter === 'date' ? historyDate : dateDaysAgo(Number(historyFilter));
  const {rows, hasLegacy} = getHistory(day);
  const phrases = new Map(data.phrases.map(phrase => [phrase?.id, phrase]));
  const essays = new Map(data.essays.map(essay => [essay?.id, essay]));
  const sentences = rows.filter(row => !row.essay);
  const essayCount = rows.length - sentences.length;
  const essayAttempts = rows.reduce((sum, row) => row.essay ? sum + row.count : sum, 0);
  const sentenceAttempts = sentences.reduce((sum, row) => sum + row.count, 0);
  const heading = all ? '累计背诵' : historyDateFormat.format(new Date(day + 'T12:00:00'));
  return `<div class="history-page">
    <h1 class="pageTitle">背诵记录</h1>
    <div class="history-filters">
      <div class="actions recall-filters" role="group" aria-label="背诵日期范围">
        ${HISTORY_FILTERS.map((label, i) => `<button type="button" class="btn recall-filter"
          data-action="historyFilter:${i}" aria-pressed="${String(i) === historyFilter}">${label}</button>`).join('')}
      </div>
      <label class="history-date">选择日期
        <input type="date" id="historyDate" max="${dateDaysAgo(0)}" value="${esc(historyFilter === 'date' ? historyDate : '')}">
      </label>
    </div>
    <section aria-labelledby="history-heading">
      <div class="history-summary">
        <h2 class="sectionTitle" id="history-heading">${heading}</h2>
        <p class="counter">${sentences.length} 句 · ${sentenceAttempts} 次练句${essayCount ? ` · ${essayCount} 篇作文、${essayAttempts} 次整篇背诵` : ''}</p>
      </div>
      ${rows.length ? `<ul class="history-list" aria-label="背过的内容">
        ${rows.slice(0, historyLimit).map(row => {
          const phrase = phrases.get(row.id);
          const essay = essays.get(row.id);
          const version = Object.hasOwn(ESSAY_VERSIONS, row.detail) ? ESSAY_VERSIONS[row.detail] : '';
          const level = row.essay ? version : STUDY_LEVEL_LABELS.get(row.grade === 'legacy' ? row.detail : row.grade);
          const time = row.at ? (all ? historyDateFormat : historyTimeFormat).format(new Date(row.at)) : '日期未记录';
          return `<li class="history-item">
            <div>
              <strong ${row.essay ? '' : 'lang="en"'}>${esc(row.essay ? essay?.title || '作文已不在档案中' : phrase?.en || '原句已不在句库')}</strong>
              ${!row.essay && phrase?.zh ? `<p>${esc(phrase.zh)}</p>` : ''}
            </div>
            <div class="history-item-meta"><span>${row.count} 次${level ? ` · ${level}` : ''}</span>
              ${row.at ? `<time datetime="${esc(row.at)}">${time}</time>` : `<span>${time}</span>`}
            </div>
          </li>`;
        }).join('')}
      </ul>` : empty(all ? '还没有背诵记录' : '这天没有背诵记录', '背完句子标记熟练度，或在作文页记录整篇背诵。')}
      ${rows.length > historyLimit ? btn(`再显示 ${Math.min(HISTORY_PAGE_SIZE, rows.length - historyLimit)} 条`, 'historyMore') : ''}
      ${hasLegacy ? '<p class="history-note">旧记录保留了累计次数和最近一次日期，更早的练习可能没有日期。</p>' : ''}
    </section>
  </div>`;
}

function setHistoryFilter(filter) {
  historyFilter = filter;
  historyLimit = HISTORY_PAGE_SIZE;
  draw();
}

function recordEssayPractice() {
  const essay = data.essays.find(item => item.id === ui.essay);
  if (typeof essay?.[ui.variant] !== 'string' || !essay[ui.variant].trim()) return toast('当前版本还没有正文');
  addPractice(essay.id, new Date().toISOString(), 'essay', ui.variant);
  save();
  toast('已记下这次整篇背诵');
}

const REVIEW_ROUND_SIZE = 12;
const NEW_ROUND_SIZE = 6;

function getDailyStudy() {
  const due = [];
  const fresh = [];
  const now = Date.now();
  for (const phrase of data.phrases.filter(isSentenceMaterial)) {
    const review = data.reviews[phrase.id];
    const priority = STUDY_LEVELS.findIndex(level => level.id === review?.last);
    if (priority < 0) {
      fresh.push(phrase);
      continue;
    }
    const markedAt = Date.parse(review.at);
    const dueAt = Number.isFinite(markedAt) ? markedAt + STUDY_LEVELS[priority].interval : 0;
    if (dueAt <= now) due.push({phrase, priority, dueAt});
  }
  due.sort((a, b) => a.priority - b.priority || a.dueAt - b.dueAt);
  fresh.sort((a, b) => Number(b.study?.core === true) - Number(a.study?.core === true));
  return {due:due.map(item => item.phrase), fresh};
}

function renderDailyStudy(compact = false) {
  if (!data.phrases.some(isSentenceMaterial)) return '';
  const {due, fresh} = getDailyStudy();
  const size = due.length ? Math.min(REVIEW_ROUND_SIZE, due.length) : Math.min(NEW_ROUND_SIZE, fresh.length);
  const message = due.length > size
    ? `${due.length} 句到时间了，这轮先复习 ${size} 句。`
    : due.length ? `${size} 句到时间了，按熟练度安排。`
    : size ? '暂时没有到期句子，可以先学一小组新句。' : '暂时没有到期的句子。';
  const label = due.length ? `复习 ${size} 句` : `先学 ${size} 句`;
  if (compact) return size ? btn(label, 'dailyStudy', 'soft') : '';
  return `<section class="recall-today" aria-labelledby="daily-study-heading">
    <div><h2 class="sectionTitle" id="daily-study-heading">今日复习</h2><p class="secondary">${message}</p></div>
    <div class="actions recall-today-actions">
      ${size ? btn(label, 'dailyStudy', 'primary') : ''}
      <button type="button" class="btn ghost" data-page="history">背诵记录 →</button>
    </div>
  </section>`;
}

function startDailyStudy() {
  const {due, fresh} = getDailyStudy();
  const cards = due.length ? due.slice(0, REVIEW_ROUND_SIZE) : fresh.slice(0, NEW_ROUND_SIZE);
  if (!cards.length) return draw();
  startStudy(cards.map(phrase => phrase.id), {title:due.length ? '今日复习' : '新句练习', returnPage:ui.page});
}

function getSentenceBank() {
  const buckets = new Map(SENTENCE_FORMATS.map(format => [format.id, []]));
  for (const phrase of data.phrases.filter(isSentenceMaterial)) {
    const {format, section} = phrase.study || {};
    const key = buckets.has(format) && SENTENCE_SECTIONS.some(item => item.id === section) ? format : 'other';
    buckets.get(key).push(phrase);
  }
  const availableFormats = SENTENCE_FORMATS.map(format => ({...format, count:buckets.get(format.id).length})).filter(format => format.count);
  const kinds = SENTENCE_KINDS.map(kind => ({
    ...kind, count:availableFormats.filter(format => format.kind === kind.id).reduce((sum, format) => sum + format.count, 0),
  })).filter(kind => kind.count);
  const kind = kinds.find(item => item.id === ui.sentenceKind) || kinds[0];
  if (!kind) return {groups:new Map(), cards:[]};
  const formats = availableFormats.filter(format => format.kind === kind.id);
  const format = formats.find(item => item.id === ui.sentenceFormat) || formats[0];

  const bank = buckets.get(format.id);
  const sections = SENTENCE_SECTIONS.map(section => ({
    ...section, count:bank.filter(phrase => phrase.study?.section === section.id).length,
  })).filter(section => section.count && format.id !== 'other');
  const section = sections.find(item => item.id === ui.sentenceSection) || sections[0];
  const cards = section ? bank.filter(phrase => phrase.study.section === section.id) : bank;
  cards.sort((a, b) => Number(b.study?.core === true) - Number(a.study?.core === true));
  const groups = new Map();
  for (const phrase of cards) {
    const use = typeof phrase.study?.use === 'string' && phrase.study.use.trim() ? phrase.study.use : '我的好句';
    if (!groups.has(use)) groups.set(use, []);
    groups.get(use).push(phrase);
  }
  return {kinds, kind, formats, format, sections, section, groups, cards};
}

function renderSentenceBank() {
  const {kinds, kind, formats, format, sections, section, groups, cards} = getSentenceBank();
  const heading = `<div class="recall-page-heading"><h1 class="pageTitle">分类背诵</h1>${format ? renderDailyStudy(true) : ''}</div>`;
  if (!format) return heading + empty('还没有可背的好句', '可以从自己的作文中提取，或导入已有素材。');

  const selected = activeStudyCards(ui.studySelection);
  const reviewingSelection = ui.showStudySelection;
  const selectionBar = `<div class="actions recall-selection${selected.length ? ' has-selection' : ''}" aria-label="选择要背的句子">
    <span class="counter" role="status">已选 ${selected.length} 句</span>
    ${reviewingSelection ? btn('返回分类', 'recallToggleSelection', 'ghost') : btn('全选当前', 'recallSelectAll', 'ghost')}
    ${selected.length && !reviewingSelection ? btn('查看已选', 'recallToggleSelection', 'ghost') : ''}
    ${selected.length && reviewingSelection ? btn('清空已选', 'recallClearSelection', 'ghost') : ''}
    <button type="button" class="btn primary" data-action="recallStudySelection" ${!selected.length ? 'disabled' : ''}>背诵已选</button>
  </div>`;
  if (reviewingSelection) return `${heading}${selectionBar}
    <h2 class="sectionTitle recall-selected-heading">已选句子</h2>
    ${selected.length ? `<div class="phraseList">${selected.map(phraseHTML).join('')}</div>`
      : '<p class="sub">还没有选中的句子。</p>'}`;

  const priority = cards.filter(phrase => phrase.study?.core === true).length;
  const filterButton = (item, action, active) => `<button type="button" class="btn recall-filter"
    data-action="${action}:${item.id}" aria-pressed="${active}">${item.label}</button>`;
  return `${heading}
    <div class="recall-controls">
      <div class="recall-category">
        ${kinds.length > 1 ? `<div class="actions recall-filters" role="group" aria-label="大作文或小作文">
          ${kinds.map(item => filterButton(item, 'recallKind', item.id === kind.id)).join('')}
        </div>` : ''}
        <label class="recall-format" for="recallFormatPicker">
          <span>题型</span>
          <select class="select" id="recallFormatPicker">
            ${formats.map(item => `<option value="${esc(item.id)}" ${item.id === format.id ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}
          </select>
        </label>
      </div>
      ${sections.length ? `<div class="actions recall-filters" role="group" aria-label="段落位置">
        ${sections.map(item => filterButton(item, 'recallSection', item.id === section.id)).join('')}
      </div>` : ''}
      <div class="actions recall-start">
        ${priority && priority < cards.length ? btn(`先背 ${priority} 句重点`, 'recallPriority', 'primary') : ''}
        ${btn(`背当前 ${cards.length} 句`, 'recallAll', priority && priority < cards.length ? '' : 'primary')}
        ${format.plan ? `<details class="recall-guide"><summary>写法提示</summary><p class="recall-plan">${esc(format.plan)}</p></details>` : ''}
      </div>
    </div>
    ${selectionBar}
    ${[...groups].map(([use, phrases]) => `<section class="expression-group recall-group">
      <div class="recall-group-heading"><h2 class="sectionTitle">${esc(use)}</h2>
        ${phrases.length > 1 && phrases.length < cards.length ? btn('背这一组', 'recallUse:' + use) : ''}
      </div>
      <div class="phraseList">${phrases.map(phraseHTML).join('')}</div>
    </section>`).join('')}`;
}

function startCategoryStudy(cards, bank, label = '') {
  const title = [bank.format?.label, bank.section?.label, label].filter(Boolean).join(' · ');
  startStudy(cards.map(phrase => phrase.id), {title, returnPage:'sentences'});
}

function getPhraseResults() {
  const query = normalizeSearch(ui.phraseQuery);
  const favoriteIds = new Set(data.favorites);
  const favoriteMatches = phrase => !ui.onlyFavorites || favoriteIds.has(phrase.id);
  const equivalentTerms = new Set();
  const groups = [];

  const { phraseFilter } = ui;
  const includeBuiltins = ['all', 'expressions'].includes(phraseFilter);
  if (query || (includeBuiltins && ui.onlyFavorites)) {
    for (const concept of writingConcepts) {
      const exactConcept = concept.terms.includes(query);
      const conceptMatches = query && concept.terms.some(term => term.includes(query));
      if (exactConcept) concept.terms.forEach(term => equivalentTerms.add(term));

      for (const group of concept.groups) {
        const exactGroup = group.terms.includes(query);
        if (exactConcept || exactGroup) {
          group.terms.forEach(term => equivalentTerms.add(term));
          group.phrases.forEach(p => equivalentTerms.add(normalizeSearch(p.en)));
        }
        if (!includeBuiltins) continue;
        const groupMatches = conceptMatches || (query && group.terms.some(term => term.includes(query)));
        const phrases = group.phrases.filter(p => favoriteMatches(p) &&
          (!query || groupMatches || [p.en, p.zh].some(text => normalizeSearch(text).includes(query))));
        if (phrases.length) groups.push({ label: group.label, phrases, rank:exactConcept || exactGroup ? 0 : 1 });
      }
    }
  }
  groups.sort((a, b) => a.rank - b.rank);

  const chineseEquivalents = [...equivalentTerms].filter(term => /\p{Script=Han}/u.test(term));
  const imported = [];
  for (const phrase of data.phrases) {
    if (!phrase?.en || !favoriteMatches(phrase)) continue;
    if (phraseFilter === 'sentences' && !isSentenceMaterial(phrase)) continue;
    if (phraseFilter === 'expressions' && isSentenceMaterial(phrase)) continue;
    if (!['all', 'sentences', 'expressions'].includes(phraseFilter) &&
        phraseFilter !== phrase.category && phraseFilter !== phrase.topic) continue;
    if (!query) {
      imported.push({ phrase, rank: 0 });
      continue;
    }
    const meanings = [phrase.en, phrase.zh, phrase.base].map(normalizeSearch);
    if (meanings.includes(query)) imported.push({ phrase, rank: 0 });
    else if (meanings.some(text => text.includes(query))) imported.push({ phrase, rank: 1 });
    else if (meanings.some(text => equivalentTerms.has(text) || chineseEquivalents.some(term => text.includes(term)))) {
      imported.push({ phrase, rank: 2 });
    }
    else if ([phrase.example, phrase.origin, phrase.topic, phrase.category].some(text => normalizeSearch(text).includes(query))) {
      imported.push({ phrase, rank: 3 });
    }
  }
  imported.sort((a, b) => a.rank - b.rank);
  return { groups, imported: imported.map(({ phrase }) => phrase) };
}

function renderPhrases() {
  return `
    <h1 class="pageTitle">替换表达</h1>
    <p class="sub">输入想表达的中文或要替换的英文，按语境挑词，直接复制到作文里。</p>
    <div class="toolbar expression-search" role="search" aria-label="查找写作表达">
      <input id="phraseSearch" class="search" type="search" aria-label="中文意思或英文表达"
        value="${esc(ui.phraseQuery)}" placeholder="例如：提高、缺乏、important" autocomplete="off" enterkeyhint="search">
      <select id="phraseFilter" class="select" aria-label="素材类型或主题">
        ${[['expressions','单词短语'],['all','全部素材'],['sentences','作文句子']].map(([value,label]) =>
          `<option value="${value}" ${ui.phraseFilter === value ? 'selected' : ''}>${label}</option>`).join('')}
        <optgroup label="我的素材">
          ${['高分句', '高级词组', '高级词汇', '科技', '图表描述', '小作文'].map(label =>
            `<option value="${label}" ${ui.phraseFilter === label ? 'selected' : ''}>${label}</option>`).join('')}
        </optgroup>
      </select>
      <button type="button" id="phraseFavorites" class="btn" aria-pressed="${ui.onlyFavorites}">只看收藏</button>
    </div>
    <div class="actions expression-suggestions" aria-label="常用查询">
      ${['提高', '减少', '促进', '重要', '导致', '解决', '占比', '缺乏', '实施', '显著'].map(query =>
        `<button type="button" class="btn soft" data-phrase-query="${query}">${query}</button>`).join('')}
    </div>
    <p class="counter expression-count" id="phraseCount" role="status"></p>
    <div id="phraseResults"></div>`;
}

function updatePhraseResults() {
  const { groups, imported } = getPhraseResults();
  const total = groups.reduce((count, group) => count + group.phrases.length, imported.length);
  const count = $('#phraseCount');
  const summary = `找到 ${total} 条表达`;
  if (count.textContent !== summary) count.textContent = summary;

  if (!total) {
    const message = ui.phraseQuery.trim() || ui.onlyFavorites
      ? '试试更短的关键词，或调整素材筛选。'
      : '可以从「提高」等常用查询开始，也可以导入自己的素材。';
    $('#phraseResults').innerHTML = `<div class="empty"><strong>暂无匹配的表达</strong><p>${message}</p>
      <button type="button" class="btn" data-phrase-import>导入素材</button></div>`;
    return;
  }

  $('#phraseResults').innerHTML = `
    ${groups.map(({ label, phrases }) => `<section class="expression-group">
      <h2 class="sectionTitle">${esc(label)}</h2><div class="phraseList">${phrases.map(phraseHTML).join('')}</div>
    </section>`).join('')}
    ${imported.length ? `<section class="expression-group">
      <h2 class="sectionTitle">我的素材</h2>
      <div class="phraseList">${imported.slice(0, ui.phraseLimit).map(phraseHTML).join('')}</div>
      ${imported.length > ui.phraseLimit ? '<button type="button" class="btn expression-more" data-phrase-more>显示更多素材</button>' : ''}
    </section>` : ''}`;
}

function attachPhraseSearch() {
  const input = $('#phraseSearch');
  let composing = false;
  function applyQuery() {
    if (ui.phraseQuery === input.value) return;
    ui.phraseQuery = input.value;
    ui.phraseLimit = PHRASE_PAGE_SIZE;
    updatePhraseResults();
  }

  // Replacing the input during composition dismisses the IME candidate list.
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => {
    composing = false;
    applyQuery();
  });
  input.addEventListener('input', event => {
    if (!composing && !event.isComposing) applyQuery();
  });
  $('#phraseFilter').onchange = event => {
    ui.phraseFilter = event.target.value;
    ui.phraseLimit = PHRASE_PAGE_SIZE;
    updatePhraseResults();
  };
  $('#phraseFavorites').onclick = event => {
    ui.onlyFavorites = !ui.onlyFavorites;
    event.currentTarget.setAttribute('aria-pressed', ui.onlyFavorites);
    ui.phraseLimit = PHRASE_PAGE_SIZE;
    updatePhraseResults();
  };
  document.querySelectorAll('[data-phrase-query]').forEach(button => {
    button.onclick = () => {
      input.value = button.dataset.phraseQuery;
      applyQuery();
    };
  });
}

function phraseHTML(phrase) {
  const isFavorite = data.favorites.includes(phrase.id);
  const practice = ui.page === 'sentences' && isSentenceMaterial(phrase);
  const last = practice && data.reviews[phrase.id]?.last;
  return `<article class="phrase${practice ? ' recall-phrase' : ''}">
    <div class="phrase-content">
      ${practice && phrase.study?.core === true ? '<span class="recall-priority">优先背</span>' : ''}
      <b lang="en">${esc(phrase.en)}</b>
      ${phrase.zh ? `<p>${esc(phrase.zh)}</p>` : ''}
      ${phrase.example ? `<p class="phrase-example" lang="en">${esc(phrase.example)}</p>` : ''}
      ${practice && phrase.study?.note ? `<p class="recall-note">${esc(phrase.study.note)}</p>` : ''}
      ${phrase.origin ? `<small>${esc(phrase.origin)}${practice && phrase.study?.adaptation ? ` · ${esc(phrase.study.adaptation)}` : ''}</small>` : ''}
    </div>
    <div class="actions phrase-actions">
      ${practice ? btn('背这句','recallOne:' + phrase.id) : '<button type="button" class="btn" data-copy-phrase>复制</button>'}
      ${phrase.id ? `<button type="button" class="fav ${isFavorite ? 'on' : ''}" data-fav="${esc(phrase.id)}"
        aria-label="收藏" aria-pressed="${isFavorite}" title="收藏">${isFavorite ? '★' : '☆'}</button>` : ''}
    </div>
    ${practice ? `<div class="recall-card-controls">
      <label class="recall-check">
        <input type="checkbox" data-recall-select="${esc(phrase.id)}" ${ui.studySelection.has(phrase.id) ? 'checked' : ''}>
        选入背诵
      </label>
      <label class="recall-level">
        熟练度
        <select class="select" data-recall-level="${esc(phrase.id)}">
          <option value="" disabled ${STUDY_LEVELS.some(level => level.id === last) ? '' : 'selected'}>未标记</option>
          ${STUDY_LEVELS.map(level => `<option value="${level.id}" ${level.id === last ? 'selected' : ''}>${level.label}</option>`).join('')}
        </select>
      </label>
    </div>` : ''}
  </article>`;
}

async function copyPhrase(english) {
  try {
    await navigator.clipboard.writeText(english.textContent);
    toast('已复制英文表达');
  } catch {
    const range = document.createRange();
    range.selectNodeContents(english);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    toast('已选中英文表达，请手动复制');
  }
}

$('#app').addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.hasAttribute('data-copy-phrase')) {
    copyPhrase(button.closest('.phrase').querySelector('b'));
  } else if (button.hasAttribute('data-fav')) {
    const id = button.dataset.fav;
    const isFavorite = data.favorites.includes(id);
    data.favorites = isFavorite ? data.favorites.filter(value => value !== id) : [...data.favorites, id];
    save();
    if (ui.page === 'favorites' || ui.onlyFavorites) draw();
    else {
      button.classList.toggle('on', !isFavorite);
      button.setAttribute('aria-pressed', !isFavorite);
      button.textContent = isFavorite ? '☆' : '★';
    }
  } else if (button.hasAttribute('data-phrase-more')) {
    const firstNewPhrase = ui.phraseLimit;
    ui.phraseLimit += PHRASE_PAGE_SIZE;
    updatePhraseResults();
    $('#phraseResults .expression-group:last-child').querySelectorAll('[data-copy-phrase]')[firstNewPhrase]?.focus();
  } else if (button.hasAttribute('data-phrase-import')) {
    $('#importFile').click();
  }
});

$('#app').addEventListener('change', event => {
  const control = event.target;
  if (control.id === 'historyDate' && ui.page === 'history') {
    if (control.value && !control.validity.valid) return;
    historyDate = control.value;
    setHistoryFilter(historyDate ? 'date' : '0');
    $('#historyDate').focus({preventScroll:true});
    return;
  }
  if (ui.page !== 'sentences') return;
  if (control.id === 'recallFormatPicker') {
    handleRecallAction('recallFormat:' + control.value);
  } else if (control.matches('[data-recall-select]')) {
    const id = control.dataset.recallSelect;
    if (control.checked) ui.studySelection.add(id);
    else ui.studySelection.delete(id);
    draw();
    const replacement = document.querySelector(`[data-recall-select="${CSS.escape(id)}"]`) ||
      $('[data-action="recallToggleSelection"]');
    replacement?.focus({preventScroll:true});
  } else if (control.matches('[data-recall-level]')) {
    const phrase = data.phrases.find(item => item?.id === control.dataset.recallLevel && isSentenceMaterial(item));
    markStudyLevel(phrase, control.value);
  }
});

function renderFavorites() {
  const list = [...data.phrases, ...builtinPhrases].filter(p => data.favorites.includes(p?.id));
  return `
    <h1 class="pageTitle">我的收藏</h1>
    <div class="toolbar">
      ${btn('查找更多表达', 'toPhrases', 'primary')}
      ${list.some(isSentenceMaterial) ? btn('背诵收藏的好句', 'studyFavorites') : ''}
    </div>
    ${list.length ? `<div class="phraseList">${list.map(phraseHTML).join('')}</div>`
      : '<div class="empty"><strong>还没有收藏</strong><p>在表达旁点击星标即可收藏。</p></div>'}`;
}
function activeStudyCards(ids = ui.studyList) {
  const byId = new Map(data.phrases.filter(isSentenceMaterial).map(phrase => [phrase.id, phrase]));
  return Array.from(ids, id => byId.get(id)).filter(Boolean);
}

function markStudyLevel(phrase, id) {
  const level = STUDY_LEVELS.find(item => item.id === id);
  if (!phrase || !level) return false;
  recordReview(phrase.id, id);
  toast(`已标记为${level.label}`);
  return true;
}

function renderStudySummary(cards) {
  const remaining = cards.filter(phrase => ui.studyResults.get(phrase.id) !== 'known').length;
  return `<h1 class="pageTitle" id="study-summary" tabindex="-1">本轮完成</h1>
    <p class="sub">${esc(ui.studyTitle)} · 已练 ${cards.length} 句</p>
    <div class="panel recall-panel">
      <dl class="challenge-counts">
        ${STUDY_LEVELS.map(level => `<div><dt>${level.label}</dt><dd>${cards.filter(phrase => ui.studyResults.get(phrase.id) === level.id).length}</dd></div>`).join('')}
      </dl>
      <div class="actions">
        ${remaining ? btn(`重练未熟的 ${remaining} 句`, 'retryStudy', 'primary') : ''}
        ${btn(ui.studyReturn === 'home' ? '返回首页' : `返回${NAMES[ui.studyReturn]}`, 'endStudy')}
        ${btn('查看背诵记录', 'historyToday', 'ghost')}
      </div>
    </div>`;
}

function renderStudy() {
  const cards = activeStudyCards();
  const exit = btn('← 退出背诵', 'endStudy', 'ghost');
  if (!cards.length) return exit + '<p class="sub">这组暂时没有可背的句子。</p>';
  if (cards.every(phrase => ui.studyResults.has(phrase.id))) return renderStudySummary(cards);
  ui.studyIndex = Math.min(ui.studyIndex, cards.length - 1);
  const phrase = cards[ui.studyIndex];
  const last = STUDY_LEVELS.find(level => level.id === data.reviews[phrase.id]?.last);
  return `<div class="recall-session">${exit}
    <h1 class="pageTitle" tabindex="-1">${esc(ui.studyTitle)}</h1>
    <div class="panel recall-panel">
      <div class="panelTitle"><span class="secondary">${esc(phrase.origin)}</span><span class="counter">${ui.studyIndex + 1} / ${cards.length}</span></div>
      <progress class="recall-progress" aria-label="本轮标记进度" value="${ui.studyResults.size}" max="${cards.length}"></progress>
      <div class="studyCard">
        <div class="muted">${esc(phrase.study?.use || '中译英')}</div>
        <div class="question" tabindex="-1">${esc(phrase.zh || '这句暂时没有中文提示。')}</div>
        ${ui.reveal ? `<div class="answer" lang="en" tabindex="-1">${esc(phrase.en)}</div>${phrase.study?.note ? `<p class="recall-note">${esc(phrase.study.note)}</p>` : ''}` : btn('查看英文答案','reveal','primary')}
      </div>
      ${ui.reveal ? `<div class="actions recall-grade" role="group" aria-label="标记当前句的熟练度">
        ${STUDY_LEVELS.map(level => `<button type="button" class="btn" data-action="mark:${level.id}"
          aria-pressed="${level.id === last?.id}">${level.label}</button>`).join('')}
      </div>` : ''}
      <details class="recall-typing" ${ui.typed ? 'open' : ''}>
        <summary>试着默写（可选）</summary>
        <div class="field"><textarea id="typing" aria-label="试着默写（可选）">${esc(ui.typed)}</textarea></div>
      </details>
      <div class="actions recall-navigation">${btn('← 上一句','prev')}${btn('下一句 →','next')}</div>
      ${last ? `<p class="secondary recall-last">上次标记为${last.label}</p>` : ''}
    </div></div>`;
}
function renderSettings(){return `${layoutHeader('账号与同步','只需要邮箱登录；网站自动连接云端，背诵记录自动保存。')}<div class="settingsGrid"><div class="panel"><div class="panelTitle"><h2>邮箱登录与自动同步</h2></div><p class="sub">${user?'已登录：'+esc(user.email||'当前账号'):'使用同一邮箱登录 iPad、iPhone 和 Mac，作文和背诵进度自动同步。'}</p><div class="notice" id="cloudSyncNotice" role="status">${esc(cloudNotice())}</div>${!user?`<div class="field"><label>邮箱（接收登录链接）</label><input id="supEmail" type="email" placeholder="your@email.com" autocomplete="email"/></div><div class="actions">${btn('发送邮箱登录链接','sendMagic','primary')}${btn('重新连接','connectCloud')}</div>`:`<div class="actions">${btn('立即同步','uploadCloud','primary')}${btn('从云端重新载入','downloadCloud')}${btn('退出登录','signOut')}</div>`}<p class="secondary">修改作文或标记背诵结果后会自动上传。不要同时在多台设备离线编辑同一份内容。</p></div><div class="panel"><div class="panelTitle"><h2>个人资料与备份</h2></div><p class="sub">即使云端正常，建议偶尔导出备份。</p><div class="actions">${btn('导入私人学习资料','import','soft')}${btn('导出完整备份','export')}</div><div class="notice warn">请勿把私人作文或 JSON 备份上传到公开 GitHub 仓库。</div></div></div>`}

function attach(){document.querySelectorAll('[data-page]').forEach(e=>e.onclick=()=>{ui.essay=null;showPage(e.dataset.page)});document.querySelectorAll('[data-action]').forEach(e=>e.onclick=()=>act(e.dataset.action));document.querySelectorAll('[data-essay]').forEach(e=>e.onclick=()=>{ui.essay=e.dataset.essay;ui.variant='final';ui.shown={};ui.readMode='en';showPage('essays')});document.querySelectorAll('[data-variant]').forEach(e=>e.onclick=()=>{ui.variant=e.dataset.variant;ui.shown={};draw()});document.querySelectorAll('[data-readmode]').forEach(e=>e.onclick=()=>{ui.readMode=e.dataset.readmode;draw()});document.querySelectorAll('[data-essayfilter]').forEach(e=>e.onclick=()=>{ui.essayFilter=e.dataset.essayfilter;draw()});let typing=$('#typing');if(typing)typing.oninput=e=>ui.typed=e.target.value;const challengeTyping=$('#challenge-typing');if(challengeTyping)challengeTyping.oninput=e=>ui.challenge.typed=e.target.value}
function startStudy(ids, {title='好句背诵', returnPage='phrases'} = {}) {
  if (!ids.length) return toast('请先选择至少一句');
  ui.studyList = ids;
  ui.studyResults.clear();
  ui.studyIndex = 0;
  ui.studyTitle = title;
  ui.studyReturn = returnPage;
  ui.reveal = false;
  ui.typed = '';
  showPage('study');
  $('#app h1')?.focus({preventScroll:true});
}

function moveStudy(step) {
  const count = activeStudyCards().length;
  if (!count) return showPage(ui.studyReturn);
  ui.studyIndex = (ui.studyIndex + step + count) % count;
  ui.reveal = false;
  ui.typed = '';
  draw();
  scrollTo(0, 0);
  $('.recall-panel .question')?.focus({preventScroll:true});
}

function gradeStudy(level) {
  const cards = activeStudyCards();
  const phrase = cards[ui.studyIndex];
  if (!markStudyLevel(phrase, level)) return;
  ui.studyResults.set(phrase.id, level);

  const ungraded = item => !ui.studyResults.has(item.id);
  const later = cards.findIndex((item, index) => index > ui.studyIndex && ungraded(item));
  const next = later === -1 ? cards.findIndex(ungraded) : later;
  if (next !== -1) ui.studyIndex = next;
  ui.reveal = false;
  ui.typed = '';
  draw();
  scrollTo(0, 0);
  $(next === -1 ? '#study-summary' : '.recall-panel .question')?.focus({preventScroll:true});
}

function retryStudy() {
  const pending = activeStudyCards().filter(phrase => ui.studyResults.has(phrase.id) && ui.studyResults.get(phrase.id) !== 'known');
  startStudy(pending.map(phrase => phrase.id), {title:'重练未熟句', returnPage:ui.studyReturn});
}

function clearStudySelection() {
  ui.studySelection.clear();
  ui.showStudySelection = false;
}

function handleRecallAction(action) {
  const [command, ...parts] = action.split(':');
  const value = parts.join(':');
  if (command === 'recallToggleSelection' || command === 'recallClearSelection') {
    if (command === 'recallClearSelection') clearStudySelection();
    else {
      ui.showStudySelection = !ui.showStudySelection;
      scrollTo(0, 0);
    }
    draw();
    const nextControl = $('[data-action="recallToggleSelection"]:not(:disabled)') || $('[data-action="recallSelectAll"]');
    nextControl?.focus({preventScroll:true});
    return;
  }
  if (command === 'recallStudySelection') {
    const selected = activeStudyCards(ui.studySelection);
    return startStudy(selected.map(phrase => phrase.id), {title:'背诵已选句子', returnPage:'sentences'});
  }
  if (command === 'recallKind' || command === 'recallFormat' || command === 'recallSection') {
    if (command === 'recallKind') {
      ui.sentenceKind = value;
      ui.sentenceSection = 'opening';
    }
    if (command === 'recallFormat') ui.sentenceFormat = value;
    if (command === 'recallSection') ui.sentenceSection = value;
    draw();
    const filter = command === 'recallFormat' ? $('#recallFormatPicker') : $(`[data-action="${CSS.escape(action)}"]`);
    filter?.focus({preventScroll:true});
    return;
  }
  const bank = getSentenceBank();
  if (command === 'recallSelectAll') {
    bank.cards.forEach(phrase => ui.studySelection.add(phrase.id));
    draw();
    $('[data-action="recallSelectAll"]')?.focus({preventScroll:true});
    return;
  }
  if (command === 'recallPriority') return startCategoryStudy(bank.cards.filter(p => p.study?.core === true), bank, '重点');
  if (command === 'recallUse') return startCategoryStudy(bank.groups.get(value) || [], bank, value);
  if (command === 'recallOne') {
    if (ui.showStudySelection) {
      const selected = activeStudyCards(ui.studySelection).filter(phrase => phrase.id === value);
      return startStudy(selected.map(phrase => phrase.id), {title:'背诵已选句子', returnPage:'sentences'});
    }
    return startCategoryStudy(bank.cards.filter(p => p.id === value), bank);
  }
  if (command === 'recallAll') startCategoryStudy(bank.cards, bank);
}
function act(action){if(action.startsWith('recall'))return handleRecallAction(action);if(action.startsWith('togglePara:')){let i=+action.split(':')[1];ui.shown[i]=!ui.shown[i];draw();return}if(action.startsWith('mark:'))return gradeStudy(action.slice(5));if(action.startsWith('historyFilter:')){
  setHistoryFilter(action.slice('historyFilter:'.length));
  $(`[data-action="${CSS.escape(action)}"]`)?.focus({preventScroll:true});
  return;
}switch(action){
 case 'historyToday': historyFilter='0'; historyLimit=HISTORY_PAGE_SIZE; showPage('history'); break;
 case 'historyMore': historyLimit+=HISTORY_PAGE_SIZE; draw(); break;
 case 'recordEssay': recordEssayPractice(); break;
 case 'randomChallenge': startChallenge(); break;
 case 'endChallenge': ui.essay=null; showPage('home'); break;
 case 'revealChallenge': if(!ui.challenge)break; ui.challenge.revealed=true; draw(); $('#challenge-answer')?.focus({preventScroll:true}); break;
 case 'gradeChallenge:known': gradeChallenge('known'); break;
 case 'gradeChallenge:again': gradeChallenge('again'); break;
 case 'retryChallenge': retryChallenge(); break;
 case 'dailyStudy': startDailyStudy(); break;
 case 'retryStudy': retryStudy(); break;
 case 'sentenceMode': showPage('sentences'); break;
 case 'studyFavorites': startStudy(data.phrases.filter(p => isSentenceMaterial(p) && data.favorites.includes(p.id)).map(p => p.id)); break;
 case 'import':$('#importFile').click();break;case 'export':downloadJSON(data,'essaybook-backup-'+new Date().toISOString().slice(0,10)+'.json');break;case 'chooseEssay':ui.essay=null;showPage('essays');break;case 'chatgpt':window.open('https://chatgpt.com','_blank','noopener');break;case 'backEssays':ui.essay=null;showPage('essays');break;case 'toPhrases':showPage('phrases');break;case 'compare':ui.comparison=!ui.comparison;draw();break;case 'showAll':paras(data.essays.find(x=>x.id===ui.essay)?.[ui.variant]).forEach((_,i)=>ui.shown[i]=true);draw();break;case 'hideAll':ui.shown={};ui.readMode='cn';draw();break;case 'reveal':ui.reveal=true;draw();$('.recall-panel .answer')?.focus({preventScroll:true});break;case 'prev':moveStudy(-1);break;case 'next':moveStudy(1);break;case 'endStudy':showPage(ui.studyReturn);break;case 'addEssay':editEssay(null);break;case 'editEssay':editEssay(data.essays.find(e=>e.id===ui.essay));break;case 'extractSentences':extractSentences();break;case 'connectCloud':initCloud();break;case 'sendMagic':sendMagic();break;case 'signOut':signOut();break;case 'uploadCloud':cloudSave(true);break;case 'downloadCloud':cloudLoad(true);break}}
function recordReview(id, last) {
  const old = Object.hasOwn(data.reviews, id) ? data.reviews[id] : { known: 0, again: 0 };
  const at = new Date().toISOString();
  data.practiceLog = datedPractice(data);
  addPractice(id, at, last);
  data.reviews = {...data.reviews, [id]:{...old, [last]:reviewCount(old?.[last]) + 1, last, at}};
  save();
}

const CHALLENGE_LIMIT = 10;

function startChallenge() {
  if (initialCloudPending || (user && !synced)) {
    toast('正在检查云端资料，请稍后再试');
    return;
  }

  const candidates = new Map();
  for (const phrase of data.phrases) {
    if (isSentenceMaterial(phrase)) {
      candidates.set(phrase.id, phrase);
    }
  }
  const phrases = [...candidates.values()];
  if (!phrases.length) {
    ui.challenge = null;
    showPage('challenge');
    $('#challenge-title').focus({ preventScroll: true });
    return;
  }

  // Sample without replacement, leaving the library order intact.
  const size = Math.min(CHALLENGE_LIMIT, phrases.length);
  for (let i = 0; i < size; i++) {
    const j = i + Math.floor(Math.random() * (phrases.length - i));
    [phrases[i], phrases[j]] = [phrases[j], phrases[i]];
  }
  beginChallenge(phrases.slice(0, size));
}

function beginChallenge(phrases) {
  ui.challenge = { phrases, index: 0, retry: [], typed: '', revealed: false };
  showPage('challenge');
  $('#challenge-question')?.focus({ preventScroll: true });
}

function clearChallenge() {
  if (ui.page === 'challenge') ui.page = 'home';
  ui.challenge = null;
}

function currentChallengePhrase(phrase) {
  return data.phrases.find(item => item?.id === phrase.id && item.en === phrase.en && item.zh === phrase.zh);
}

function challengePrompt(phrase) {
  const gloss = typeof phrase.zh === 'string' ? phrase.zh.trim() : '';
  const hint = gloss.replace(/^[（(\s]+|[）)\s]+$/g, '');
  if (hint && !['请补充中文提示', '待补充', '暂无', '无', '—', '-', 'N/A'].includes(hint) && /\p{Script=Han}/u.test(hint)) {
    return { type: '根据中文默写英文', text: gloss };
  }

  const english = phrase.en.trim();
  const words = [...english.matchAll(/[a-z]+(?:['’-][a-z]+)*/gi)];
  const word = words.reduce((longest, match) => !longest || match[0].length > longest[0].length ? match : longest, null);
  if (!word) return { type: '看词首提示，回忆英文', text: `${english.slice(0, 1)}…` };

  const [answer] = word;
  const blank = words.length === 1 && answer.length > 1 ? `${answer[0]}____` : '____';
  return { type: '补全英文空缺', text: english.slice(0, word.index) + blank + english.slice(word.index + answer.length) };
}

function renderChallenge() {
  const round = ui.challenge;
  const heading = `${btn('← 返回背诵首页', 'endChallenge', 'ghost')}<h1 class="pageTitle challenge-title" id="challenge-title" tabindex="-1">随机默写</h1>`;
  if (!round) {
    return `${heading}<div class="panel challenge-panel"><p class="sub">素材库暂时没有可以默写的作文句子。</p>${btn('打开素材库', 'toPhrases', 'primary')}</div>`;
  }

  const total = round.phrases.length;
  if (round.index === total) {
    const retry = round.retry.length;
    return `${heading}<section class="panel challenge-panel">
      <h2 class="sectionTitle" id="challenge-summary" tabindex="-1">本轮完成</h2>
      <dl class="challenge-counts">
        <div><dt>本轮题目</dt><dd>${total}</dd></div>
        <div><dt>已掌握</dt><dd>${total - retry}</dd></div>
        <div><dt>需要复习</dt><dd>${retry}</dd></div>
      </dl>
      <div class="actions">${retry ? btn('重练本轮不熟的表达', 'retryChallenge', 'primary') : ''}${btn('再随机抽一轮', 'randomChallenge', retry ? '' : 'primary')}</div>
    </section>`;
  }

  const phrase = currentChallengePhrase(round.phrases[round.index]);
  if (!phrase) {
    return `${heading}<div class="panel challenge-panel"><p class="sub">当前素材已更新，请重新抽题。</p>${btn('重新抽题', 'randomChallenge', 'primary')}</div>`;
  }

  const prompt = challengePrompt(phrase);
  return `${heading}<section class="panel challenge-panel" aria-labelledby="challenge-title">
    <div class="panelTitle"><span class="challenge-meta">${prompt.type}</span><span class="challenge-meta">第 ${round.index + 1} 题 / 共 ${total} 题</span></div>
    <p class="challenge-question" id="challenge-question" tabindex="-1">${esc(prompt.text)}</p>
    <div class="field">
      <label for="challenge-typing">你的英文答案</label>
      <textarea id="challenge-typing" lang="en" autocapitalize="none" autocomplete="off" spellcheck="false" ${round.revealed ? 'readonly' : ''}>${esc(round.typed)}</textarea>
    </div>
    ${round.revealed ? `<div class="challenge-answer">
      <h2 class="sectionTitle" id="challenge-answer" tabindex="-1">原英文答案</h2>
      <p lang="en">${esc(phrase.en)}</p>
    </div><div class="actions">${btn('还不熟', 'gradeChallenge:again')}${btn('记住了', 'gradeChallenge:known', 'primary')}</div>` : btn('查看英文答案', 'revealChallenge', 'primary')}
  </section>`;
}

function gradeChallenge(last) {
  const round = ui.challenge;
  if (!round?.revealed) return;
  const phrase = currentChallengePhrase(round.phrases[round.index]);
  if (!phrase) return draw();

  recordReview(phrase.id, last);
  if (last === 'again') round.retry.push(phrase);
  round.index++;
  round.typed = '';
  round.revealed = false;
  draw();
  ($('#challenge-question') || $('#challenge-summary') || $('#challenge-title')).focus({ preventScroll: true });
}

function retryChallenge() {
  if (!ui.challenge) return;
  const phrases = ui.challenge.retry.map(currentChallengePhrase).filter(Boolean);
  if (phrases.length) beginChallenge(phrases);
  else toast('本轮需要复习的素材已更新，请重新抽题');
}

function downloadJSON(obj,name){let blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
function dialog(title,body){$('#dialogHost').innerHTML=`<div class="dialogShade"><div class="dialog"><h2>${title}</h2>${body}<div class="actions">${btn('关闭','closeDialog')}</div></div></div>`;document.querySelector('#dialogHost [data-action="closeDialog"]').onclick=()=>$('#dialogHost').innerHTML=''}
function editEssay(e){let v=ui.variant||'final';dialog(e?'修改作文版本':'新增作文',`<div class="field"><label>标题</label><input id="editTitle" value="${esc(e?.title||'')}" /></div><div class="field"><label>年份</label><input id="editYear" value="${esc(e?.year||'')}" placeholder="2026" /></div><div class="field"><label>作文类型</label><select class="select" id="editKind"><option ${e?.kind==='大作文'?'selected':''}>大作文</option><option ${e?.kind==='小作文'?'selected':''}>小作文</option></select></div><div class="field"><label>${e?`编辑 ${v}（原稿不受其他版本修改影响）`:'作文原稿'}</label><textarea id="editBody" style="min-height:250px">${esc(e?.[v]||'')}</textarea></div><button class="btn primary" id="saveEssay">保存为当前版本</button>`);$('#saveEssay').onclick=()=>{let t=$('#editTitle').value.trim(),body=$('#editBody').value.trim();if(!t||!body)return toast('标题和正文不能为空');if(e){e[v]=body;e.title=t;e.year=$('#editYear').value.trim();e.kind=$('#editKind').value}else{let id='essay-user-'+Date.now();data.essays.push({id,title:t,year:$('#editYear').value.trim(),kind:$('#editKind').value,topic:'自选',original:body,revised:'',final:body,finalReviewed:false,note:'个人新增作文'})}save();$('#dialogHost').innerHTML='';toast('已保存');draw()}}
function extractSentences(){const e=data.essays.find(x=>x.id===ui.essay);if(!e)return;let sentences=(e[ui.variant]||'').split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>22).slice(0,35);dialog('提取句子到背诵库',`<p class="sub">选择想加入背诵库的句子。中文提示可以稍后自行填写。</p><div style="max-height:330px;overflow:auto">${sentences.map((s,i)=>`<label style="display:block;font-size:13px;line-height:1.8;padding:7px;border-bottom:1px solid #eee"><input type="checkbox" class="sentenceCheck" value="${i}"/> ${esc(s)}</label>`).join('')}</div><button class="btn primary" id="addSentences">加入所选句子</button>`);$('#addSentences').onclick=()=>{let ids=[...document.querySelectorAll('.sentenceCheck:checked')].map(e=>+e.value);for(let i of ids)data.phrases.unshift({id:'custom-'+Date.now()+'-'+i,en:sentences[i],zh:'（请补充中文提示）',example:'',category:'高分句',topic:e.topic,origin:e.year+' '+e.title,status:'待审核'});save();$('#dialogHost').innerHTML='';toast(`添加了 ${ids.length} 句`);draw()}}
$('#importFile').onchange=async e=>{let file=e.target.files[0];if(!file)return;try{let imported=JSON.parse(await file.text());if(!Array.isArray(imported.essays)||!Array.isArray(imported.phrases))throw Error('不是有效的EssayBook数据文件');if(data.essays.length&&!confirm('导入将合并已有内容（同ID的文章使用导入版本），继续吗？'))return;data.essays=[...data.essays.filter(x=>!imported.essays.some(y=>y.id===x.id)),...imported.essays];data.phrases=[...data.phrases.filter(x=>!imported.phrases.some(y=>y.id===x.id)),...imported.phrases];data.favorites=uniq([...(data.favorites||[]),...(imported.favorites||[])]);Object.assign(data, mergePractice(data, imported));save();toast(`成功导入 ${imported.essays.length} 篇作文、${imported.phrases.length} 条素材`);draw()}catch(err){toast('导入失败：'+err.message)}finally{e.target.value=''}};
$('#openSettings').onclick=()=>showPage('settings');
async function getCloudUser() {
  const { data: result, error } = await db.auth.getUser();
  if (error?.code === 'bad_jwt' && /token (?:is )?expired/i.test(error.message)) {
    // The server can reject a token before the browser decides it needs renewing.
    const refreshed = await db.auth.refreshSession();
    if (refreshed.error?.name === 'AuthSessionMissingError' ||
        ['refresh_token_not_found', 'refresh_token_already_used', 'session_not_found', 'session_expired'].includes(refreshed.error?.code)) {
      throw new Error('登录会话已过期，请用原邮箱重新登录。');
    }
    if (refreshed.error) throw refreshed.error;
    return refreshed.data?.user ?? null;
  }
  if (error && error.name !== 'AuthSessionMissingError' && !error.message.includes('Auth session missing')) {
    throw error;
  }
  return result?.user ?? null;
}

async function initCloud(){
 if(!config.url||!config.key){toast('尚未配置公开连接密钥');return}
 if(!window.supabase){toast('云端SDK未加载，请检查网络并刷新');return}
 try{
  if(!db)db=window.supabase.createClient(config.url,config.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  user=await getCloudUser();
  if(user)await cloudLoad(false);
  db.auth.onAuthStateChange((event,session)=>{
   if(event==='SIGNED_IN'&&session?.user){
    const accountChanged=user?.id!==session.user.id;
    const challengeOpen=ui.page==='challenge';
    user=session.user;
    if(accountChanged){clearChallenge();clearStudySelection();synced=false;cloudError='';if(challengeOpen)draw()}
    setTimeout(()=>cloudLoad(false),0)
   }
   if(event==='SIGNED_OUT'){clearChallenge();clearStudySelection();user=null;synced=false;cloudError='';draw()}
  });
  draw();
 }catch(e){reportCloudError('连接失败',e)}
}
async function sendMagic(){
 const email=$('#supEmail')?.value.trim();if(!email)return toast('请输入登录邮箱');
 if(!db){await initCloud();if(!db)return}
 try{
  const {error}=await db.auth.signInWithOtp({email,options:{emailRedirectTo:'https://yuiyuh.github.io/essaybook/'}});
  if(error)throw error;
  cloudError='';
  refreshCloudStatus();
  toast('已发送登录邮件，请检查收件箱');
 }catch(e){
  if(e.code==='over_email_send_rate_limit'){
   reportCloudError('登录邮件发送受限', new Error('发送次数已达上限，请稍后再试。'));
  }else reportCloudError('发送失败',e);
 }
}
function cachedOwner() {
  try { return localStorage.getItem(LOCAL_OWNER); } catch { return null; }
}

function cacheOwner(owner) {
  try { localStorage.setItem(LOCAL_OWNER, owner); } catch { /* The snapshot can still be used locally. */ }
}

function cloudRow(owner) {
  return db.from('essaybook_data').select('payload,updated_at').eq('owner', owner).maybeSingle();
}

let cloudWrites = Promise.resolve();
function cloudSave(explicit = false) {
  if (!db || !user) {
    if (explicit) toast('请先邮箱登录');
    return;
  }
  const owner = user.id;
  cloudWrites = cloudWrites.then(() => writeCloudSnapshot(owner, explicit));
  return cloudWrites;
}

async function writeCloudSnapshot(owner, explicit) {
  try {
    if (user?.id !== owner) return;
    const previousOwner = cachedOwner();
    if (previousOwner && previousOwner !== owner) throw new Error('请先加载当前账号的云端资料');
    for (let attempt = 0; attempt < 3; attempt++) {
      const {data:remote, error:readError} = await cloudRow(owner);
      if (user?.id !== owner) return;
      if (readError) throw readError;
      const revision = localRevision;
      const snapshot = {...data};
      if (remote?.payload && (snapshot.practiceLog || remote.payload.practiceLog)) {
        Object.assign(snapshot, mergePractice(remote.payload, snapshot));
      }
      const previousStamp = Date.parse(remote?.updated_at);
      const stamp = new Date(Math.max(Date.now(), Number.isFinite(previousStamp) ? previousStamp + 1 : 0)).toISOString();
      const table = db.from('essaybook_data');
      let write;
      if (remote) {
        // A second device may have saved after the read. Only replace the version we merged.
        const update = table.update({payload:snapshot, updated_at:stamp}).eq('owner', owner);
        write = remote.updated_at ? update.eq('updated_at', remote.updated_at) : update.is('updated_at', null);
      } else {
        write = table.upsert({owner, payload:snapshot, updated_at:stamp}, {onConflict:'owner', ignoreDuplicates:true});
      }
      const {data:saved, error:writeError} = await write.select('updated_at').maybeSingle();
      if (user?.id !== owner) return;
      if (writeError) throw writeError;
      if (!saved) continue;
      if (revision !== localRevision) return;
      const changed = !sameSnapshot(snapshot, data);
      if (changed) {
        saveLocal(snapshot);
        data = snapshot;
      }
      cacheOwner(owner);
      localDirty = false;
      synced = true;
      cloudError = '';
      if (changed && ui.page === 'history') draw();
      else refreshCloudStatus();
      if (explicit) toast('✓ 云端同步成功');
      return;
    }
    throw new Error('另一台设备正在同步，请稍后重试');
  } catch (error) {
    if (user?.id === owner) reportCloudError('云端保存失败', error);
  }
}
async function cloudLoad(explicit=false){
 if(!db||!user)return;
 const owner = user.id;
 try{
  const {data:r,error}=await cloudRow(owner);
  if(user?.id!==owner)return;
  if(error)throw error;
  if(r?.payload&&Array.isArray(r.payload.essays)){
   const previousOwner = cachedOwner();
   if(localDirty&&!explicit&&(!previousOwner||previousOwner===owner)){
    if(previousOwner===owner)await cloudSave();
    else toast('本地有未同步修改，暂不覆盖');
    return;
   }
   const incoming = {...blank(),...r.payload};
   let uploadPractice = false;
   if (previousOwner === owner && data.practiceLog && !sameSnapshot(incoming.practiceLog, data.practiceLog)) {
    const merged = mergePractice(incoming, data);
    uploadPractice = !sameSnapshot(incoming.practiceLog, merged.practiceLog);
    Object.assign(incoming, merged);
   }
   if (!sameSnapshot(data, incoming)) {
    const onlyPracticeChanged = previousOwner === owner &&
      (data.practiceLog || sameSnapshot(data.reviews, incoming.reviews)) &&
      sameSnapshot({...data, reviews:null, practiceLog:null}, {...incoming, reviews:null, practiceLog:null});
    if (!onlyPracticeChanged && !sameSnapshot(data, blank())) saveRecoveryCopy(data);
    saveLocal(incoming);
    data = incoming;
   }
   cacheOwner(owner);
   localRevision++;
   localDirty=uploadPractice;synced=true;cloudError='';draw();
   if(uploadPractice)await cloudSave();
   if(explicit)toast('✓ 已加载云端资料');
  }else if(data.essays.length || data.practiceLog){await cloudSave(true)}
  else{synced=true;cloudError='';draw()}
 }catch(e){if(user?.id===owner)reportCloudError('同步失败',e)}
}
async function signOut(){if(db)await db.auth.signOut();clearChallenge();clearStudySelection();user=null;synced=false;cloudError='';draw()}
if(initialCloudPending)window.addEventListener('load',async()=>{
 try{await initCloud()}finally{initialCloudPending=false}
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&db&&user)cloudLoad(false)});
window.addEventListener('online',()=>{if(db&&user&&localDirty)cloudSave()});
draw();
