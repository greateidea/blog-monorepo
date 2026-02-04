#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 从命令行参数获取目标版本号，例如 “2024.18.5+abc1234” 或 “1.2.0”
const targetVersion = process.argv[2];
if (!targetVersion) {
  console.error('错误：请提供要提取的版本号（如 2024.18.5+abc1234）');
  process.exit(1);
}

// 读取 CHANGELOG.md 文件
const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
let changelogContent;
try {
  changelogContent = fs.readFileSync(changelogPath, 'utf8');
} catch (err) {
  console.error(`错误：无法读取文件 ${changelogPath}`);
  process.exit(1);
}

// 核心：使用正则表达式匹配特定版本的章节
// 假设 Changeset 生成的格式为 "## 1.0.0" 或 "## 2024.18.5+abc1234"
const versionPattern = new RegExp(`(^## \\[?${targetVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]?[\\s\\S]*?)(^## |\\z)`, 'm');
const match = changelogContent.match(versionPattern);

if (match) {
  // 成功匹配，输出该版本章节的内容（去除可能多余的后缀）
  const extractedSection = match[1].trim();
  console.log(extractedSection);
} else {
  // 没有找到对应版本，输出错误信息（也可以选择输出一个默认文本）
  console.error(`警告：在 CHANGELOG.md 中未找到版本 ${targetVersion} 的日志。`);
  // 输出一个默认的 Release 说明，避免 Actions 失败
  console.log(`## ${targetVersion}\n\n> 本次发布的详细变更日志暂未更新至 CHANGELOG.md，请查看 Git 历史记录。`);
}