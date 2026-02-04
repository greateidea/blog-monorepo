#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * 在 apps/ 和 packages/ 目录中查找所有包的 CHANGELOG.md 文件
 */
async function findChangelogFiles(dir) {
    const changelogs = [];
    const targetDirs = ['apps', 'packages'];
    
    for (const targetDir of targetDirs) {
        const targetDirPath = path.join(dir, targetDir);
        try {
            await fs.access(targetDirPath);
        } catch {
            // 目录不存在，跳过
            continue;
        }

        const items = await fs.readdir(targetDirPath, { withFileTypes: true });
        for (const item of items) {
            if (item.isDirectory() && !item.name.startsWith('.')) {
                const packageDirPath = path.join(targetDirPath, item.name);
                const changelogPath = path.join(packageDirPath, 'CHANGELOG.md');
                try {
                    await fs.access(changelogPath);
                    changelogs.push({
                        changelogPath,
                        packageDirPath
                    });
                } catch {
                    // 没有 CHANGELOG.md 文件，静默跳过
                }
            }
        }
    }
    return changelogs;
}

/**
 * 从指定包的目录读取 package.json，获取其当前版本号
 */
async function getPackageVersion(packageDirPath) {
    try {
        const packageJsonPath = path.join(packageDirPath, 'package.json');
        const content = await fs.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(content);
        return packageJson.version; // 例如 "0.4.9"
    } catch (error) {
        return null;
    }
}

/**
 * 从 CHANGELOG.md 内容中提取指定版本号的章节
 */
function extractVersionSection(content, targetVersion) {
    // 构建正则表达式，匹配 "## X.Y.Z" 或 "## [X.Y.Z]"
    // 对 targetVersion 进行转义，处理特殊字符
    const escapedVersion = targetVersion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`^## \\[?${escapedVersion}\\]?\\s*(?:\\n|$)([\\s\\S]*?)(?=^## |^# |\\z)`, 'mi');
    const match = content.match(pattern);
    return match ? match[1].trim() : null;
}

/**
 * 主函数：汇总所有有更新的包的变更日志
 */
async function main() {
    const targetVersion = process.argv[2]; // 全局发布版本号，例如 2026.06.0+b8679f5
    if (!targetVersion) {
        console.error('错误：请提供目标发布版本号。');
        process.exit(1);
    }

    const workspace = process.env.GITHUB_WORKSPACE || process.cwd();
    console.log(`工作区目录: ${workspace}`);
    console.log(`发布版本: ${targetVersion}\n`);

    try {
        // 1. 找到所有包的 CHANGELOG.md 文件
        const packages = await findChangelogFiles(workspace);
        console.log(`扫描到 ${packages.length} 个候选包。`);

        let finalReleaseNotes = `# Release ${targetVersion}\n\n`;
        const updatedPackages = []; // 记录有更新的包
        const skippedPackages = []; // 记录跳过的包

        // 2. 遍历每个包，检查并提取本次更新的日志
        for (const pkg of packages) {
            const relativeDirPath = path.relative(workspace, pkg.packageDirPath);
            
            // 2.1 获取包的当前版本号
            const packageVersion = await getPackageVersion(pkg.packageDirPath);
            if (!packageVersion) {
                skippedPackages.push(`${relativeDirPath} (无法读取版本号)`);
                continue;
            }

            // 2.2 读取该包的 CHANGELOG.md
            const changelogContent = await fs.readFile(pkg.changelogPath, 'utf8');
            
            // 2.3 关键：尝试用包的当前版本号去匹配 CHANGELOG.md 中的章节
            const versionSection = extractVersionSection(changelogContent, packageVersion);
            
            if (versionSection) {
                // 找到匹配！说明此包在本次发布中有更新。
                updatedPackages.push(`${relativeDirPath} (v${packageVersion})`);
                
                // 提取成功，添加到最终输出
                finalReleaseNotes += `## 📦 ${relativeDirPath} (v${packageVersion})\n\n${versionSection}\n\n`;
            } else {
                // 未找到匹配，说明此包的 CHANGELOG.md 中未记录当前 package.json 的版本。
                // 这通常意味着该包在本次发布中未更新。
                skippedPackages.push(`${relativeDirPath} (v${packageVersion}, 日志中无记录)`);
            }
        }

        // 3. 生成最终报告
        console.log('\n========== 执行报告 ==========');
        console.log(`✅ 有更新的包 (${updatedPackages.length} 个):`);
        updatedPackages.forEach(pkg => console.log(`  ${pkg}`));
        
        console.log(`\n⏭️  跳过的包 (${skippedPackages.length} 个):`);
        if (skippedPackages.length > 0) {
            // 只显示前5个跳过的包，避免日志过长
            skippedPackages.slice(0, 5).forEach(pkg => console.log(`  ${pkg}`));
            if (skippedPackages.length > 5) {
                console.log(`  ... 以及另外 ${skippedPackages.length - 5} 个包`);
            }
        } else {
            console.log(`  (无)`);
        }
        console.log('==============================\n');

        // 4. 输出最终内容
        if (updatedPackages.length > 0) {
            console.log(`✅ 成功汇总 ${updatedPackages.length} 个包的变更日志。`);
            // 在最终内容前加上一个简短的摘要
            const summary = `本次发布包含 **${updatedPackages.length}** 个包的更新：\n\n`;
            finalReleaseNotes = `# Release ${targetVersion}\n\n${summary}` + finalReleaseNotes.substring(finalReleaseNotes.indexOf('\n##'));
            process.stdout.write(finalReleaseNotes);
        } else {
            console.log(`⚠️  未发现任何包有版本更新。`);
            // 生成一个友好的默认说明
            const defaultNotes = `## ${targetVersion}\n\n此版本为基础设施或配置更新，没有包的功能性变更。\n\n> *提示：所有扫描到的包的 CHANGELOG.md 均未记录与当前 package.json 匹配的新版本。*`;
            process.stdout.write(defaultNotes);
        }
    } catch (error) {
        console.error(`脚本执行出错: ${error.message}`);
        // 即使出错，也输出一个基本的说明，防止工作流完全失败
        process.stdout.write(`## ${targetVersion}\n\n自动化发布流程执行完成。\n\n> *（生成详细发布说明时遇到问题：${error.message}）*`);
        process.exit(0); // 退出码为0，允许工作流继续
    }
}

main();