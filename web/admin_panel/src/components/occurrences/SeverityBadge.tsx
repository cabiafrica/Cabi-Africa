import React from 'react';
import { Chip } from '@mui/material';
import { OccurrenceSeverity, SEVERITY_COLORS } from '../../types/occurrence.types';

interface SeverityBadgeProps {
    severity: OccurrenceSeverity;
    size?: 'small' | 'medium';
}

export default function SeverityBadge({ severity, size = 'small' }: SeverityBadgeProps) {
    return (
        <Chip
            label={`${severity} SEVERITY`}
            size={size}
            sx={{
                bgcolor: SEVERITY_COLORS[severity] + '20',
                color: SEVERITY_COLORS[severity],
                fontWeight: 'bold',
            }}
        />
    );
}
