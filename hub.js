'use strict';

const settingsKey = 'studyhub-mini-settings-v1';
const goalsKey = date => `studyhub-mini-goals-v1:${date}`;
const byId = id => document.getElementById(id);
const theme = byId('theme');
const examDate = byId('exam-date');
const wrongbookLink = byId('wrongbook-link');
const wrongbookSettings = byId('wrongbook-settings');
const wrongbookUrl = byId('wrongbook-url');
const wrongbookError = byId('wrongbook-error');
const goalInput = byId('goal');
const goalsList = byId('goals-list');
const fullDate = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'full' });
const monthDay = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'long', timeZone: 'UTC' });

function readLocal(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    const status = byId('storage-status');
    status.textContent = '浏览器无法保存本地数据，本次修改只在当前页面有效。';
    status.hidden = false;
  }
}

function localDate(date) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function utcDate(key) {
  if (typeof key !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const date = new Date(`${key}T00:00:00Z`);
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === key ? date : null;
}

function renderCountdown() {
  const exam = utcDate(settings.examDate);
  const remaining = exam ? (exam - utcDate(today)) / 86400000 : null;
  byId('days').textContent = remaining === null ? '—' : Math.max(0, remaining);
  byId('exam-label').textContent = remaining === null ? '设置考试日期后开始倒计时'
    : remaining < 0 ? `${monthDay.format(exam)} · 考试日期已过`
    : remaining === 0 ? '考试日就是今天' : `考试日期 ${monthDay.format(exam)}`;
}

function parseWrongbookUrl(value) {
  try {
    const url = new URL(value);
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch {
    return null;
  }
  return null;
}

function renderWrongbook() {
  const url = parseWrongbookUrl(settings.wrongbookUrl);
  wrongbookLink.hidden = !url;
  if (url) wrongbookLink.href = url;
  else wrongbookLink.removeAttribute('href');
  wrongbookUrl.value = url || '';
  byId('wrongbook-setting-label').textContent = url ? '更改网址' : '设置网址';
}

function applyTheme() {
  if (settings.theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = settings.theme;
  theme.value = settings.theme;
}

function renderGoalCount() {
  const done = goals.filter(goal => goal.done).length;
  byId('goals-progress').textContent = goals.length ? `已完成 ${done} / ${goals.length}` : '';
}

function renderGoals() {
  goalsList.replaceChildren();
  goalsList.hidden = !goals.length;
  byId('goals-empty').hidden = !!goals.length;

  goals.forEach((goal, index) => {
    const row = document.createElement('li');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    const text = document.createElement('span');
    const remove = document.createElement('button');
    checkbox.type = 'checkbox';
    checkbox.checked = goal.done;
    checkbox.addEventListener('change', () => {
      goal.done = checkbox.checked;
      writeLocal(goalsKey(today), goals);
      renderGoalCount();
    });
    text.textContent = goal.text;
    label.append(checkbox, text);
    remove.type = 'button';
    remove.className = 'control goal-remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `删除目标：${goal.text}`);
    remove.addEventListener('click', () => {
      goals.splice(index, 1);
      writeLocal(goalsKey(today), goals);
      renderGoals();
      const nextRow = goalsList.children[Math.min(index, goals.length - 1)];
      (nextRow?.querySelector('button') || goalInput).focus();
    });
    row.append(label, remove);
    goalsList.append(row);
  });
  renderGoalCount();
}

function updateDay() {
  const now = new Date();
  const date = localDate(now);
  if (date === today) return;
  today = date;
  const time = byId('today');
  time.dateTime = today;
  time.textContent = fullDate.format(now);
  const savedGoals = readLocal(goalsKey(today), []);
  goals = Array.isArray(savedGoals) ? savedGoals : [];
  renderCountdown();
  renderGoals();
}

const settings = { ...readLocal(settingsKey, {}) };
if (!['system', 'light', 'dark'].includes(settings.theme)) settings.theme = 'system';
let today;
let goals;
applyTheme();
examDate.value = utcDate(settings.examDate) ? settings.examDate : '';
renderWrongbook();
updateDay();

theme.addEventListener('change', () => {
  settings.theme = theme.value;
  applyTheme();
  writeLocal(settingsKey, settings);
});

byId('exam-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!utcDate(examDate.value)) return;
  settings.examDate = examDate.value;
  writeLocal(settingsKey, settings);
  updateDay();
  renderCountdown();
});

wrongbookUrl.addEventListener('input', () => {
  wrongbookError.hidden = true;
  wrongbookUrl.removeAttribute('aria-invalid');
});

byId('wrongbook-form').addEventListener('submit', event => {
  event.preventDefault();
  const value = wrongbookUrl.value.trim();
  const url = value ? parseWrongbookUrl(value) : '';
  if (url === null) {
    wrongbookError.textContent = '请输入不含登录凭据的 http:// 或 https:// 网址。';
    wrongbookError.hidden = false;
    wrongbookUrl.setAttribute('aria-invalid', 'true');
    wrongbookUrl.focus();
    return;
  }
  settings.wrongbookUrl = url;
  writeLocal(settingsKey, settings);
  renderWrongbook();
  wrongbookSettings.open = false;
  (url ? wrongbookLink : byId('wrongbook-setting-label')).focus();
});

byId('goal-form').addEventListener('submit', event => {
  event.preventDefault();
  const text = goalInput.value.trim();
  if (!text) return;
  updateDay();
  goals.push({ text, done: false });
  writeLocal(goalsKey(today), goals);
  renderGoals();
  goalInput.value = '';
  goalInput.focus();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) updateDay();
});
setInterval(updateDay, 30000);
