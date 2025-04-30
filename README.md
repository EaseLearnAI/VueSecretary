# Vue Secretary

一个基于Vue 3的个人秘书应用，提供任务管理、语音合成、反馈生成等功能。

## 功能特性

- 任务管理
- 语音合成
- 反馈生成
- 习惯追踪

## 反馈生成功能

反馈生成功能可以根据用户输入的文本内容和选择的风格，自动生成一条鼓励语句和一条批评语句。

### 使用步骤

1. 在语音合成表单中，填写文本内容
2. 选择鼓励风格和批评风格
3. 点击"生成反馈"按钮
4. 系统会自动生成鼓励语句和批评语句
5. 生成的反馈将会显示在页面上

### API测试

可以通过以下方式测试反馈生成API：

1. 运行测试脚本：
   ```bash
   node test/feedbackService.test.js
   ```

2. 在浏览器中打开测试页面：
   ```
   test/feedbackTest.html
   ```

## 开发说明

### 项目设置

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

### 目录结构

- `src/`: 源代码目录
  - `api/`: API交互模块
  - `components/`: Vue组件
  - `views/`: 页面视图
  - `router/`: 路由配置
  - `store/`: 状态管理
  - `assets/`: 静态资源
- `public/`: 公共资源
- `test/`: 测试脚本
- `doc/`: 文档 