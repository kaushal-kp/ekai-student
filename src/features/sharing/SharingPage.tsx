import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Link2Icon from '@mui/icons-material/Link';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import ShareIcon from '@mui/icons-material/Share';
import { PageHeader } from '@/components/shared/PageHeader';
import { useUIStore } from '@/store/uiStore';
import { formatDate, formatRelativeTime } from '@/lib/formatters';
import api from '@/lib/api';
import { ShareLink } from '@/types/models';

export default function SharingPage() {
  const { addToast } = useUIStore();
  const qc = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: links, isLoading } = useQuery<ShareLink[]>({
    queryKey: ['share-links'],
    queryFn: async () => (await api.get('/student/sharing/links')).data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/student/sharing/links/${id}`),
    onSuccess: () => {
      addToast({ type: 'success', title: 'Link Deleted' });
      qc.invalidateQueries({ queryKey: ['share-links'] });
      setDeleteId(null);
    },
  });

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast({ type: 'success', title: 'Link Copied', description: 'Share link copied to clipboard' });
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
      <PageHeader title="Share Profile" subtitle="Control who can see your academic data">
        <Button variant="contained" size="small" startIcon={<AddIcon />} sx={{ borderRadius: 2 }}>
          New Link
        </Button>
      </PageHeader>

      {/* Privacy note */}
      <Card elevation={0} sx={{ borderRadius: '12px', bgcolor: '#6366F115', border: '1px solid #6366F130', mb: 3 }}>
        <CardContent sx={{ p: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5, '&:last-child': { pb: 2 } }}>
          <LockIcon sx={{ fontSize: 18, color: '#6366F1', mt: 0.1, flexShrink: 0 }} />
          <Typography variant="body2" sx={{ color: '#6366F1', fontSize: 12, lineHeight: 1.6 }}>
            You control who sees your data. Each link has custom permissions and can be revoked at any time.
            Links never share your APAAR ID unless explicitly enabled.
          </Typography>
        </CardContent>
      </Card>

      {/* Share options */}
      <Card elevation={2} sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Share Via</Typography>
          <List disablePadding>
            {[
              { icon: <WhatsAppIcon sx={{ color: '#25D366' }} />, label: 'WhatsApp', sublabel: 'Share on WhatsApp' },
              { icon: <EmailIcon sx={{ color: '#6366F1' }} />, label: 'Email', sublabel: 'Send via email' },
              { icon: <ContentCopyIcon sx={{ color: '#6B7280' }} />, label: 'Copy Link', sublabel: 'Copy to clipboard', onClick: () => links?.[0] && handleCopy(links[0].url) },
            ].map(item => (
              <ListItemButton
                key={item.label}
                onClick={item.onClick}
                sx={{ borderRadius: '10px', px: 1.5, py: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>}
                  secondary={<Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{item.sublabel}</Typography>}
                />
              </ListItemButton>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Privacy settings */}
      <Card elevation={2} sx={{ borderRadius: '16px', mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Privacy Settings</Typography>
          <List disablePadding>
            {[
              { label: 'Show Basic Info', sublabel: 'Name, class, school' },
              { label: 'Show Attendance', sublabel: 'Overall attendance summary' },
              { label: 'Show Marks', sublabel: 'Exam results and grades' },
              { label: 'Show Achievements', sublabel: 'Badges and accomplishments' },
            ].map((setting, i) => (
              <ListItem key={setting.label} sx={{ px: 0, py: 0.75 }}>
                <ListItemText
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{setting.label}</Typography>}
                  secondary={<Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{setting.sublabel}</Typography>}
                />
                <Switch defaultChecked={i < 2} color="primary" size="small" />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Existing links */}
      {!links?.length ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontSize: 48, mb: 2 }}>🔗</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>No share links yet</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Create shareable links to share your profile with colleges or employers.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {links.map(link => (
            <Card key={link.id} elevation={2} sx={{ borderRadius: '16px' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '10px',
                        bgcolor: link.isActive ? '#6366F118' : 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Link2Icon sx={{ fontSize: 18, color: link.isActive ? '#6366F1' : 'text.disabled' }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{link.name}</Typography>
                        {!link.isActive && <Chip label="Inactive" size="small" sx={{ fontSize: 10 }} />}
                        {link.isPasswordProtected && (
                          <Chip
                            icon={<LockIcon sx={{ fontSize: 11 }} />}
                            label="Protected"
                            size="small"
                            color="warning"
                            sx={{ fontSize: 10 }}
                          />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: 12, color: 'text.disabled', mb: 1 }}>{link.purpose}</Typography>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <VisibilityIcon sx={{ fontSize: 13 }} />{link.views} views
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>
                          Created {formatRelativeTime(link.createdAt)}
                        </Typography>
                        {link.expiresAt && (
                          <Typography sx={{ fontSize: 12, color: 'warning.main' }}>
                            Expires {formatDate(link.expiresAt)}
                          </Typography>
                        )}
                      </Box>
                      {/* Permission chips */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {link.permissions.basicInfo && <Chip label="Basic Info" size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />}
                        {link.permissions.attendanceSummary && <Chip label="Attendance" size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />}
                        {link.permissions.marksDetails !== 'hidden' && (
                          <Chip label={`Marks (${link.permissions.marksDetails})`} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                        )}
                        {link.permissions.achievements && <Chip label="Achievements" size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />}
                        {link.permissions.apaarId && (
                          <Chip label="APAAR ID" size="small" color="warning" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                        )}
                      </Box>
                      {/* Generated link TextField */}
                      <TextField
                        fullWidth
                        value={link.url}
                        size="small"
                        sx={{ mt: 1.5 }}
                        slotProps={{
                          input: {
                            readOnly: true,
                            sx: { fontSize: 12 },
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton size="small" onClick={() => handleCopy(link.url)}>
                                  <ContentCopyIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }
                        }}
                      />
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteId(link.id)}
                    sx={{ color: 'error.main', flexShrink: 0 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} slotProps={{ paper: { sx: { borderRadius: '16px' } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Share Link</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete the link. Anyone with this link won&apos;t be able to access your profile anymore.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            sx={{ borderRadius: 2 }}
          >
            {deleteMutation.isPending ? <CircularProgress size={16} color="inherit" /> : 'Delete Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
