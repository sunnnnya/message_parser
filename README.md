# 消息解析器

chystart, 2441664255@qq.com

一个基于 React + TypeScript 的消息解析应用，能够解析聊天消息数组（HumanMessage、AIMessage、ToolMessage）并以专业UI分类展示。

## 功能特性

- **交互式输入**：用户可以输入JSON或Python格式的消息数组进行实时解析（例如：`[HumanMessage(content='...'), AIMessage(...)]`）
- **消息解析**：从原始数据中识别 HumanMessage、AIMessage 和 ToolMessage 类型
- **可视化卡片**：将每条消息显示在带有直观图标的颜色编码卡片中
- **详细视图**：可展开的部分显示额外的元数据、工具调用和响应数据
- **响应式布局**：使用Material-UI组件构建的简洁专业设计
- **实时反馈**：显示解析错误和消息统计信息
- **示例数据**：包含展示所有三种消息类型的示例消息

## 项目结构

```
src/
├── components/
│   └── MessageParser.tsx  # 消息解析和展示组件（包含卡片功能）
├── types/
│   └── message.ts         # TypeScript 接口和解析函数
├── data/
│   └── sampleMessages.ts  # 示例消息数据
├── App.tsx                # 主应用组件
├── main.tsx              # 应用入口点，包含主题配置
└── twind.config.ts       # TwindCSS 配置文件
```

## 支持的消息类型

解析器支持三种消息类型：

1. **HumanMessage**：用户消息，包含内容和元数据
2. **AIMessage**：AI响应消息，可包含工具调用和拒绝信息
3. **ToolMessage**：工具执行结果消息，包含工具调用引用

## 使用方法

1. **安装依赖**：
   ```bash
   npm install
   ```

2. **启动开发服务器**：
   ```bash
   npm run dev
   ```

3. **打开浏览器**：访问 `http://localhost:5173`（或终端显示的端口）

4. **输入消息数据**：
   - 在左侧面板中，输入JSON或Python格式的消息数组
   - JSON格式：`[{"content": "消息文本", ...}, ...]`
   - Python格式：`[HumanMessage(content='...'), AIMessage(...), ToolMessage(...)]`
   - 可以使用预加载的Python格式示例数据作为参考

5. **解析消息**：点击"🔍 解析消息"按钮解析输入内容

6. **查看结果**：右侧面板显示解析后的消息摘要和详细卡片

7. **重置**：使用"🔄 重置示例"按钮恢复示例数据

## 自定义配置

- **输入格式**：解析器接受JSON数组和Python风格的消息列表（例如：`[HumanMessage(...), AIMessage(...)]`），支持字段包括 `content`、`tool_calls`、`tool_call_id` 和其他元数据
- **主题定制**：编辑 `src/main.tsx` 中的主题以更改颜色和排版
- **卡片样式**：在 `MessageParser.tsx` 中调整样式以获得不同的视觉外观
- **解析逻辑**：修改 `src/types/message.ts` 以更改消息分类方式

## 技术栈

- React 18
- TypeScript
- Material-UI (MUI) v7
- Vite 构建工具
- Emotion 样式库
- TwindCSS (替代原始Material-UI字体)

## 示例数据

应用包含三条预加载到输入字段的示例消息：

1. 一个询问北京天气的 HumanMessage
2. 一个包含查询天气工具调用的 AIMessage
3. 一个包含天气结果的 ToolMessage

每条消息展示了不同的元数据字段和解析能力。用户可以直接在输入字段中修改这些数据，或用他们自己的消息数组替换。

## 许可证

MIT