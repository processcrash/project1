const fs = require('fs');
const path = require('path');

const TODO_PATH = path.join(process.cwd(), 'TODO.md');
const REQUIREMENTS_PATH = path.join(process.cwd(), 'REQUIREMENTS.md');

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf-8');
}

function parseTodoItems(content) {
  const items = [];
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.match(/^- \[x\] /)) items.push({ text: line.replace(/^- \[x\] /, ''), done: true });
    else if (line.match(/^- \[ \] /)) items.push({ text: line.replace(/^- \[ \] /, ''), done: false });
  }
  return items;
}

function parseRequirements(content) {
  const items = [];
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('#### ')) items.push({ text: line.replace(/^#### /, '') });
  }
  return items;
}

console.log('[Hook] 检查任务状态...');

const todoContent = readFile(TODO_PATH);
const requirementsContent = readFile(REQUIREMENTS_PATH);

if (!todoContent) {
  console.log('[Hook] TODO.md 不存在');
  process.exit(0);
}

const todoItems = parseTodoItems(todoContent);
const unfinished = todoItems.find(item => !item.done);

if (unfinished) {
  console.log(`[Hook] 发现未完成任务: ${unfinished.text}`);
  console.log('[Hook] 请手动完成此任务');
} else {
  console.log('[Hook] TODO.md 中没有未完成的任务');
  
  const reqs = parseRequirements(requirementsContent);
  const firstReq = reqs[0];
  if (firstReq) {
    console.log(`[Hook] 发现未实现需求: ${firstReq.text}`);
    console.log('[Hook] 建议任务:');
    console.log(`  - [ ] 分析 ${firstReq.text}`);
    console.log(`  - [ ] 实现 ${firstReq.text}`);
    console.log(`  - [ ] 测试 ${firstReq.text}`);
  }
}