import React, { useEffect, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';

export function ChatPanel({ socket, api, phoneNumber }) {
  console.log('[ChatPanel] render');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    console.log('[ChatPanel] effect: subscribe messages');
    socket.on('chat:message', (msg) => {
      console.log('[ChatPanel] message received', msg);
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      console.log('[ChatPanel] cleanup: off message');
      socket.off('chat:message');
    };
  }, [socket]);

  const send = () => {
    console.log('[ChatPanel] send start', text);
    const msg = { from: phoneNumber, text, ts: Date.now() };
    socket.emit('chat:message', msg);
    setMessages((prev) => [...prev, msg]);
    setText('');
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>Message</Typography>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1}>
            <TextField fullWidth placeholder="Reply message" value={text} onChange={(e) => setText(e.target.value)} />
            <Button variant="contained" onClick={send}>Send</Button>
          </Stack>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {messages.map((m, i) => (
              <li key={i}>{m.from}: {m.text}</li>
            ))}
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}


