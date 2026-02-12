import { Message } from '../types/message';

export const sampleMessages: Message[] = [
  {
    type: 'human',
    id: '16b78ca6-e48f-46fd-9893-b19242dd9f16',
    content: '帮我查询一下现在北京的天气怎么样呢？',
    additional_kwargs: {},
    response_metadata: {},
  },
  {
    type: 'ai',
    id: 'lc_run--f1de0ad5-3632-408f-bc89-ee82a0e0c09f-0',
    content: '我来帮您查询北京的天气情况。',
    additional_kwargs: { refusal: null },
    response_metadata: {
      token_usage: { completion_tokens: 51, prompt_tokens: 668, total_tokens: 719, completion_tokens_details: null, prompt_tokens_details: { audio_tokens: null, cached_tokens: 640 }, prompt_cache_hit_tokens: 640, prompt_cache_miss_tokens: 28 },
      model_provider: 'deepseek',
      model_name: 'deepseek-chat',
      system_fingerprint: 'fp_eaab8d114b_prod0820_fp8_kvcache',
      id: 'a09e5e3c-7f22-482b-8222-cf5f193c957b',
      finish_reason: 'tool_calls',
      logprobs: null,
    },
    usage_metadata: { input_tokens: 668, output_tokens: 51, total_tokens: 719 },
    tool_calls: [
      {
        id: 'call_00_UV1Sx4YrTmFiZb4PPth5vH2z',
        name: 'query_weather',
        args: { city: '北京' },
        type: 'tool_call',
      },
    ],
  },
  {
    type: 'tool',
    id: 'tool-response-123',
    content: '北京当前天气晴朗，气温 25°C，湿度 45%，风速 3m/s。',
    additional_kwargs: {},
    response_metadata: {},
    tool_call_id: 'call_00_UV1Sx4YrTmFiZb4PPth5vH2z',
    name: 'query_weather',
  },
];

export const rawSampleData = [
  {
    content: '帮我查询一下现在北京的天气怎么样呢？',
    additional_kwargs: {},
    response_metadata: {},
    id: '16b78ca6-e48f-46fd-9893-b19242dd9f16',
  },
  {
    content: '我来帮您查询北京的天气情况。',
    additional_kwargs: { refusal: null },
    response_metadata: {
      token_usage: { completion_tokens: 51, prompt_tokens: 668, total_tokens: 719, completion_tokens_details: null, prompt_tokens_details: { audio_tokens: null, cached_tokens: 640 }, prompt_cache_hit_tokens: 640, prompt_cache_miss_tokens: 28 },
      model_provider: 'deepseek',
      model_name: 'deepseek-chat',
      system_fingerprint: 'fp_eaab8d114b_prod0820_fp8_kvcache',
      id: 'a09e5e3c-7f22-482b-8222-cf5f193c957b',
      finish_reason: 'tool_calls',
      logprobs: null,
    },
    id: 'lc_run--f1de0ad5-3632-408f-bc89-ee82a0e0c09f-0',
    tool_calls: [
      {
        name: 'query_weather',
        args: { city: '北京' },
        id: 'call_00_UV1Sx4YrTmFiZb4PPth5vH2z',
        type: 'tool_call',
      },
    ],
    usage_metadata: { input_tokens: 668, output_tokens: 51, total_tokens: 719 },
  },
  {
    content: '北京当前天气晴朗，气温 25°C，湿度 45%，风速 3m/s。',
    additional_kwargs: {},
    response_metadata: {},
    id: 'tool-response-123',
    tool_call_id: 'call_00_UV1Sx4YrTmFiZb4PPth5vH2z',
    name: 'query_weather',
  },
];

export const pythonSampleData = `[HumanMessage(content='帮我查询一下现在北京的天气怎么样呢？', additional_kwargs={}, response_metadata={}, id='16b78ca6-e48f-46fd-9893-b19242dd9f16'), AIMessage(content='我来帮您查询北京的天气情况。', additional_kwargs={'refusal': None}, response_metadata={'token_usage': {'completion_tokens': 51, 'prompt_tokens': 668, 'total_tokens': 719, 'completion_tokens_details': None, 'prompt_tokens_details': {'audio_tokens': None, 'cached_tokens': 640}, 'prompt_cache_hit_tokens': 640, 'prompt_cache_miss_tokens': 28}, 'model_provider': 'deepseek', 'model_name': 'deepseek-chat', 'system_fingerprint': 'fp_eaab8d114b_prod0820_fp8_kvcache', 'id': 'a09e5e3c-7f22-482b-8222-cf5f193c957b', 'finish_reason': 'tool_calls', 'logprobs': None}, id='lc_run--f1de0ad5-3632-408f-bc89-ee82a0e0c09f-0', tool_calls=[{'name': 'query_weather', 'args': {'city': '北京'}, 'id': 'call_00_UV1Sx4YrTmFiZb4PPth5vH2z', 'type': 'tool_call'}], usage_metadata={'input_tokens': 668, 'output_tokens': 51, 'total_tokens': 719}), ToolMessage(content='北京当前天气晴朗，气温 25°C，湿度 45%，风速 3m/s。', additional_kwargs={}, response_metadata={}, id='tool-response-123', tool_call_id='call_00_UV1Sx4YrTmFiZb4PPth5vH2z', name='query_weather')]`;