import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box, Card, CardContent, Typography, Avatar, Chip, Button, Grid,
  TextField, Divider, MenuItem, Select, FormControl, InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import BookOpenIcon from '@mui/icons-material/MenuBook';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShieldIcon from '@mui/icons-material/Shield';
import TargetIcon from '@mui/icons-material/TrackChanges';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { maskAPAAR, maskMobile, getInitials } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { CAREER_PATHS, INTERESTS } from '@/lib/constants';
import { APAARStatus } from '@/types/enums';
import api from '@/lib/api';

type TabKey = 'personal' | 'academic' | 'interests';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function ProfilePage() {
  const { student, updateStudent } = useAuthStore();
  const { addToast } = useUIStore();
  const [tab, setTab] = useState<TabKey>('personal');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    interests: student?.interests || [],
    careerGoal: student?.careerGoal || '',
    dreamCollege: student?.dreamCollege || '',
  });

  if (!student) return null;

  const saveMutation = useMutation({
    mutationFn: async (data: typeof editData) => {
      await api.patch('/student/profile', data);
    },
    onSuccess: () => {
      updateStudent(editData);
      setEditing(false);
      addToast({ type: 'success', title: 'Profile Updated', description: 'Your profile has been saved.' });
    },
    onError: (err: any) => {
      addToast({ type: 'error', title: 'Failed', description: err.message });
    },
  });

  const toggleInterest = (interest: string) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'personal', label: 'Personal', icon: <ShieldIcon sx={{ fontSize: 18 }} /> },
    { key: 'academic', label: 'Academic', icon: <BookOpenIcon sx={{ fontSize: 18 }} /> },
    { key: 'interests', label: 'Interests', icon: <FavoriteIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <Box sx={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card
          elevation={2}
          sx={{
            borderRadius: '24px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
            position: 'relative',
          }}
        >
          {/* Decorative circles */}
          <Box
            sx={{
              position: 'absolute', top: -32, right: -32, width: 160, height: 160,
              borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
            }}
          />
          <Box
            sx={{
              position: 'absolute', bottom: 0, left: '25%', width: 128, height: 128,
              borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', pointerEvents: 'none',
            }}
          />

          <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
              {/* Avatar */}
              <Box sx={{ position: 'relative', flexShrink: 0 }}>
                <Avatar
                  src={student.avatarUrl}
                  sx={{
                    width: 84, height: 84, fontSize: 30, fontWeight: 700,
                    bgcolor: 'rgba(255,255,255,0.2)', color: '#fff',
                    border: '4px solid rgba(255,255,255,0.3)',
                  }}
                >
                  {getInitials(student.name)}
                </Avatar>
              </Box>

              {/* Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h2" sx={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                  {student.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                  Class {student.class}-{student.section} · Roll No. {student.rollNumber}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                  <Chip
                    label={student.board}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: 11 }}
                  />
                  {student.apaarStatus === APAARStatus.VERIFIED && (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: 14, color: '#fff !important' }} />}
                      label="APAAR Verified"
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 700, fontSize: 11 }}
                    />
                  )}
                </Box>
              </Box>

              {/* Edit/Save button */}
              <Button
                variant="contained"
                size="small"
                startIcon={editing ? <SaveIcon /> : <EditIcon />}
                onClick={() => editing ? saveMutation.mutate(editData) : setEditing(true)}
                disabled={saveMutation.isPending}
                sx={{
                  borderRadius: '10px',
                  bgcolor: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  backdropFilter: 'blur(8px)',
                  fontWeight: 600,
                  textTransform: 'none',
                  flexShrink: 0,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                  boxShadow: 'none',
                }}
              >
                {editing ? (saveMutation.isPending ? 'Saving...' : 'Save') : 'Edit'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tab bar */}
      <Box
        sx={{
          display: 'flex', gap: 0.5, p: 0.5,
          borderRadius: '14px', bgcolor: 'action.hover',
          border: 1, borderColor: 'divider',
          width: 'fit-content',
        }}
      >
        {tabs.map(t => (
          <Button
            key={t.key}
            onClick={() => setTab(t.key)}
            startIcon={t.icon}
            size="small"
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 13,
              px: 2,
              py: 1,
              color: tab === t.key ? '#6366F1' : 'text.secondary',
              bgcolor: tab === t.key ? 'background.paper' : 'transparent',
              boxShadow: tab === t.key ? 1 : 'none',
              '&:hover': { bgcolor: tab === t.key ? 'background.paper' : 'action.hover' },
            }}
          >
            {t.label}
          </Button>
        ))}
      </Box>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'personal' && (
          <motion.div
            key="personal"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Card elevation={2} sx={{ borderRadius: '20px' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>Personal Information</Typography>
                <Grid container spacing={2}>
                  {[
                    { label: 'Full Name', value: student.name },
                    { label: 'Mobile', value: maskMobile(student.mobile) },
                    { label: 'Date of Birth', value: formatDate(student.dob) },
                    { label: 'Gender', value: student.gender.charAt(0).toUpperCase() + student.gender.slice(1) },
                    { label: 'Academic Year', value: student.academicYear },
                    { label: 'Language', value: student.language === 'en' ? 'English' : 'हिंदी' },
                  ].map(field => (
                    <Grid size={{ xs: 12, sm: 6 }} key={field.label}>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'action.hover' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                          {field.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{field.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {tab === 'academic' && (
          <motion.div
            key="academic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Card elevation={2} sx={{ borderRadius: '20px' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <SchoolIcon sx={{ color: '#6366F1' }} />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>School Information</Typography>
                </Box>
                <Grid container spacing={2}>
                  {[
                    { label: 'School Name', value: student.schoolName },
                    { label: 'Board', value: student.board },
                    { label: 'Class & Section', value: `Class ${student.class}-${student.section}` },
                    { label: 'Roll Number', value: student.rollNumber },
                    { label: 'UDISE Code', value: student.udiseCode },
                    { label: 'APAAR ID', value: maskAPAAR(student.apaarId) },
                  ].map(field => (
                    <Grid size={{ xs: 12, sm: 6 }} key={field.label}>
                      <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'action.hover' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                          {field.label}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{field.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 2.5 }} />

                <Box
                  sx={{
                    p: 2, borderRadius: '14px', display: 'flex', alignItems: 'center', gap: 2,
                    bgcolor: student.apaarStatus === APAARStatus.VERIFIED ? '#D1FAF0' : '#FEF3C7',
                  }}
                >
                  <CheckCircleIcon
                    sx={{ color: student.apaarStatus === APAARStatus.VERIFIED ? '#10B981' : '#F59E0B', flexShrink: 0 }}
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: student.apaarStatus === APAARStatus.VERIFIED ? '#10B981' : '#F59E0B' }}
                    >
                      APAAR Status: {student.apaarStatus.charAt(0).toUpperCase() + student.apaarStatus.slice(1)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {student.apaarStatus === APAARStatus.VERIFIED
                        ? 'Your APAAR ID is verified and linked.'
                        : 'Please complete APAAR verification.'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {tab === 'interests' && (
          <motion.div
            key="interests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Career Goals */}
              <Card elevation={2} sx={{ borderRadius: '20px' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <TargetIcon sx={{ color: '#6366F1' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Career Goals</Typography>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                        Career Goal
                      </Typography>
                      {editing ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={editData.careerGoal}
                            onChange={(e: SelectChangeEvent) => setEditData(p => ({ ...p, careerGoal: e.target.value }))}
                            displayEmpty
                            sx={{ borderRadius: '12px' }}
                          >
                            <MenuItem value=""><em>Select career goal...</em></MenuItem>
                            {CAREER_PATHS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                          </Select>
                        </FormControl>
                      ) : (
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {student.careerGoal || <Box component="span" sx={{ color: 'text.disabled' }}>Not set</Box>}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                        Dream College
                      </Typography>
                      {editing ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={editData.dreamCollege}
                          onChange={e => setEditData(p => ({ ...p, dreamCollege: e.target.value }))}
                          placeholder="e.g. IIT Delhi, IIM Ahmedabad..."
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                      ) : (
                        <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {student.dreamCollege || <Box component="span" sx={{ color: 'text.disabled' }}>Not set</Box>}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Interests */}
              <Card elevation={2} sx={{ borderRadius: '20px' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                    <FavoriteIcon sx={{ color: '#6366F1' }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>My Interests</Typography>
                  </Box>
                  {editing ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {INTERESTS.map(interest => {
                        const selected = editData.interests.includes(interest);
                        return (
                          <Chip
                            key={interest}
                            label={interest}
                            onClick={() => toggleInterest(interest)}
                            sx={{
                              fontWeight: 600,
                              cursor: 'pointer',
                              bgcolor: selected ? '#6366F1' : 'action.hover',
                              color: selected ? '#fff' : 'text.secondary',
                              border: selected ? 'none' : '1px solid',
                              borderColor: 'divider',
                              '&:hover': { bgcolor: selected ? '#4F46E5' : 'action.selected' },
                            }}
                          />
                        );
                      })}
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {student.interests.length > 0
                        ? student.interests.map(interest => (
                          <Chip
                            key={interest}
                            label={interest}
                            sx={{ bgcolor: '#6366F1', color: '#fff', fontWeight: 600 }}
                          />
                        ))
                        : (
                          <Typography variant="body2" color="text.secondary">
                            No interests added yet. Click Edit to add some!
                          </Typography>
                        )
                      }
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Save / Cancel */}
              {editing && (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<CancelIcon />}
                    onClick={() => setEditing(false)}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1.5 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<SaveIcon />}
                    onClick={() => saveMutation.mutate(editData)}
                    disabled={saveMutation.isPending}
                    sx={{
                      borderRadius: '12px', textTransform: 'none', fontWeight: 600, py: 1.5,
                      background: 'linear-gradient(135deg,#6366F1,#818CF8)',
                    }}
                  >
                    {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
