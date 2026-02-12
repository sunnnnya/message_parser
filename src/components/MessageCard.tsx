import { Card, CardContent, CardHeader, Typography, Box, Chip, Divider, Stack, Collapse, Button } from '@mui/material';
import { useState } from 'react';
import { Message, AIMessage, ToolMessage } from '../types/message';
import PersonIcon from '@mui/icons-material/Person';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BuildIcon from '@mui/icons-material/Build';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface MessageCardProps {
  message: Message;
  index: number;
}

const MessageCard = ({ message, index }: MessageCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const getTypeColor = () => {
    switch (message.type) {
      case 'human': return 'primary';
      case 'ai': return 'secondary';
      case 'tool': return 'success';
      default: return 'default';
    }
  };

  const getTypeIcon = () => {
    switch (message.type) {
      case 'human': return <PersonIcon />;
      case 'ai': return <SmartToyIcon />;
      case 'tool': return <BuildIcon />;
      default: return <PersonIcon />;
    }
  };

  const getTypeLabel = () => {
    switch (message.type) {
      case 'human': return 'HumanMessage';
      case 'ai': return 'AIMessage';
      case 'tool': return 'ToolMessage';
      default: return 'Unknown';
    }
  };

  const getCardHeaderColor = () => {
    switch (message.type) {
      case 'human': return 'primary.main';
      case 'ai': return 'secondary.main';
      case 'tool': return 'success.main';
      default: return 'grey.500';
    }
  };

  return (
    <Card sx={{ width: '100%', boxShadow: 3 }}>
      <CardHeader
        avatar={
          <Box sx={{ bgcolor: getCardHeaderColor(), color: 'white', p: 1, borderRadius: 1 }}>
            {getTypeIcon()}
          </Box>
        }
        title={
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6" component="div">
              {getTypeLabel()} #{index + 1}
            </Typography>
            <Chip label={message.type} color={getTypeColor()} size="small" />
          </Stack>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            ID: {message.id || 'N/A'}
          </Typography>
        }
        action={
          <Button
            size="small"
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Less' : 'More'}
          </Button>
        }
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" component="div" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            {message.content}
          </Typography>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }}>Details</Divider>

            {/* Tool Calls for AIMessage */}
            {message.type === 'ai' && (message as AIMessage).tool_calls && (message as AIMessage).tool_calls!.length > 0 && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Tool Calls ({(message as AIMessage).tool_calls!.length})
                </Typography>
                {(message as AIMessage).tool_calls!.map((tool, idx) => (
                  <Box key={idx} sx={{ ml: 1, mb: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="caption" fontWeight="bold">
                      {tool.name}
                    </Typography>
                    <Typography variant="caption" display="block">
                      ID: {tool.id}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Args: {JSON.stringify(tool.args)}
                    </Typography>
                    {tool.type && (
                      <Typography variant="caption" display="block">
                        Type: {tool.type}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {/* Tool Call ID for ToolMessage */}
            {message.type === 'tool' && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Tool Response
                </Typography>
                <Typography variant="caption" display="block">
                  Tool Call ID: {(message as ToolMessage).tool_call_id}
                </Typography>
                {(message as ToolMessage).name && (
                  <Typography variant="caption" display="block">
                    Name: {(message as ToolMessage).name}
                  </Typography>
                )}
              </Box>
            )}

            {/* Additional Metadata */}
            {(message.additional_kwargs && Object.keys(message.additional_kwargs).length > 0) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Additional Kwargs
                </Typography>
                <Box component="pre" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.75rem', overflow: 'auto' }}>
                  {JSON.stringify(message.additional_kwargs, null, 2)}
                </Box>
              </Box>
            )}

            {/* Response Metadata */}
            {message.response_metadata && Object.keys(message.response_metadata).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Response Metadata
                </Typography>
                <Box component="pre" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.75rem', overflow: 'auto' }}>
                  {JSON.stringify(message.response_metadata, null, 2)}
                </Box>
              </Box>
            )}

            {/* Usage Metadata */}
            {message.usage_metadata && Object.keys(message.usage_metadata).length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Usage Metadata
                </Typography>
                <Box component="pre" sx={{ p: 1, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.75rem', overflow: 'auto' }}>
                  {JSON.stringify(message.usage_metadata, null, 2)}
                </Box>
              </Box>
            )}

            {/* Refusal for AIMessage */}
            {message.type === 'ai' && (message as AIMessage).refusal !== undefined && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Refusal
                </Typography>
                <Typography variant="body2">
                  {(message as AIMessage).refusal === null ? 'null' : (message as AIMessage).refusal}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default MessageCard;