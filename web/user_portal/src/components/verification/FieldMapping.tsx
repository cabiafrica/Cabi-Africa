import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';

interface FieldMatchResult {
    field: string;
    provided: string | number;
    extracted: string | number;
    matched: boolean;
}

interface FieldMappingProps {
    extractedFields: any;
    providedFields: any;
    matchResults?: FieldMatchResult[];
    documentType: 'NATIONAL_ID' | 'DRIVERS_LICENSE' | 'PASSPORT';
}

export default function FieldMapping({
    extractedFields,
    providedFields,
    matchResults,
    documentType,
}: FieldMappingProps) {
    const getFieldLabel = (field: string): string => {
        const labels: { [key: string]: string } = {
            fullName: 'Full Name',
            name: 'Name',
            idNumber: 'ID Number',
            licenseNumber: 'License Number',
            passportNumber: 'Passport Number',
            dateOfBirth: 'Date of Birth',
            gender: 'Gender',
            districtOfBirth: 'District of Birth',
            dateOfIssue: 'Date of Issue',
            expiryDate: 'Expiry Date',
            classes: 'License Classes',
            bloodGroup: 'Blood Group',
            nationality: 'Nationality',
        };
        return labels[field] || field;
    };

    const getMatchStatus = (field: string) => {
        if (!matchResults) return null;
        const result = matchResults.find((r) => r.field === field);
        return result;
    };

    const renderFieldComparison = (field: string) => {
        const extracted = extractedFields[field];
        const provided = providedFields[field];
        const matchStatus = getMatchStatus(field);

        if (!extracted && !provided) return null;

        return (
            <div
                key={field}
                className={`p-4 rounded-lg border ${matchStatus
                        ? matchStatus.matched
                            ? 'border-green-500/30 bg-green-500/5'
                            : 'border-red-500/30 bg-red-500/5'
                        : 'border-gray-700 bg-brand-dark/30'
                    }`}
            >
                <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-sm">{getFieldLabel(field)}</h4>
                    {matchStatus && (
                        <div className="flex items-center gap-1">
                            {matchStatus.matched ? (
                                <FaCheckCircle className="text-green-500" />
                            ) : (
                                <FaTimesCircle className="text-red-500" />
                            )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 text-xs mb-1">You Provided</p>
                        <p className="font-mono text-white">
                            {provided || <span className="text-gray-600 italic">Not provided</span>}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs mb-1">Document Shows</p>
                        <p className="font-mono text-white">
                            {extracted || <span className="text-gray-600 italic">Not detected</span>}
                        </p>
                    </div>
                </div>

                {matchStatus && !matchStatus.matched && (
                    <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-500 flex items-start gap-2">
                        <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
                        <span>
                            The information you provided doesn't match what we extracted from your document. Please verify and re-upload if needed.
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const allFields = [
        ...Object.keys(extractedFields),
        ...Object.keys(providedFields),
    ].filter((value, index, self) => self.indexOf(value) === index);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold mb-2">Field Verification</h3>
                <p className="text-gray-400 text-sm">
                    Comparing the information you provided with what we extracted from your document.
                </p>
            </div>

            <div className="space-y-3">
                {allFields.map((field) => renderFieldComparison(field))}
            </div>

            {matchResults && (
                <div className="bg-brand-dark/50 border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-bold text-sm mb-1">Verification Status</h4>
                            <p className="text-xs text-gray-400">
                                {matchResults.filter((r) => r.matched).length} of {matchResults.length} fields matched
                            </p>
                        </div>
                        <div className="text-right">
                            {matchResults.every((r) => r.matched) ? (
                                <div className="flex items-center gap-2 text-green-500">
                                    <FaCheckCircle className="text-xl" />
                                    <span className="font-bold">Verified</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-red-500">
                                    <FaTimesCircle className="text-xl" />
                                    <span className="font-bold">Failed</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
