import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, GraduationCap, Building } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { formatIndianCurrency } from '@/lib/utils';
import api from '@/lib/api';
import { CareerRecommendation } from '@/types/models';

export default function CareerPage() {
  const { data: careers, isLoading } = useQuery<CareerRecommendation[]>({
    queryKey: ['career-recommendations'],
    queryFn: async () => (await api.get('/student/career/recommendations')).data.data,
  });

  if (isLoading) return <LoadingSpinner className="mt-16" />;

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Career Guidance"
        subtitle="AI-powered career recommendations based on your profile"
      />

      <div className="space-y-4">
        {careers?.map((career, i) => (
          <motion.div
            key={career.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
                  <Briefcase className="h-5 w-5 text-[var(--color-primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-semibold text-[var(--color-text)]">{career.title}</h3>
                      <Badge variant="info" className="mt-1">{career.field}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[var(--color-primary)]">{career.matchPercent}%</p>
                      <p className="text-xs text-[var(--color-text-muted)]">match</p>
                    </div>
                  </div>

                  <ProgressBar value={career.matchPercent} color="var(--color-primary)" height={4} className="mt-2 mb-3" />

                  <p className="text-xs text-[var(--color-text-secondary)] mb-3">{career.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> Salary Range
                      </p>
                      <p className="text-sm font-medium text-[var(--color-text)]">
                        {career.salaryRangeMin}–{career.salaryRangeMax} LPA
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" /> Entrance Exams
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {career.entranceExams.slice(0, 2).map(e => (
                          <span key={e} className="text-xs bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded text-[var(--color-text-secondary)]">{e}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
                        <Building className="h-3 w-3" /> Top Colleges
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{career.topColleges.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Key Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {career.keySkills.slice(0, 4).map(skill => (
                        <Badge key={skill} variant="primary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
