# Message Parser

A React + TypeScript application that parses chat message arrays (HumanMessage, AIMessage, ToolMessage) and displays them in categorized cards with a professional UI.

## Features

- **Interactive Input**: Users can input JSON or Python-formatted message arrays for real-time parsing (e.g., `[HumanMessage(content='...'), AIMessage(...)]`)
- **Message Parsing**: Identifies HumanMessage, AIMessage, and ToolMessage types from raw data
- **Visual Cards**: Displays each message in a color-coded card with intuitive icons
- **Detailed View**: Expandable sections show additional metadata, tool calls, and response data
- **Responsive Layout**: Clean, professional design with Material-UI components
- **Real-time Feedback**: Shows parsing errors and message statistics
- **Sample Data**: Includes example messages demonstrating all three message types

## Project Structure

```
src/
├── components/
│   ├── MessageCard.tsx    # Individual message card component
│   └── MessageParser.tsx  # Message summary and parsing component
├── types/
│   └── message.ts         # TypeScript interfaces and parsing functions
├── data/
│   └── sampleMessages.ts  # Sample message data
├── App.tsx                # Main application component
└── main.tsx              # Application entry point with theme
```

## Message Types

The parser supports three message types:

1. **HumanMessage**: User messages with content and metadata
2. **AIMessage**: AI responses with optional tool calls and refusal
3. **ToolMessage**: Tool execution results with tool call references

## Usage

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open browser**: Navigate to `http://localhost:5173` (or the port shown in terminal)

4. **Input message data**:
   - In the left panel, input JSON or Python-formatted message arrays
   - JSON format: `[{"content": "message text", ...}, ...]`
   - Python format: `[HumanMessage(content='...'), AIMessage(...), ToolMessage(...)]`
   - Use the sample data as a reference (pre-loaded Python format)

5. **Parse messages**: Click the "解析消息" (Parse Messages) button to parse the input

6. **View results**: The right panel shows parsed message summary and detailed cards below

7. **Reset**: Use the "重置示例" (Reset Example) button to restore sample data

## Customization

- **Input format**: The parser accepts both JSON arrays and Python-style message lists (e.g., `[HumanMessage(...), AIMessage(...)]`) with fields like `content`, `tool_calls`, `tool_call_id`, and other metadata
- **Theme customization**: Edit the theme in `src/main.tsx` to change colors and typography
- **Card styling**: Adjust styles in `MessageCard.tsx` for different visual appearance
- **Parsing logic**: Modify `src/types/message.ts` to change how messages are classified

## Technologies Used

- React 18
- TypeScript
- Material-UI (MUI) v7
- Vite for build tooling
- Emotion for styling

## Sample Data

The application includes three sample messages that are pre-loaded in the input field:

1. A HumanMessage asking about Beijing weather
2. An AIMessage with a tool call to query weather
3. A ToolMessage with weather results

Each message demonstrates different metadata fields and parsing capabilities. Users can modify this data directly in the input field or replace it with their own message arrays.

## License

MIT