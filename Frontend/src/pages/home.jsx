import React, { useContext, useState } from 'react';
import { Box, Button, Paper, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const generateMeetingCode = () => Math.random().toString(36).slice(2, 8);

export default function HomeComponent() {
  const [meetingCode, setMeetingCode] = useState('');
  const navigate = useNavigate();
  const { addToUserHistory } = useContext(AuthContext);

  const joinMeeting = async () => {
    const code = meetingCode.trim() || generateMeetingCode();

    try {
      await addToUserHistory(code);
    } catch {
      // Keep navigation functional even if history endpoint is unavailable.
    }

    navigate(`/${code}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 2,
        background: 'linear-gradient(120deg, #0f172a 0%, #1d4ed8 60%, #38bdf8 100%)',
      }}
    >
      <Paper sx={{ p: 4, width: '100%', maxWidth: 520 }} elevation={8}>
        <Typography variant='h4' sx={{ mb: 1, fontWeight: 700 }}>
          Meeting Lobby
        </Typography>
        <Typography variant='body1' sx={{ mb: 3, color: 'text.secondary' }}>
          Enter a code to join, or leave it blank to create a new instant room.
        </Typography>

        <TextField
          fullWidth
          label='Meeting Code'
          value={meetingCode}
          onChange={(e) => setMeetingCode(e.target.value)}
          placeholder='example: team-sync'
        />

        <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
          <Button variant='contained' onClick={joinMeeting}>
            Join or Create
          </Button>
          <Button variant='outlined' onClick={() => navigate('/history')}>
            History
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}