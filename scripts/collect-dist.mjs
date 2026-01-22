import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径上下文
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义根目录路径
const rootDir = path.resolve(__dirname, '..');
const targetDir = path.resolve(rootDir, 'dist');

// 【核心配置】定义要拷贝的应用映射关系
const appsToCopy = [
  {
    // 源地址：子应用的构建产物
    source: path.resolve(rootDir, 'apps/blog-ssr/dist/client'),
    // 目标地址：根目录 dist 下的子文件夹名
    // 最终访问路径可能是 https://yoursite.com/blog
    target: path.resolve(targetDir),
  },
  {
    source: path.resolve(rootDir, 'apps/blog-index/dist'),
    target: path.resolve(targetDir),
  }
];

async function run() {
  console.log('📦 开始归拢构建产物...');

  // 1. 确保目标根 dist 存在，且是空的（清理旧文件）
  // 资深提示：emptydir 会自动创建目录，如果存在则清空，非常安全
  await fs.emptyDir(targetDir);
  console.log(`✅ 已清空根目录 dist: ${targetDir}`);

  // 2. 遍历拷贝
  for (const app of appsToCopy) {
    if (await fs.pathExists(app.source)) {
      // 【DEBUG】打印出来看看它到底指向哪里？
      console.log('DEBUG: source target are', app.source, app.target); 
      await fs.copy(app.source, app.target);
      console.log(`✨ [${path.basename(app.target)}] 拷贝成功`);
    } else {
      console.warn(`⚠️  警告: 未找到源目录 ${app.source}，跳过拷贝。可能是该应用未构建或构建失败。`);
    }
  }

  console.log('🎉 所有产物归拢完毕！');
}

run().catch(err => {
  console.error('❌ 归拢失败:', err);
  process.exit(1);
});
