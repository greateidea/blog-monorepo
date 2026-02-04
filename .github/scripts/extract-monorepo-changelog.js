#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function findChangelogFiles(dir) {
    const changelogs = [];
    // 1. 定义我们只关心的目标目录
    const targetDirs = ['apps', 'packages'];
    
    for (const targetDir of targetDirs) {
        const targetDirPath = path.join(dir, targetDir);
        try {
            // 2. 检查目标目录是否存在
            await fs.access(targetDirPath);
            console.log(`🔍 正在扫描目录: ${targetDir}/`);
        } catch {
            // 目录不存在，跳过
            console.log(`⏭️  目录 ${targetDir}/ 不存在，跳过。`);
            continue;
        }

        // 3. 读取目标目录，只处理直接的子目录（一层）
        const items = await fs.readdir(targetDirPath, { withFileTypes: true });
        for (const item of items) {
            // 只处理子目录，忽略文件和非标准目录
            if (item.isDirectory() && !item.name.startsWith('.')) {
                const packageDirPath = path.join(targetDirPath, item.name);
                const changelogPath = path.join(packageDirPath, 'CHANGELOG.md');
                try {
                    await fs.access(changelogPath);
                    changelogs.push(changelogPath);
                    console.log(`  ✅ 在 ${targetDir}/${item.name} 中找到 CHANGELOG.md`);
                } catch {
                    // 没有 CHANGELOG.md 文件，静默跳过
                }
            }
        }
    }
    return changelogs;
}

// 以下函数 extractVersionSection 和 main 保持不变，与之前提供的完全一致
function extractVersionSection(content, targetVersion) {
    const escapedVersion = targetVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^## \\[?${escapedVersion}\\]?\\s*(?:\\n|$)([\\s\\S]*?)(?=^## |^# |\\z)`, 'mi');
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
}

async function main() {
    const targetVersion = process.argv[2];
    if (!targetVersion) {
        console.error('错误：请提供目标版本号。');
        process.exit(1);
    }

    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
    console.log(`工作区目录: ${workspace}`);
    console.log(`目标版本: ${targetVersion}`);

    try {
        const changelogFiles = await findChangelogFiles(workspace);
        console.log(`\n共计找到 ${changelogFiles.length} 个包的 CHANGELOG.md 文件。`);

        let finalReleaseNotes = `# Release ${targetVersion}\n\n`;
        let foundAny = false;

        for (const filePath of changelogFiles) {
            const relativePath = path.relative(workspace, filePath);
            const dirName = path.dirname(relativePath); // 例如: apps/blog-index
            const content = await fs.readFile(filePath, 'utf8');
            const section = extractVersionSection(content, targetVersion);

            if (section) {
                foundAny = true;
                // 使用更清晰的标题
                finalReleaseNotes += `## 📦 ${dirName}\n\n${section}\n\n`;
                console.log(`  提取成功: ${dirName}`);
            } else {
                console.log(`  未找到匹配版本: ${dirName}`);
            }
        }

        if (foundAny) {
            console.log('\n✅ 成功合并变更日志。');
            process.stdout.write(finalReleaseNotes);
        } else {
            console.log(`\n⚠️  未在任何包的 CHANGELOG.md 中找到版本 ${targetVersion} 的日志。`);
            const defaultNotes = `## ${targetVersion}\n\n此版本已通过自动化流程发布。\n\n> *提示：未在 apps/ 或 packages/ 目录下的包变更日志中找到此版本的专用记录。*`;
            process.stdout.write(defaultNotes);
        }
    } catch (error) {
        console.error(`脚本执行出错: ${error.message}`);
        process.stdout.write(`## ${targetVersion}\n\n自动化发布流程执行完成。\n\n> *（生成详细发布说明时遇到问题：${error.message}）*`);
        process.exit(0);
    }
}

main();