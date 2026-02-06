import React, { useEffect, useState, useMemo } from 'react';
import {
    TextField,
    FormControlLabel,
    Checkbox,
    Switch,
    InputAdornment,
    IconButton,
    Tooltip,
    Grow,
    Button
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Search as SearchIcon,
    Security as SecurityIcon,
    AdminPanelSettings as AdminIcon,
    Smartphone as MobileIcon,
    Web as WebIcon,
    Dns as ApiIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { roleService } from '../../services/roleService';
import { PERMISSION_CATEGORIES, PERMISSIONS_LIST } from '../../constants/permissions';

const RoleEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = id && id !== 'new';

    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        description: '',
        type: 'ADMIN',
        platform: 'ADMIN_PANEL',
        permissions: [] as string[],
        isActive: true
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode) {
            loadRole(id!);
        }
    }, [id]);

    const loadRole = async (roleId: string) => {
        try {
            const role = await roleService.getRole(roleId);
            setFormData({
                name: role.name,
                displayName: role.displayName,
                description: role.description || '',
                type: role.type,
                platform: role.platform,
                permissions: role.permissions,
                isActive: role.isActive
            });
        } catch (error) {
            console.error('Failed to load role', error);
        }
    };

    const handlePermissionChange = (perm: string, checked: boolean) => {
        setFormData(prev => {
            const newPerms = checked
                ? [...prev.permissions, perm]
                : prev.permissions.filter(p => p !== perm);
            return { ...prev, permissions: newPerms };
        });
    };

    const handleCategoryToggle = (categoryPerms: string[], checked: boolean) => {
        const permsInCategory = PERMISSIONS_LIST.filter(p =>
            categoryPerms.some(prefix => p.startsWith(prefix))
        );

        setFormData(prev => {
            let newPerms = [...prev.permissions];
            if (checked) {
                permsInCategory.forEach(p => {
                    if (!newPerms.includes(p)) newPerms.push(p);
                });
            } else {
                newPerms = newPerms.filter(p => !permsInCategory.includes(p));
            }
            return { ...prev, permissions: newPerms };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await roleService.updateRole(id!, formData);
            } else {
                await roleService.createRole(formData);
            }
            navigate('/roles');
        } catch (error) {
            console.error('Failed to save role', error);
            alert('Error saving role');
        }
    };

    const filteredCategories = useMemo(() => {
        if (!searchTerm) return Object.entries(PERMISSION_CATEGORIES);

        return Object.entries(PERMISSION_CATEGORIES).map(([category, prefixes]) => {
            const categoryPerms = PERMISSIONS_LIST.filter(p =>
                prefixes.some(prefix => p.startsWith(prefix))
            );
            const hasMatch = category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                categoryPerms.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

            return hasMatch ? [category, prefixes] : null;
        }).filter(Boolean) as [string, string[]][];
    }, [searchTerm]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 pb-24 font-sans text-slate-900 dark:text-slate-100">
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm mb-6">
                    <div className="flex items-center gap-3">
                        <IconButton onClick={() => navigate('/roles')} className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">
                            <ArrowBackIcon />
                        </IconButton>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <SecurityIcon className="text-purple-600 dark:text-purple-400" />
                                {isEditMode ? 'Edit Role' : 'Create Access Role'}
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {isEditMode ? `Editing Role ID: ${id}` : 'Define new system access levels and permissions'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/roles')}
                            color="inherit"
                            className="text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </Button>
                        <button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <SaveIcon fontSize="small" />
                            Save Configuration
                        </button>
                    </div>
                </div>

                {/* Main Configuration Card */}
                <Grow in={true} timeout={300}>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <TextField
                                fullWidth
                                label="Display Name"
                                placeholder="e.g. Super Administrator"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                required
                                variant="outlined"
                                className="bg-white dark:bg-slate-900"
                                InputLabelProps={{ className: "dark:text-slate-400" }}
                                InputProps={{ className: "dark:text-white" }}
                            />
                            <TextField
                                fullWidth
                                label="System Identifier"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                                disabled={isEditMode}
                                helperText={!isEditMode && "Uppercase, underscores only. Cannot be changed later."}
                                required
                                variant="outlined"
                                className="bg-white dark:bg-slate-900"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><SecurityIcon className="text-slate-400" /></InputAdornment>,
                                    className: "dark:text-white"
                                }}
                                InputLabelProps={{ className: "dark:text-slate-400" }}
                            />
                            <div className="col-span-1 md:col-span-2">
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    variant="outlined"
                                    className="bg-white dark:bg-slate-900"
                                    InputLabelProps={{ className: "dark:text-slate-400" }}
                                    InputProps={{ className: "dark:text-white" }}
                                />
                            </div>

                            {/* Platform Selection */}
                            <div className="col-span-1 md:col-span-2">
                                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Target Platform</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { value: 'ADMIN_PANEL', label: 'Admin Panel', icon: <AdminIcon /> },
                                        { value: 'DISPATCH_PANEL', label: 'Dispatch', icon: <WebIcon /> },
                                        { value: 'USER_PORTAL', label: 'User Portal', icon: <WebIcon /> },
                                        { value: 'MOBILE_APP', label: 'Mobile App', icon: <MobileIcon /> }
                                    ].map((opt) => {
                                        const isSelected = formData.platform === opt.value;
                                        return (
                                            <div
                                                key={opt.value}
                                                onClick={() => setFormData({ ...formData, platform: opt.value })}
                                                className={`cursor-pointer p-4 rounded-xl border text-center transition-all duration-200
                                                    ${isSelected
                                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-1 ring-purple-500 text-purple-700 dark:text-purple-300 shadow-sm'
                                                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <div className={`mb-2 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                                                    {opt.icon}
                                                </div>
                                                <p className="font-semibold text-sm">{opt.label}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            color="secondary" // Maps vaguely to purple in default MUI, or we can leave it
                                        />
                                    }
                                    label={
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">Active Status</p>
                                            <p className="text-xs text-slate-500">Enable or disable this role globally.</p>
                                        </div>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </Grow>

                {/* Permissions Section */}
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Permissions</h2>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search permissions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none shadow-sm w-full sm:w-64"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCategories.map(([category, prefixes], index) => {
                            const categoryPerms = PERMISSIONS_LIST.filter(p =>
                                prefixes.some(prefix => p.startsWith(prefix))
                            );

                            const displayPerms = searchTerm
                                ? categoryPerms.filter(p =>
                                    p.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    category.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                : categoryPerms;

                            if (displayPerms.length === 0) return null;

                            const allChecked = displayPerms.every(p => formData.permissions.includes(p));
                            const someChecked = displayPerms.some(p => formData.permissions.includes(p));

                            return (
                                <Grow in={true} timeout={300 + (index * 100)} key={category}>
                                    <div
                                        className="bg-white dark:bg-slate-800 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm hover:shadow-md transition-all duration-200"
                                        onMouseEnter={() => setHoveredCategory(category)}
                                        onMouseLeave={() => setHoveredCategory(null)}
                                    >
                                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{category}</h3>
                                            </div>
                                            <Tooltip title={allChecked ? "Deselect All" : "Select All"}>
                                                <Checkbox
                                                    checked={allChecked}
                                                    indeterminate={someChecked && !allChecked}
                                                    onChange={(e) => handleCategoryToggle(prefixes, e.target.checked)}
                                                    size="small"
                                                    className="text-slate-400 data-[state=checked]:text-purple-600"
                                                    sx={{ color: 'inherit', '&.Mui-checked': { color: '#9333ea' }, '&.MuiCheckbox-indeterminate': { color: '#9333ea' } }}
                                                />
                                            </Tooltip>
                                        </div>

                                        <div className="p-2 grid gap-1 max-h-64 overflow-y-auto custom-scrollbar">
                                            {displayPerms.map(perm => {
                                                const isSelected = formData.permissions.includes(perm);
                                                return (
                                                    <div
                                                        key={perm}
                                                        onClick={() => handlePermissionChange(perm, !isSelected)}
                                                        className={`flex items-start gap-2 p-2 rounded-lg cursor-pointer transition-colors
                                                            ${isSelected
                                                                ? 'bg-purple-50 dark:bg-purple-900/20'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                            }`}
                                                    >
                                                        <Checkbox
                                                            size="small"
                                                            checked={isSelected}
                                                            onChange={(e) => handlePermissionChange(perm, e.target.checked)}
                                                            className="mt-0.5"
                                                            sx={{
                                                                padding: 0,
                                                                color: isSelected ? '#9333ea' : 'rgb(148, 163, 184)',
                                                                '&.Mui-checked': { color: '#9333ea' }
                                                            }}
                                                        />
                                                        <div>
                                                            <p className={`text-sm font-medium ${isSelected ? 'text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                                                {perm.replace(prefixes[0] || '', '').replace(/_/g, ' ').toLowerCase()}
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-0.5 font-mono opacity-70">
                                                                {perm}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </Grow>
                            );
                        })}
                    </div>
                </div>
            </form>
        </div>
    );
};

export default RoleEditor;
