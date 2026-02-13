import { useState, useEffect } from 'react'
import MessageParser from './components/MessageParser'
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
  const [showError, setShowError] = useState<boolean>(false)

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
        setShowError(false)
      } catch (jsonError) {
        // 如果JSON解析失败，尝试Python格式
        const parsedMessages = parsePythonMessageArray(inputText)
        setMessages(parsedMessages)
        setError('')
        setShowError(false)
      }
    } catch (err) {
      setError(`解析错误: ${err instanceof Error ? err.message : '无效的输入格式'}`)
      setShowError(true)
    }
  }

  const handleReset = () => {
    setInputText(pythonSampleData)
    setMessages(parsePythonMessageArray(pythonSampleData))
    setError('')
    setShowError(false)
  }

  const handleCloseError = () => {
    setShowError(false)
  }

  // 自动隐藏错误通知
  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => {
        setShowError(false)
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [showError])

  return (
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full py-8 px-4 sm:px-6 lg:px-8">


        {/* Main Content - Two Columns */}
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          {/* Left Column - Input */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6 h-full flex flex-col">
              <h2 className="text-xl font-semibold text-blue-800 mb-3 flex items-center">
                <span className="mr-2">📝</span>
                输入消息数据
              </h2>
              <p className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-serif font-semibold text-base mb-4 drop-shadow-lg hover:drop-shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                请输入 LangChain 中消息列表原始字符串进行格式化解析，例如: [HumanMessage(), AIMessage(), ToolMessage(), AIMessage()...]
              </p>

              <hr className="my-4 border-gray-200" />

              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow min-h-[200px] font-mono text-sm resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder='例如: [HumanMessage(content="Hello"), AIMessage(content="Hi"), ToolMessage(content="Result"), ...]'
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleParse}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  🔍 解析消息
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  🔄 重置示例
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Parsed Results */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow-md p-6 h-full overflow-y-auto">
              <h2 className="text-xl font-semibold text-green-800 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                解析结果
              </h2>
              <MessageParser messages={messages} />
            </div>
          </div>
        </div>
      </div>

      {/* Error Notification */}
      {showError && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-lg max-w-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={handleCloseError}
                    className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    <span className="sr-only">关闭</span>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App