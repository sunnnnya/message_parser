export interface BaseMessage {
  id?: string;
  content: string;
  additional_kwargs?: Record<string, any>;
  response_metadata?: Record<string, any>;
  usage_metadata?: Record<string, any>;
}

export interface HumanMessage extends BaseMessage {
  type: 'human';
}

export interface AIMessage extends BaseMessage {
  type: 'ai';
  tool_calls?: ToolCall[];
  refusal?: string | null;
}

export interface ToolMessage extends BaseMessage {
  type: 'tool';
  tool_call_id: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
  type?: string;
}

export type Message = HumanMessage | AIMessage | ToolMessage;

export function parseMessage(raw: any): Message {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid message data');
  }

  // Check for HumanMessage pattern
  if (raw.content && typeof raw.content === 'string' && !raw.tool_calls && !raw.tool_call_id) {
    return {
      type: 'human',
      id: raw.id,
      content: raw.content,
      additional_kwargs: raw.additional_kwargs,
      response_metadata: raw.response_metadata,
      usage_metadata: raw.usage_metadata,
    };
  }

  // Check for AIMessage pattern
  if (raw.tool_calls || raw.refusal !== undefined) {
    return {
      type: 'ai',
      id: raw.id,
      content: raw.content,
      additional_kwargs: raw.additional_kwargs,
      response_metadata: raw.response_metadata,
      usage_metadata: raw.usage_metadata,
      tool_calls: raw.tool_calls,
      refusal: raw.refusal,
    };
  }

  // Check for ToolMessage pattern
  if (raw.tool_call_id) {
    return {
      type: 'tool',
      id: raw.id,
      content: raw.content,
      additional_kwargs: raw.additional_kwargs,
      response_metadata: raw.response_metadata,
      usage_metadata: raw.usage_metadata,
      tool_call_id: raw.tool_call_id,
      name: raw.name,
    };
  }

  // Default to human if cannot determine
  return {
    type: 'human',
    id: raw.id,
    content: raw.content || '',
    additional_kwargs: raw.additional_kwargs,
    response_metadata: raw.response_metadata,
    usage_metadata: raw.usage_metadata,
  };
}

export function parseMessageArray(rawArray: any[]): Message[] {
  return rawArray.map(parseMessage);
}

/**
 * 将Python风格的字符串转换为JSON字符串
 */
export function pythonToJson(pythonStr: string): string {
  let result = pythonStr;

  // 替换Python的None为JavaScript的null
  result = result.replace(/\bNone\b/g, 'null');

  // 替换Python的True/False为JavaScript的true/false
  result = result.replace(/\bTrue\b/g, 'true');
  result = result.replace(/\bFalse\b/g, 'false');

  // 替换单引号为双引号，但需要小心处理字符串内的转义
  // 先替换外层单引号字符串
  result = result.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, (_match, content) => {
    // 转义字符串内的双引号
    const escaped = content.replace(/"/g, '\\"');
    return `"${escaped}"`;
  });

  // 替换HumanMessage、AIMessage、ToolMessage构造器为JSON对象
  result = result.replace(/\bHumanMessage\s*\(/g, '{');
  result = result.replace(/\bAIMessage\s*\(/g, '{');
  result = result.replace(/\bToolMessage\s*\(/g, '{');

  // 这些构造器可能包含type字段，但我们的parseMessage函数会根据内容推断类型
  // 所以只需要移除构造器名称，保留参数内容

  return result;
}

/**
 * 尝试解析Python风格的消息数组字符串
 */
export function parsePythonMessageArray(pythonStr: string): Message[] {
  console.log('解析Python字符串 (前100字符):', pythonStr.substring(0, 100) + (pythonStr.length > 100 ? '...' : ''))
  try {
    // 先尝试直接解析为JSON
    const parsed = JSON.parse(pythonStr);
    if (Array.isArray(parsed)) {
      console.log('JSON解析成功，消息数量:', parsed.length)
      return parseMessageArray(parsed);
    }
    throw new Error('输入不是有效的数组');
  } catch (jsonError) {
    // 如果JSON解析失败，尝试处理Python格式
    try {
      // 移除空格和换行符以简化处理
      let normalized = pythonStr.trim();

      // 检查是否是Python列表格式
      if (!normalized.startsWith('[') || !normalized.endsWith(']')) {
        throw new Error('输入应该是一个Python列表（以[开头，以]结尾）');
      }

      // 提取列表内容
      const listContent = normalized.slice(1, -1).trim();

      if (!listContent) {
        return []; // 空列表
      }

      // 简单的解析：将Python对象转换为JSON对象
      // 这是一个简化的解析器，处理基本格式
      const messages: Message[] = [];
      let currentPos = 0;

      while (currentPos < listContent.length) {
        // 跳过空白字符
        while (currentPos < listContent.length && /\s/.test(listContent[currentPos])) {
          currentPos++;
        }

        if (currentPos >= listContent.length) break;

        // 检查是否以HumanMessage、AIMessage、ToolMessage开头
        const nextChar = listContent[currentPos];
        if (nextChar === 'H' || nextChar === 'A' || nextChar === 'T') {
          // 找到构造器的结束位置
          let parenCount = 0;
          let endPos = currentPos;
          let inString = false;
          let escapeNext = false;
          let quoteChar = '';

          while (endPos < listContent.length) {
            const char = listContent[endPos];

            if (escapeNext) {
              escapeNext = false;
            } else if (char === '\\') {
              escapeNext = true;
            } else if (inString) {
              if (char === quoteChar) {
                inString = false;
              }
            } else if (char === '"' || char === "'") {
              inString = true;
              quoteChar = char;
            } else if (char === '(') {
              parenCount++;
            } else if (char === ')') {
              parenCount--;
              if (parenCount === 0) {
                break;
              }
            }
            endPos++;
          }

          if (endPos >= listContent.length) {
            throw new Error('未找到匹配的括号');
          }

          // 提取构造器调用
          const constructorCall = listContent.slice(currentPos, endPos + 1);

          // 尝试解析这个构造器调用
          const message = parsePythonConstructor(constructorCall);
          if (message) {
            messages.push(message);
          }

          currentPos = endPos + 1;

          // 跳过逗号和空白
          while (currentPos < listContent.length && (/\s/.test(listContent[currentPos]) || listContent[currentPos] === ',')) {
            currentPos++;
          }
        } else {
          throw new Error(`无法解析的格式，位置 ${currentPos}: ${listContent.substring(currentPos, Math.min(currentPos + 50, listContent.length))}`);
        }
      }

      console.log('Python解析成功，消息数量:', messages.length)
      return messages;
    } catch (pythonError) {
      throw new Error(`无法解析输入格式: ${pythonError instanceof Error ? pythonError.message : String(pythonError)}`);
    }
  }
}

/**
 * 解析Python构造器调用，如 HumanMessage(content='test', ...)
 */
function parsePythonConstructor(constructorCall: string): Message | null {
  // 提取构造器名和参数部分
  const match = constructorCall.match(/^\s*(\w+)\s*\((.*)\)\s*$/);
  if (!match) {
    return null;
  }

  // @ts-ignore - match is used in destructuring
  const [, constructorName, argsStr] = match;

  // 解析关键字参数
  const args = parsePythonArgs(argsStr);

  // 根据构造器名设置类型
  let type: 'human' | 'ai' | 'tool' = 'human';
  if (constructorName === 'AIMessage') {
    type = 'ai';
  } else if (constructorName === 'ToolMessage') {
    type = 'tool';
  } else if (constructorName === 'HumanMessage') {
    type = 'human';
  }

  // 构建消息对象
  const message: any = {
    type,
    content: args.content || '',
    additional_kwargs: args.additional_kwargs || {},
    response_metadata: args.response_metadata || {},
    usage_metadata: args.usage_metadata || {},
  };

  if (args.id) {
    message.id = args.id;
  }

  if (type === 'ai') {
    if (args.tool_calls) {
      message.tool_calls = args.tool_calls;
    }
    if (args.refusal !== undefined) {
      message.refusal = args.refusal;
    }
  }

  if (type === 'tool') {
    if (args.tool_call_id) {
      message.tool_call_id = args.tool_call_id;
    }
    if (args.name) {
      message.name = args.name;
    }
  }

  return message as Message;
}

/**
 * 解析Python风格的关键字参数，如 content='test', additional_kwargs={}
 */
function parsePythonArgs(argsStr: string): Record<string, any> {
  const result: Record<string, any> = {};
  let pos = 0;

  while (pos < argsStr.length) {
    // 跳过空白字符
    while (pos < argsStr.length && /\s/.test(argsStr[pos])) {
      pos++;
    }

    if (pos >= argsStr.length) break;

    // 解析参数名
    const nameStart = pos;
    while (pos < argsStr.length && /[a-zA-Z0-9_]/.test(argsStr[pos])) {
      pos++;
    }

    if (pos === nameStart) {
      throw new Error(`无法解析参数名，位置 ${pos}`);
    }

    const paramName = argsStr.slice(nameStart, pos);

    // 跳过等号
    while (pos < argsStr.length && /\s/.test(argsStr[pos])) {
      pos++;
    }

    if (pos >= argsStr.length || argsStr[pos] !== '=') {
      throw new Error(`期望等号，位置 ${pos}`);
    }

    pos++; // 跳过等号

    // 跳过等号后的空白
    while (pos < argsStr.length && /\s/.test(argsStr[pos])) {
      pos++;
    }

    // 解析参数值
    const { value, nextPos } = parsePythonValue(argsStr, pos);
    result[paramName] = value;
    pos = nextPos;

    // 跳过逗号和空白
    while (pos < argsStr.length && (/\s/.test(argsStr[pos]) || argsStr[pos] === ',')) {
      pos++;
    }
  }

  return result;
}

/**
 * 解析Python值（字符串、数字、字典、列表、None等）
 */
function parsePythonValue(str: string, startPos: number): { value: any; nextPos: number } {
  let pos = startPos;

  // 跳过空白
  while (pos < str.length && /\s/.test(str[pos])) {
    pos++;
  }

  if (pos >= str.length) {
    throw new Error('期望值，但到达字符串末尾');
  }

  const firstChar = str[pos];

  // 字符串
  if (firstChar === "'" || firstChar === '"') {
    const quoteChar = firstChar;
    pos++;
    let value = '';
    let escapeNext = false;

    while (pos < str.length) {
      const char = str[pos];

      if (escapeNext) {
        value += char;
        escapeNext = false;
      } else if (char === '\\') {
        escapeNext = true;
      } else if (char === quoteChar) {
        pos++; // 跳过结束引号
        return { value, nextPos: pos };
      } else {
        value += char;
      }
      pos++;
    }

    throw new Error('未闭合的字符串');
  }

  // 数字
  if (/[0-9.-]/.test(firstChar)) {
    let numStr = '';
    while (pos < str.length && /[0-9.eE+-]/.test(str[pos])) {
      numStr += str[pos];
      pos++;
    }

    const num = parseFloat(numStr);
    if (isNaN(num)) {
      throw new Error(`无效的数字: ${numStr}`);
    }

    return { value: num, nextPos: pos };
  }

  // None
  if (str.substring(pos, pos + 4) === 'None') {
    pos += 4;
    return { value: null, nextPos: pos };
  }

  // True
  if (str.substring(pos, pos + 4) === 'True') {
    pos += 4;
    return { value: true, nextPos: pos };
  }

  // False
  if (str.substring(pos, pos + 5) === 'False') {
    pos += 5;
    return { value: false, nextPos: pos };
  }

  // 字典 {}
  if (firstChar === '{') {
    pos++; // 跳过{

    const dict: Record<string, any> = {};

    while (pos < str.length && /\s/.test(str[pos])) {
      pos++;
    }

    // 空字典
    if (str[pos] === '}') {
      pos++; // 跳过}
      return { value: dict, nextPos: pos };
    }

    while (pos < str.length) {
      // 跳过空白
      while (pos < str.length && /\s/.test(str[pos])) {
        pos++;
      }

      if (pos >= str.length) break;

      // 键（字符串或标识符）
      let key: string;
      if (str[pos] === "'" || str[pos] === '"') {
        const keyResult = parsePythonValue(str, pos);
        key = keyResult.value;
        pos = keyResult.nextPos;
      } else {
        let keyStart = pos;
        while (pos < str.length && /[a-zA-Z0-9_]/.test(str[pos])) {
          pos++;
        }
        key = str.slice(keyStart, pos);
      }

      // 跳过冒号
      while (pos < str.length && /\s/.test(str[pos])) {
        pos++;
      }

      if (pos >= str.length || str[pos] !== ':') {
        throw new Error(`期望冒号，位置 ${pos}`);
      }

      pos++; // 跳过冒号

      // 解析值
      const valueResult = parsePythonValue(str, pos);
      dict[key] = valueResult.value;
      pos = valueResult.nextPos;

      // 跳过逗号
      while (pos < str.length && /\s/.test(str[pos])) {
        pos++;
      }

      if (str[pos] === ',') {
        pos++; // 跳过逗号
      } else if (str[pos] === '}') {
        break;
      }
    }

    if (pos >= str.length || str[pos] !== '}') {
      throw new Error('期望}，但到达字符串末尾');
    }

    pos++; // 跳过}
    return { value: dict, nextPos: pos };
  }

  // 列表 []
  if (firstChar === '[') {
    pos++; // 跳过[

    const list: any[] = [];

    while (pos < str.length && /\s/.test(str[pos])) {
      pos++;
    }

    // 空列表
    if (str[pos] === ']') {
      pos++; // 跳过]
      return { value: list, nextPos: pos };
    }

    while (pos < str.length) {
      // 解析元素
      const elementResult = parsePythonValue(str, pos);
      list.push(elementResult.value);
      pos = elementResult.nextPos;

      // 跳过逗号
      while (pos < str.length && /\s/.test(str[pos])) {
        pos++;
      }

      if (str[pos] === ',') {
        pos++; // 跳过逗号
      } else if (str[pos] === ']') {
        break;
      }
    }

    if (pos >= str.length || str[pos] !== ']') {
      throw new Error('期望]，但到达字符串末尾');
    }

    pos++; // 跳过]
    return { value: list, nextPos: pos };
  }

  // 标识符（可能是变量名，这里不支持）
  let identStart = pos;
  while (pos < str.length && /[a-zA-Z0-9_]/.test(str[pos])) {
    pos++;
  }

  const ident = str.slice(identStart, pos);
  throw new Error(`无法识别的值: ${ident}`);
}