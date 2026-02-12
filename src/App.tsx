import { useState, useEffect } from 'react'
import { Container, Typography, Box, Paper, Divider, Alert, TextField, Button, Snackbar } from '@mui/material'
import MessageParser from './components/MessageParser'
import MessageCard from './components/MessageCard'
import { Message, parseMessageArray, parsePythonMessageArray } from './types/message'
import { pythonSampleData } from './data/sampleMessages'

function App() {
  const [inputText, setInputText] = useState<string>(pythonSampleData)
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      return parsePythonMessageArray(pythonSampleData)
    } catch (err) {
      console.error('初始解析错误:', err)
      return []
    }
  })
  const [error, setError] = useState<string>('')

  // 调试：在控制台打印解析结果
  useEffect(() => {
    console.log('初始消息解析结果:', messages)
    console.log('消息数量:', messages.length)
    messages.forEach((msg, idx) => {
      console.log(`消息 ${idx}:`, {
        type: msg.type,
        content: msg.content,
        id: msg.id,
        tool_calls: (msg as any).tool_calls,
        tool_call_id: (msg as any).tool_call_id,
      })
    })
  }, [messages])

  const handleParse = () => {
    try {
      // 先尝试JSON解析
      try {
        const parsedData = JSON.parse(inputText)
        const parsedMessages = parseMessageArray(parsedData)
        setMessages(parsedMessages)
        setError('')
      } catch (jsonError) {
        // 如果JSON解析失败，尝试Python格式
        const parsedMessages = parsePythonMessageArray(inputText)
        setMessages(parsedMessages)
        setError('')
      }
    } catch (err) {
      setError(`解析错误: ${err instanceof Error ? err.message : '无效的输入格式'}`)
    }
  }

  const handleReset = () => {
    setInputText(pythonSampleData)
    setMessages(parsePythonMessageArray(pythonSampleData))
    setError('')
  }

  const handleCloseError = () => {
    setError('')
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          消息解析工具
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          此工具解析聊天消息数组并将其显示为分类卡片。能够识别HumanMessage、AIMessage和ToolMessage类型，并提供详细信息展示。
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          输入JSON格式的消息数组进行解析。当前解析了 {messages.length} 条消息: {messages.filter(m => m.type === 'human').length} 条HumanMessage, {messages.filter(m => m.type === 'ai').length} 条AIMessage, {messages.filter(m => m.type === 'tool').length} 条ToolMessage.
        </Alert>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, minWidth: { xs: '100%', md: '50%' } }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" component="h2" gutterBottom color="primary">
              输入消息数据
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              在此输入JSON或Python格式的消息数组进行解析。支持HumanMessage(content='...')、AIMessage(...)、ToolMessage(...)等格式。
            </Typography>
            <Divider sx={{ my: 2 }} />
            <TextField
              multiline
              fullWidth
              minRows={10}
              maxRows={20}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder='例如: [HumanMessage(content="Hello", ...), AIMessage(...), ...] 或 JSON格式'
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={handleParse} fullWidth>
                解析消息
              </Button>
              <Button variant="outlined" color="secondary" onClick={handleReset} fullWidth>
                重置示例
              </Button>
            </Box>
          </Paper>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 50%' }, minWidth: { xs: '100%', md: '50%' } }}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom color="primary">
              解析结果
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              以下是解析后的消息分类摘要。
            </Typography>
            <Divider sx={{ my: 2 }} />
            <MessageParser messages={messages} />
          </Paper>
        </Box>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom color="primary">
            消息详情
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            每条消息卡片显示类型、内容、元数据和其他相关信息。
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {messages.map((message, index) => (
              <Box key={message.id || index}>
                <MessageCard message={message} index={index} />
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        message={error}
      />
    </Container>
  )
}

export default App