import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ArticleIcon from '@mui/icons-material/Article';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { APAARStatus } from '@/types/enums';
import api from '@/lib/api';
import { formatDate } from '@/lib/formatters';

const INFO_ITEMS = [
  { icon: '🎓', title: 'Lifelong ID', desc: 'Follows you throughout your education journey' },
  { icon: '🔒', title: 'Secure', desc: 'Linked to Aadhaar with consent-based access' },
  { icon: '📜', title: 'Digital Records', desc: 'All academic achievements stored digitally' },
  { icon: '🌐', title: 'Portable', desc: 'Recognized across all educational institutions' },
];

export default function APAARPage() {
  const { student } = useAuthStore();
  const { addToast } = useUIStore();
  const [showAPAAR, setShowAPAAR] = useState(false);

  const { data: apaarData, isLoading } = useQuery({
    queryKey: ['apaar'],
    queryFn: async () => (await api.get('/student/apaar')).data.data,
  });

  const isVerified = student?.apaarStatus === APAARStatus.VERIFIED;

  const handleCopy = () => {
    if (student?.apaarId) {
      navigator.clipboard.writeText(student.apaarId);
      addToast({ type: 'success', title: 'Copied', description: 'APAAR ID copied to clipboard' });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 768 }}>
      <PageHeader
        title="APAAR Record"
        subtitle="Academic Bank of Credits - Your Digital Academic Passport"
      />

      {/* Status + ID Card */}
      <Card elevation={2} sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: isVerified ? 'success.light' : 'warning.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldIcon sx={{ fontSize: 32, color: isVerified ? 'success.main' : 'warning.main' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>APAAR Account</Typography>
                <Chip
                  label={isVerified ? '✓ Verified' : 'Pending'}
                  size="small"
                  color={isVerified ? 'success' : 'warning'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {isVerified
                  ? 'Your APAAR account is verified and linked to your academic records.'
                  : 'Your APAAR verification is in progress.'}
              </Typography>
            </Box>
          </Box>

          {/* APAAR ID display */}
          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 1 }}>
            APAAR ID
          </Typography>
          <TextField
            fullWidth
            value={showAPAAR ? (student?.apaarId || '') : 'APAAR-DL-2025-XXXXXX'}
            slotProps={{
              input: {
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: 14 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowAPAAR(s => !s)} aria-label="Toggle visibility">
                      {showAPAAR ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                    <IconButton size="small" onClick={handleCopy} aria-label="Copy APAAR ID">
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
            size="small"
          />

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5 }}>
            <Button variant="contained" startIcon={<ShareIcon />} sx={{ borderRadius: 2 }}>
              Share
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} sx={{ borderRadius: 2 }}>
              Download
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* QR Code section */}
      <Card elevation={2} sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>QR Code</Typography>
          <Box
            sx={{
              width: 160,
              height: 160,
              borderRadius: '12px',
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <QrCode2Icon sx={{ fontSize: 80, color: 'text.disabled' }} />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Scan to verify your APAAR identity
          </Typography>
        </CardContent>
      </Card>

      {/* What is APAAR */}
      <Card elevation={2} sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>What is APAAR?</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2.5 }}>
            APAAR (Automated Permanent Academic Account Registry) is a unique ID issued by the Government of India under
            the National Education Policy 2020. It stores your complete academic journey digitally — from school to
            higher education — and is linked to your Aadhaar for verification.
          </Typography>
          <Grid container spacing={1.5}>
            {INFO_ITEMS.map(item => (
              <Grid size={{ xs: 6 }} key={item.title}>
                <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '12px' }}>
                  <Typography sx={{ fontSize: 18, mb: 0.5 }}>{item.icon}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.25 }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{item.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Linked documents / Academic Records */}
      {apaarData?.records && (
        <Card elevation={2} sx={{ borderRadius: '16px' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Academic Records</Typography>
            <List disablePadding>
              {apaarData.records.map((record: any, index: number) => (
                <ListItem
                  key={record.year}
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: 'action.hover',
                    borderRadius: '12px',
                    mb: index < apaarData.records.length - 1 ? 1 : 0,
                    gap: 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <CheckCircleIcon
                      sx={{ fontSize: 18, color: record.verified ? 'success.main' : 'text.disabled' }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{record.school}</Typography>
                    }
                    secondary={
                      <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                        Class {record.class} · {record.year}
                      </Typography>
                    }
                  />
                  <Chip
                    label={record.verified ? 'Verified' : 'Pending'}
                    size="small"
                    color={record.verified ? 'success' : 'default'}
                    sx={{ fontWeight: 600 }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
