import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface MaskedPhoneProps {
    phone?: string | null;
    className?: string;
}

export const MaskedPhone: React.FC<MaskedPhoneProps> = ({ phone, className = 'text-xs text-slate-400' }) => {
    const [revealed, setRevealed] = useState(false);

    if (!phone) {
        return <span className={className}>—</span>;
    }

    const clean = phone.trim();
    const masked = clean.length >= 8 
        ? `${clean.slice(0, 4)} *** ${clean.slice(-3)}`
        : clean;

    return (
        <span className={`inline-flex items-center gap-1.5 ${className}`}>
            <span className="font-mono">{revealed ? clean : masked}</span>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setRevealed((prev) => !prev);
                }}
                className="text-slate-500 hover:text-amber-400 transition-colors p-0.5 rounded cursor-pointer"
                title={revealed ? 'Hide telephone number' : 'Click to reveal telephone number'}
            >
                {revealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
        </span>
    );
};

export default MaskedPhone;
