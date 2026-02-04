#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

/**
 * 获取最近的发布Tag，作为对比基准。
 * 如果这是第一次发布，可能没有Tag，则返回初始提交。
 */
function getPreviousReleaseTag() {
    try {
        // 获取按时间倒序的Tag列表，取第一个（最新的）作为上一次发布
        const tags = execSync('git tag --sort=-v:refname', { encoding: 'utf8' }).trim().split('\n');
        // 过滤掉可能存在的空字符串，并返回最新的一个
        const latestTag = tags.filter(tag => tag.length > 0)[0];
        if (latestTag) {
            console.log(`📌 使用上一次发布Tag作为基准: ${latestTag}`);
            return latestTag;
        }
    } catch (error) {
        // 忽略错误，可能还没有任何Tag
    }
    console.log('📌 未找到历史发布Tag，将使用初始提交作为基准。');
    // 返回初始提交ID。也可以考虑返回空字符串，表示只检查当前变更。
    try {
        const firstCommit = execSync('git rev-list --max-parents=0 HEAD', { encoding: 'utf8' }).trim();
        return firstCommit;
    } catch {
        return ''; // 如果连初始提交都获取失败，则返回空，diff 将针对空文件
    }
}

/**
 * 计算指定文件在两个Git引用（如Tag或提交）之间的差异。
 * 返回差异内容中，属于“新版本”的、非删除的行。
 */
function getDiffForFile(filePath, oldRef, newRef = 'HEAD') {
    try {
        // 如果oldRef为空，则比较的是“空文件”和当前文件（即全部内容都是新增）
        const diffCommand = oldRef ? 
            `git diff ${oldRef} ${newRef} -- "${filePath}"` :
            `git show ${newRef}:${filePath}`; // 如果无基准，则显示整个文件内容作为“新增”

        const diffOutput = execSync(diffCommand, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }); // 增大缓冲区
        return diffOutput;
    } catch (error) {
        // 文件可能在旧引用中不存在，这是正常情况（新增的文件）
        return '';
    }
}

/**
 * 从完整的Git diff输出中，解析出属于“新增”的、有意义的变更行。
 * 只提取被添加的“- 提交哈希: 描述”行及其父标题。
 */
function parseAddedLinesFromDiff(diffText) {
    const addedLines = [];
    let currentSection = '';
    const lines = diffText.split('\n');
    
    for (const line of lines) {
        // 匹配被添加的章节标题行，如 “### Patch Changes”
        if (line.startsWith('+### ') || line.startsWith('+## ')) {
            currentSection = line.substring(1).trim(); // 去掉行首的 “+”
        }
        // 匹配被添加的变更条目行，如 “- ef3bd49: 提取当前变更”
        // 确保这是新增行（以“+”开头），并且包含提交哈希和冒号
        else if (line.startsWith('+- ') && line.includes(':')) {
            const cleanLine = line.substring(2); // 去掉行首的 “+ ”
            addedLines.push({
                section: currentSection,
                change: cleanLine
            });
        }
        // 匹配被添加的依赖更新行，如 “Updated dependencies [acc6607]”
        else if (line.startsWith('+Updated dependencies')) {
            const cleanLine = line.substring(1); // 去掉行首的 “+”
            addedLines.push({
                section: currentSection,
                change: cleanLine
            });
        }
        // 匹配被添加的具体依赖行，如 “@blog/ui-lib@1.1.2”
        else if (line.startsWith('+ ') && line.includes('@') && !line.startsWith('+-')) {
            const cleanLine = line.substring(2); // 去掉行首的 “+ ”
            // 将这个依赖行附加到上一个“Updated dependencies”行之后，或单独记录
            if (addedLines.length > 0 && addedLines[addedLines.length - 1].change.startsWith('Updated dependencies')) {
                addedLines[addedLines.length - 1].change += `\n  ${cleanLine}`;
            } else {
                addedLines.push({
                    section: currentSection,
                    change: cleanLine
                });
            }
        }
    }
    return addedLines;
}

/**
 * 主函数：对比本次提交与上一次发布Tag，精确提取每个包新增的变更日志行。
 */
async function main() {
    const currentReleaseTag = process.argv[2]; // 本次要创建的发布版本号，例如 2026.06.0+3ee1b14
    if (!currentReleaseTag) {
        console.error('错误：请提供本次的发布版本号（Tag）。');
        process.exit(1);
    }

    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();

    // 1. 获取上一次发布的Tag作为对比基准
    const previousReleaseTag = getPreviousReleaseTag();
    const comparisonBase = previousReleaseTag || 'HEAD~1'; // 如果无历史Tag，则与上一次提交对比（有一定风险）

    try {
        // 2. 找到所有包的 CHANGELOG.md 文件
        const targetDirs = ['apps', 'packages'];
        const allPackages = [];
        for (const dir of targetDirs) {
            const dirPath = path.join(workspace, dir);
            try {
                await fs.access(dirPath);
                const subDirs = await fs.readdir(dirPath, { withFileTypes: true });
                for (const item of subDirs) {
                    if (item.isDirectory() && !item.name.startsWith('.')) {
                        const pkgDir = path.join(dirPath, item.name);
                        const changelogPath = path.join(pkgDir, 'CHANGELOG.md');
                        try {
                            await fs.access(changelogPath);
                            allPackages.push({ pkgDir, changelogPath, relativePath: `${dir}/${item.name}` });
                        } catch { /* 没有CHANGELOG，忽略 */ }
                    }
                }
            } catch { /* 目录不存在，忽略 */ }
        }


        // 3. 遍历每个包，精确计算其 CHANGELOG.md 的差异
        const updatedPackagesDetails = [];
        for (const pkg of allPackages) {
            // 3.1 获取该包 CHANGELOG.md 文件在两次发布之间的差异
            const diffText = getDiffForFile(pkg.changelogPath, comparisonBase, 'HEAD');
            
            if (!diffText) {
                // 没有差异，说明此包的 CHANGELOG.md 在本次发布周期内未发生任何更改
                continue;
            }

            // 3.2 从差异中解析出新增的有效变更行
            const addedChanges = parseAddedLinesFromDiff(diffText);
            
            if (addedChanges.length === 0) {
                // 有差异，但可能只是格式调整（如空格），没有实质的变更条目
                continue;
            }

            // 3.3 按章节分组变更
            const changesBySection = {};
            for (const item of addedChanges) {
                if (!changesBySection[item.section]) {
                    changesBySection[item.section] = [];
                }
                changesBySection[item.section].push(item.change);
            }

            // 3.4 获取包的当前版本，用于在输出中显示
            let packageVersion = '未知版本';
            try {
                const packageJsonPath = path.join(pkg.pkgDir, 'package.json');
                const pkgJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                packageVersion = pkgJson.version;
            } catch { /* 忽略版本读取错误 */ }

            updatedPackagesDetails.push({
                name: pkg.relativePath,
                version: packageVersion,
                changesBySection
            });
        }

        // 4. 生成最终汇总的 Release Notes
        let finalReleaseNotes = `# Release ${currentReleaseTag}\n\n`;
        if (previousReleaseTag) {
            finalReleaseNotes += `> 相较于上次发布 (${previousReleaseTag})，本次更新如下：\n\n`;
        } else {
            finalReleaseNotes += `> 本次为首个自动生成的发布版本。\n\n`;
        }

        if (updatedPackagesDetails.length === 0) {
            finalReleaseNotes += `本次发布可能仅包含配置、文档或依赖更新。`;
        } else {
            finalReleaseNotes += `本次发布包含 **${updatedPackagesDetails.length}** 个包的更新：\n\n`;
            for (const pkg of updatedPackagesDetails) {
                finalReleaseNotes += `## 📦 ${pkg.name} (v${pkg.version})\n\n`;
                for (const [section, changes] of Object.entries(pkg.changesBySection)) {
                    if (section) {
                        finalReleaseNotes += `### ${section}\n\n`;
                    }
                    // 去重（在某些极端diff情况下可能重复）
                    const uniqueChanges = [...new Set(changes)];
                    for (const change of uniqueChanges) {
                        finalReleaseNotes += `- ${change}\n`;
                    }
                    finalReleaseNotes += '\n';
                }
            }
        }

        // 5. 输出最终内容
        process.stdout.write(finalReleaseNotes);

    } catch (error) {
        console.error(`❌ 脚本执行出错: ${error.message}`);
        console.error(error.stack);
        // 降级方案：生成一个简洁的说明，确保工作流不中断
        const fallbackNotes = `## ${currentReleaseTag}\n\n自动化发布流程执行完成。\n\n> *（生成详细发布说明时遇到问题：${error.message}）*`;
        process.stdout.write(fallbackNotes);
        process.exit(0);
    }
}

main();