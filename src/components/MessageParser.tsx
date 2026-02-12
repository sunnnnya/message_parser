import { Box, Typography, Chip, Stack } from '@mui/material';
import { Message } from '../types/message';

interface MessageParserProps {
  messages: Message[];
}

const MessageParser = ({ messages }: MessageParserProps) => {
  const humanCount = messages.filter(m => m.type === 'human').length;
  const aiCount = messages.filter(m => m.type === 'ai').length;
  const toolCount = messages.filter(m => m.type === 'tool').length;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Parsed Message Summary
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Chip
          label={`HumanMessage: ${humanCount}`}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
        <Chip
          label={`AIMessage: ${aiCount}`}
          color="secondary"
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
        <Chip
          label={`ToolMessage: ${toolCount}`}
          color="success"
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      </Stack>
      <Box sx={{ maxHeight: 400, overflowY: 'auto', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
        {messages.map((message, index) => (
          <Box key={message.id || index} sx={{ mb: 2, p: 2, bgcolor: 'white', borderRadius: 1, boxShadow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {message.type === 'human' ? 'HumanMessage' : message.type === 'ai' ? 'AIMessage' : 'ToolMessage'}
              </Typography>
              <Chip
                label={message.type}
                size="small"
                color={
                  message.type === 'human' ? 'primary' :
                  message.type === 'ai' ? 'secondary' : 'success'
                }
                variant="filled"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              ID: {message.id || 'N/A'}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, mb: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
              {message.content}
            </Typography>
            {message.type === 'ai' && message.tool_calls && message.tool_calls.length > 0 && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold">
                  Tool Calls: {message.tool_calls.length}
                </Typography>
                {message.tool_calls.map((tool, idx) => (
                  <Box key={idx} sx={{ ml: 1, mt: 0.5 }}>
                    <Typography variant="caption">
                      {tool.name}({JSON.stringify(tool.args)})
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            {message.type === 'tool' && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="caption" fontWeight="bold">
                  Tool Call ID: {message.tool_call_id}
                </Typography>
                {message.name && (
                  <Typography variant="caption" display="block">
                    Name: {message.name}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MessageParser;