import { useState } from 'react';
import { Message, AIMessage, ToolMessage } from '../types/message';
import { FaUser, FaRobot, FaTools, FaChevronDown, FaChevronUp, FaCopy } from 'react-icons/fa';

interface MessageParserProps {
  messages: Message[];
}

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'human':
      return {
        label: 'HumanMessage',
        icon: <FaUser className="w-4 h-4" />,
        bgColor: 'bg-primary-100',
        borderColor: 'border-primary-300',
        textColor: 'text-primary-800',
      };
    case 'ai':
      return {
        label: 'AIMessage',
        icon: <FaRobot className="w-4 h-4" />,
        bgColor: 'bg-secondary-100',
        borderColor: 'border-secondary-300',
        textColor: 'text-secondary-800',
      };
    case 'tool':
      return {
        label: 'ToolMessage',
        icon: <FaTools className="w-4 h-4" />,
        bgColor: 'bg-success-100',
        borderColor: 'border-success-300',
        textColor: 'text-success-800',
      };
    default:
      return {
        label: 'Unknown',
        icon: <FaUser className="w-4 h-4" />,
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-800',
      };
  }
};

const MessageParser = ({ messages }: MessageParserProps) => {
  const humanCount = messages.filter(m => m.type === 'human').length;
  const aiCount = messages.filter(m => m.type === 'ai').length;
  const toolCount = messages.filter(m => m.type === 'tool').length;

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'human': return 'bg-primary-100 text-primary-800 border border-primary-200';
      case 'ai': return 'bg-secondary-100 text-secondary-800 border border-secondary-200';
      case 'tool': return 'bg-success-100 text-success-800 border border-success-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };



  return (
    <div className="space-y-6">
      {/* Message Type Statistics */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`px-3 py-1.5 rounded-lg ${getTypeBadgeColor('human')} text-sm font-medium`}>
          <div className="flex items-center space-x-2">
            <FaUser className="w-3.5 h-3.5" />
            <span>HumanMessage: {humanCount}</span>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-lg ${getTypeBadgeColor('ai')} text-sm font-medium`}>
          <div className="flex items-center space-x-2">
            <FaRobot className="w-3.5 h-3.5" />
            <span>AIMessage: {aiCount}</span>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-lg ${getTypeBadgeColor('tool')} text-sm font-medium`}>
          <div className="flex items-center space-x-2">
            <FaTools className="w-3.5 h-3.5" />
            <span>ToolMessage: {toolCount}</span>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-purple-800 border-b pb-2 flex items-center">
          <span className="mr-2">📋</span>
          消息详情
        </h3>

        <div className="pr-2">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <MessageItem key={message.id || index} message={message} index={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Message Item Component with expandable details
const MessageItem = ({ message, index }: { message: Message; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);


  const typeConfig = getTypeConfig(message.type);

  // 获取消息内容预览 - 显示转义序列
  const getContentPreview = (): string => {
    const content = message.content || '';

    // 将字符串中的特殊字符转换为转义序列表示
    const escapeForDisplay = (str: string): string => {
      return str
        .replace(/\\/g, '\\\\')  // 反斜杠
        .replace(/\n/g, '\\n')   // 换行符
        .replace(/\r/g, '\\r')   // 回车符
        .replace(/\t/g, '\\t')   // 制表符
        .replace(/"/g, '\\"')    // 双引号
        .replace(/'/g, "\\'");   // 单引号
    };

    const escapedContent = escapeForDisplay(content);
    const maxLength = 120;
    let preview = escapedContent.length > maxLength ? escapedContent.substring(0, maxLength) + '...' : escapedContent;

    // 如果内容为空，显示备用文本
    if (!preview.trim()) {
      preview = '[No content]';
    }

    return preview;
  };

  // 从MessageCard复制的格式化函数
  const formatMessageToString = (msg: Message): string => {
    const parts: string[] = [];

    // 辅助函数：将JSON字符串转换为Python风格
    const jsonToPython = (jsonStr: string): string => {
      // 替换null为None，true/false为True/False
      let pythonStr = jsonStr
        .replace(/:/g, ': ')
        .replace(/null/g, 'None')
        .replace(/true/g, 'True')
        .replace(/false/g, 'False');

      // 将外层的双引号替换为单引号（简化处理）
      // 注意：这个简单实现可能不适合嵌套复杂结构，但对于我们的用例应该足够
      pythonStr = pythonStr.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, (_match, content) => {
        // 转义字符串内的单引号
        const escaped = content.replace(/'/g, "\\'");
        return `'${escaped}'`;
      });

      return pythonStr;
    };

    // 辅助函数：为Python字符串转义内容
    const escapeForPythonString = (str: string): string => {
      return str
        .replace(/\\/g, '\\\\')  // 反斜杠
        .replace(/'/g, "\\'")    // 单引号
        .replace(/\n/g, '\\n')   // 换行符
        .replace(/\r/g, '\\r')   // 回车符
        .replace(/\t/g, '\\t')   // 制表符
        .replace(/"/g, '\\"');   // 双引号
    };

    // 内容部分 - 为Python字符串转义
    const contentStr = escapeForPythonString(msg.content);
    parts.push(`content='${contentStr}'`);

    // 添加其他字段
    if (msg.additional_kwargs && Object.keys(msg.additional_kwargs).length > 0) {
      const kwargsStr = JSON.stringify(msg.additional_kwargs);
      parts.push(`additional_kwargs=${jsonToPython(kwargsStr)}`);
    } else {
      parts.push('additional_kwargs={}');
    }

    if (msg.response_metadata && Object.keys(msg.response_metadata).length > 0) {
      const metadataStr = JSON.stringify(msg.response_metadata);
      parts.push(`response_metadata=${jsonToPython(metadataStr)}`);
    } else {
      parts.push('response_metadata={}');
    }

    if (msg.id) {
      const idStr = escapeForPythonString(msg.id);
      parts.push(`id='${idStr}'`);
    }

    // 特定类型的字段
    if (msg.type === 'ai') {
      const aiMsg = msg as AIMessage;
      if (aiMsg.tool_calls && aiMsg.tool_calls.length > 0) {
        const toolCallsStr = JSON.stringify(aiMsg.tool_calls);
        parts.push(`tool_calls=${jsonToPython(toolCallsStr)}`);
      }
      if (aiMsg.refusal !== undefined) {
        parts.push(`refusal=${aiMsg.refusal === null ? 'None' : JSON.stringify(aiMsg.refusal)}`);
      }
    }

    if (msg.type === 'tool') {
      const toolMsg = msg as ToolMessage;
      const toolCallIdStr = escapeForPythonString(toolMsg.tool_call_id);
      parts.push(`tool_call_id='${toolCallIdStr}'`);
      if (toolMsg.name) {
        const nameStr = escapeForPythonString(toolMsg.name);
        parts.push(`name='${nameStr}'`);
      }
    }

    // 根据类型返回完整字符串
    const typeLabel = msg.type === 'human' ? 'HumanMessage' :
                     msg.type === 'ai' ? 'AIMessage' : 'ToolMessage';

    return `${typeLabel}(${parts.join(', ')})`;
  };

  // 复制格式化字符串到剪贴板
  const handleCopy = async () => {
    try {
      const formattedString = formatMessageToString(message);
      await navigator.clipboard.writeText(formattedString);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };


  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Message Header */}
      <div
        className={`px-5 py-4 cursor-pointer ${typeConfig.bgColor} border-b ${typeConfig.borderColor}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${typeConfig.bgColor} ${typeConfig.textColor} border ${typeConfig.borderColor}`}>
              {typeConfig.icon}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">
                {typeConfig.label} #{index + 1}
              </h4>
              <p className="text-sm text-gray-700">
                ID: {message.id || 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">


            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <span>{expanded ? '📥 收起' : '📤 展开'}</span>
              {expanded ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="mt-3 p-3 bg-white/80 rounded-lg border border-gray-200">
          <p className="text-gray-900 text-sm whitespace-pre-wrap line-clamp-2">
            {getContentPreview()}
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-5 py-4 space-y-4 animate-fadeIn">
          {/* Formatted Message String */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-sm font-semibold text-blue-700 flex items-center">
                <span className="mr-1">📋</span>
                格式化消息字符串
              </h5>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800"
                title="复制格式化字符串"
              >
                <FaCopy className="w-3 h-3" />
                <span>{copySuccess ? '已复制!' : '复制'}</span>
              </button>
            </div>
            <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-auto border border-gray-700 font-mono whitespace-pre-wrap">
              {formatMessageToString(message)}
            </pre>
          </div>

          {/* Additional Metadata */}
          {message.additional_kwargs && Object.keys(message.additional_kwargs).length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-purple-700 mb-2 flex items-center">
                <span className="mr-1">🔧</span>
                Additional Kwargs
              </h5>
              <pre className="p-3 bg-gray-50 rounded-lg text-xs overflow-auto border border-gray-200">
                {JSON.stringify(message.additional_kwargs, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Metadata */}
          {message.response_metadata && Object.keys(message.response_metadata).length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-indigo-700 mb-2 flex items-center">
                <span className="mr-1">📊</span>
                Response Metadata
              </h5>
              <pre className="p-3 bg-gray-50 rounded-lg text-xs overflow-auto border border-gray-200">
                {JSON.stringify(message.response_metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Tool Calls for AIMessage */}
          {message.type === 'ai' && (message as AIMessage).tool_calls && (message as AIMessage).tool_calls!.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <h5 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <span className="mr-1">🔧</span>
                Tool Calls ({(message as AIMessage).tool_calls!.length})
              </h5>
              <div className="space-y-2">
                {(message as AIMessage).tool_calls!.map((tool, idx) => (
                  <div key={idx} className="ml-2 p-3 bg-white rounded border border-gray-200">
                    <p className="text-xs font-semibold text-blue-700">{tool.name}</p>
                    <p className="text-xs text-gray-600 mt-1">ID: {tool.id}</p>
                    <p className="text-xs text-gray-600 mt-1">Args: {JSON.stringify(tool.args)}</p>
                    {tool.type && <p className="text-xs text-gray-600 mt-1">Type: {tool.type}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tool Call ID for ToolMessage */}
          {message.type === 'tool' && (
            <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <h5 className="text-sm font-semibold text-green-800 mb-2">Tool Response</h5>
              <div className="space-y-1">
                <p className="text-xs text-gray-700">
                  <span className="font-medium">Tool Call ID:</span> {(message as ToolMessage).tool_call_id}
                </p>
                {(message as ToolMessage).name && (
                  <p className="text-xs text-gray-700">
                    <span className="font-medium">Name:</span> {(message as ToolMessage).name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Refusal for AIMessage */}
          {message.type === 'ai' && (message as AIMessage).refusal !== undefined && (
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
              <h5 className="text-sm font-semibold text-yellow-800 mb-2">Refusal</h5>
              <p className="text-sm text-gray-700">
                {(message as AIMessage).refusal === null ? 'null' : (message as AIMessage).refusal}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageParser;