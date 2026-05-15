import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import { CheckCircle, Error, Warning, Info, Close } from '@mui/icons-material';
import { useUIStore } from '@/store/uiStore';

const iconMap = {
  success: <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />,
  error: <Error sx={{ fontSize: 20, color: 'error.main' }} />,
  warning: <Warning sx={{ fontSize: 20, color: 'warning.main' }} />,
  info: <Info sx={{ fontSize: 20, color: 'info.main' }} />,
};

export function NotificationToast() {
  const { toasts, removeToast } = useUIStore();

  return (
    <Box
      sx={{
        position: 'fixed', top: 16, right: 16, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 1,
        maxWidth: 360, width: '100%', pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{ pointerEvents: 'auto' }}
          >
            <Paper
              elevation={4}
              sx={{
                p: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5,
                borderRadius: 2.5, border: '1px solid', borderColor: 'divider',
              }}
            >
              {iconMap[toast.type]}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {toast.title}
                </Typography>
                {toast.description && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.25, display: 'block' }}>
                    {toast.description}
                  </Typography>
                )}
              </Box>
              <IconButton
                size="small"
                onClick={() => removeToast(toast.id)}
                sx={{ color: 'text.disabled', flexShrink: 0, p: 0.25 }}
                aria-label="Close notification"
              >
                <Close sx={{ fontSize: 16 }} />
              </IconButton>
            </Paper>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
}
