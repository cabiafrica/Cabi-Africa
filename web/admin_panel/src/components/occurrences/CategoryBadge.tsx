import React from 'react';
import { Chip, Box } from '@mui/material';
import { OccurrenceCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '../../types/occurrence.types';

interface CategoryBadgeProps {
    category: OccurrenceCategory;
    size?: 'small' | 'medium';
}

export default function CategoryBadge({ category, size = 'small' }: CategoryBadgeProps) {
    return (
        <Chip
            label={CATEGORY_LABELS[category]}
            size={size}
            sx={{
                bgcolor: CATEGORY_COLORS[category] + '20',
                color: CATEGORY_COLORS[category],
                fontWeight: 'bold',
                borderColor: CATEGORY_COLORS[category],
                borderWidth: 1,
                borderStyle: 'solid',
            }}
        />
    );
}
