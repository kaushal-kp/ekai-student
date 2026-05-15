import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, School, Target, Shield, CheckCircle, Edit3, X, Save, BookOpen, Heart } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { maskAPAAR, maskMobile, getInitials } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { CAREER_PATHS, INTERESTS } from '@/lib/constants';
import { APAARStatus } from '@/types/enums';
import api from '@/lib/api';

type TabKey = 'personal' | 'academic' | 'interests';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
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
    { key: 'personal', label: 'Personal', icon: <Shield className="h-4 w-4" /> },
    { key: 'academic', label: 'Academic', icon: <BookOpen className="h-4 w-4" /> },
    { key: 'interests', label: 'Interests', icon: <Heart className="h-4 w-4" /> },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[24px] overflow-hidden"
        style={{ background: 'var(--gradient-hero)' }}
      >
        {/* Decorative circles */}
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10 bg-white" />
            <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full opacity-10 bg-white" />
          </div>

          <div className="relative z-10 p-8 pb-6">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {student.avatarUrl ? (
                  <img
                    src={student.avatarUrl}
                    alt={student.name}
                    className="w-[84px] h-[84px] rounded-full object-cover ring-4 ring-white/30"
                  />
                ) : (
                  <div
                    className="w-[84px] h-[84px] rounded-full flex items-center justify-center text-white text-[30px] font-bold ring-4 ring-white/30"
                    style={{ background: 'rgba(255,255,255,0.2)' }}
                  >
                    {getInitials(student.name)}
                  </div>
                )}
                <button
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-[24px] font-bold text-white leading-tight">{student.name}</h1>
                <p className="text-white/70 text-[14px] mt-0.5">Class {student.class}-{student.section} · Roll No. {student.rollNumber}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold text-white"
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                    {student.board}
                  </span>
                  {student.apaarStatus === APAARStatus.VERIFIED && (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold text-white"
                      style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                      <CheckCircle className="h-3 w-3" /> APAAR Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={() => editing ? saveMutation.mutate(editData) : setEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              >
                {editing ? <><Save className="h-4 w-4" /> Save</> : <><Edit3 className="h-4 w-4" /> Edit</>}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-[14px] bg-[var(--color-surface-2)] border border-[var(--color-border)] w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold transition-all"
            style={tab === t.key ? { color: 'var(--color-primary)' } : { color: 'var(--color-text-secondary)' }}
          >
            {tab === t.key && (
              <motion.div
                layoutId="profile-tab-indicator"
                className="absolute inset-0 rounded-[10px]"
                style={{ background: 'var(--color-surface)', boxShadow: 'var(--shadow-sm)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">{t.icon}{t.label}</span>
          </button>
        ))}
      </div>

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
            <div className="rounded-[20px] p-6 space-y-4 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
              <h3 className="text-[15px] font-bold text-[var(--color-text)] mb-2">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: student.name },
                  { label: 'Mobile', value: maskMobile(student.mobile) },
                  { label: 'Date of Birth', value: formatDate(student.dob) },
                  { label: 'Gender', value: student.gender.charAt(0).toUpperCase() + student.gender.slice(1) },
                  { label: 'Academic Year', value: student.academicYear },
                  { label: 'Language', value: student.language === 'en' ? 'English' : 'हिंदी' },
                ].map(field => (
                  <div key={field.label} className="p-3 rounded-[12px]" style={{ background: 'var(--color-surface-2)' }}>
                    <p className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">{field.label}</p>
                    <p className="text-[13px] font-semibold text-[var(--color-text)]">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="rounded-[20px] p-6 space-y-4 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
              <h3 className="text-[15px] font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
                <School className="h-5 w-5" style={{ color: 'var(--color-primary)' }} /> School Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'School Name', value: student.schoolName },
                  { label: 'Board', value: student.board },
                  { label: 'Class & Section', value: `Class ${student.class}-${student.section}` },
                  { label: 'Roll Number', value: student.rollNumber },
                  { label: 'UDISE Code', value: student.udiseCode },
                  { label: 'APAAR ID', value: maskAPAAR(student.apaarId) },
                ].map(field => (
                  <div key={field.label} className="p-3 rounded-[12px]" style={{ background: 'var(--color-surface-2)' }}>
                    <p className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1">{field.label}</p>
                    <p className="text-[13px] font-semibold text-[var(--color-text)]">{field.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-[14px] flex items-center gap-3"
                style={{ background: student.apaarStatus === APAARStatus.VERIFIED ? 'var(--color-success-light)' : 'var(--color-warning-light)' }}>
                <CheckCircle className="h-5 w-5 flex-shrink-0"
                  style={{ color: student.apaarStatus === APAARStatus.VERIFIED ? 'var(--color-success)' : 'var(--color-warning)' }} />
                <div>
                  <p className="text-[13px] font-bold"
                    style={{ color: student.apaarStatus === APAARStatus.VERIFIED ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    APAAR Status: {student.apaarStatus.charAt(0).toUpperCase() + student.apaarStatus.slice(1)}
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    {student.apaarStatus === APAARStatus.VERIFIED
                      ? 'Your APAAR ID is verified and linked.'
                      : 'Please complete APAAR verification.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === 'interests' && (
          <motion.div
            key="interests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
              <h3 className="text-[15px] font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" style={{ color: 'var(--color-primary)' }} /> Career Goals
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--color-text-secondary)] mb-2">Career Goal</label>
                  {editing ? (
                    <select
                      value={editData.careerGoal}
                      onChange={e => setEditData(p => ({ ...p, careerGoal: e.target.value }))}
                      className="w-full px-4 py-3 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    >
                      <option value="">Select career goal...</option>
                      {CAREER_PATHS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <p className="text-[14px] font-medium text-[var(--color-text)] px-4 py-3 rounded-[12px] bg-[var(--color-surface-2)]">
                      {student.careerGoal || <span className="text-[var(--color-text-muted)]">Not set</span>}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[var(--color-text-secondary)] mb-2">Dream College</label>
                  {editing ? (
                    <input
                      value={editData.dreamCollege}
                      onChange={e => setEditData(p => ({ ...p, dreamCollege: e.target.value }))}
                      placeholder="e.g. IIT Delhi, IIM Ahmedabad..."
                      className="w-full px-4 py-3 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[13px] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                    />
                  ) : (
                    <p className="text-[14px] font-medium text-[var(--color-text)] px-4 py-3 rounded-[12px] bg-[var(--color-surface-2)]">
                      {student.dreamCollege || <span className="text-[var(--color-text-muted)]">Not set</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[20px] p-6 bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
              <h3 className="text-[15px] font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5" style={{ color: 'var(--color-primary)' }} /> My Interests
              </h3>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
                      style={editData.interests.includes(interest) ? {
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        boxShadow: 'var(--shadow-glow)',
                      } : {
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {student.interests.map(interest => (
                    <span
                      key={interest}
                      className="px-4 py-1.5 rounded-full text-[13px] font-semibold text-white"
                      style={{ background: 'var(--gradient-primary)' }}
                    >
                      {interest}
                    </span>
                  ))}
                  {student.interests.length === 0 && (
                    <p className="text-[13px] text-[var(--color-text-muted)]">No interests added yet. Click Edit to add some!</p>
                  )}
                </div>
              )}
            </div>

            {editing && (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 rounded-[12px] text-[13px] font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-2)] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveMutation.mutate(editData)}
                  disabled={saveMutation.isPending}
                  className="flex-1 py-3 rounded-[12px] text-[13px] font-semibold text-white transition-all disabled:opacity-60"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
