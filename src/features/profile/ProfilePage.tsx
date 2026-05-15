import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Edit2, Camera, School, BookOpen, Star, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { maskAPAAR, maskMobile, getInitials } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { CAREER_PATHS, INTERESTS } from '@/lib/constants';
import { APAARStatus } from '@/types/enums';
import api from '@/lib/api';

export default function ProfilePage() {
  const { student, updateStudent } = useAuthStore();
  const { addToast } = useUIStore();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    interests: student?.interests || [],
    careerGoal: student?.careerGoal || '',
    dreamCollege: student?.dreamCollege || '',
  });
  const [saving, setSaving] = useState(false);

  if (!student) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.patch('/student/profile', editData);
      updateStudent(editData);
      setEditing(false);
      addToast({ type: 'success', title: 'Profile Updated', description: 'Your profile has been updated.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed', description: err.message });
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setEditData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="My Profile">
        {!editing ? (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
            <Button size="sm" loading={saving} onClick={handleSave}>Save Changes</Button>
          </div>
        )}
      </PageHeader>

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="relative">
              {student.avatarUrl ? (
                <img src={student.avatarUrl} alt={student.name} className="w-20 h-20 rounded-full object-cover bg-[var(--color-surface-2)]" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{getInitials(student.name)}</span>
                </div>
              )}
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                <Camera className="h-3 w-3 text-white" />
              </button>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--color-text)]">{student.name}</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Class {student.class}-{student.section} · Roll No. {student.rollNumber}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="primary">{student.board}</Badge>
                <Badge variant={student.apaarStatus === APAARStatus.VERIFIED ? 'success' : 'warning'}>
                  APAAR {student.apaarStatus}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
            {[
              { label: 'Mobile', value: maskMobile(student.mobile) },
              { label: 'Date of Birth', value: formatDate(student.dob) },
              { label: 'Gender', value: student.gender.charAt(0).toUpperCase() + student.gender.slice(1) },
              { label: 'Academic Year', value: student.academicYear },
            ].map(field => (
              <div key={field.label}>
                <p className="text-xs text-[var(--color-text-muted)]">{field.label}</p>
                <p className="text-sm font-medium text-[var(--color-text)]">{field.value}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* School Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><School className="h-4 w-4" />School Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'School', value: student.schoolName },
                { label: 'Board', value: student.board },
                { label: 'UDISE Code', value: student.udiseCode },
                { label: 'APAAR ID', value: maskAPAAR(student.apaarId) },
              ].map(field => (
                <div key={field.label}>
                  <p className="text-xs text-[var(--color-text-muted)]">{field.label}</p>
                  <p className="text-sm font-medium text-[var(--color-text)]">{field.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Career & Interests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-4 w-4" />Career & Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Career Goal</p>
                {editing ? (
                  <select
                    value={editData.careerGoal}
                    onChange={e => setEditData(prev => ({ ...prev, careerGoal: e.target.value }))}
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-primary)]"
                  >
                    <option value="">Select career goal</option>
                    {CAREER_PATHS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : (
                  <p className="text-sm text-[var(--color-text)]">{student.careerGoal || '—'}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-1">Dream College</p>
                {editing ? (
                  <input
                    value={editData.dreamCollege}
                    onChange={e => setEditData(prev => ({ ...prev, dreamCollege: e.target.value }))}
                    placeholder="e.g. IIT Delhi"
                    className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:border-[var(--color-primary)]"
                  />
                ) : (
                  <p className="text-sm text-[var(--color-text)]">{student.dreamCollege || '—'}</p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-2">Interests</p>
                {editing ? (
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${editData.interests.includes(interest) ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'}`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {student.interests.map(interest => (
                      <Badge key={interest} variant="primary">{interest}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
