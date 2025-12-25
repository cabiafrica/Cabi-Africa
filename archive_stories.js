const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const STORIES_DIR = 'D:\\IBN KENYA\\PROJECTS\\Cabi Alpha\\stories\\done';
const ARCHIVE_DIR = 'D:\\IBN KENYA\\PROJECTS\\Cabi Alpha\\docs\\Story Archives';
const PROJECT_ROOT = 'D:\\IBN KENYA\\PROJECTS\\Cabi Alpha';

// Path Mappings for Migration
const PATH_MAPPINGS = [
    { from: 'apps/marketing-website', to: 'Cabi Alpha/web/user_portal' },
    { from: 'apps/user-portal', to: 'Cabi Alpha/web/user_portal' },
    { from: 'apps/driver-app/src', to: 'Cabi Alpha/mobile/driver_app/lib' }, // Dart files usually in lib
    { from: 'apps/driver-app', to: 'Cabi Alpha/mobile/driver_app' },
    { from: 'apps/passenger-app/src', to: 'Cabi Alpha/mobile/passenger_app/lib' },
    { from: 'apps/passenger-app', to: 'Cabi Alpha/mobile/passenger_app' },
    // Common backend paths - assume they might be in libs or similar, but for now let's map known ones
    { from: 'libs/backend', to: 'libs/backend' } // These seem to be in root libs
];

function resolvePath(filePath) {
    let normalized = filePath.replace(/\\/g, '/');

    // Try absolute check first (if it starts with Cabi Alpha or D:)
    if (normalized.startsWith('Cabi Alpha') || normalized.startsWith('libs')) {
        return path.join(PROJECT_ROOT, normalized);
    }

    // Apply mappings
    for (const mapping of PATH_MAPPINGS) {
        if (normalized.startsWith(mapping.from)) {
            const mapped = normalized.replace(mapping.from, mapping.to);
            return path.join(PROJECT_ROOT, mapped);
        }
    }

    // Default fallback to root
    return path.join(PROJECT_ROOT, normalized);
}

function checkFilesExist(fileList) {
    if (!fileList || fileList.length === 0) return true; // No files listed means logic/config only, assumption PASS

    for (const file of fileList) {
        // Skip doc files or self-refs
        if (file.endsWith('.yml') || file.endsWith('.md')) continue;

        const resolvedPath = resolvePath(file);
        if (!fs.existsSync(resolvedPath)) {
            // Try one more heuristic: .ts -> .tsx or vice versa? No, strict check.
            // Try checking for 'lib' insertion for dart files if missing
            if (file.endsWith('.dart') && !resolvedPath.includes('lib') && resolvedPath.includes('mobile')) {
                // e.g. mobile/driver_app/screens/x.dart -> mobile/driver_app/lib/screens/x.dart
                const libPath = resolvedPath.replace('driver_app\\', 'driver_app\\lib\\').replace('passenger_app\\', 'passenger_app\\lib\\');
                if (fs.existsSync(libPath)) return true;
            }
            // console.log(`Missing: ${file} -> ${resolvedPath}`);
            return false;
        }
    }
    return true;
}

function processDirectory(directory) {
    const items = fs.readdirSync(directory);

    for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (item.endsWith('.yml')) {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                const doc = yaml.load(content);

                const filesCreated = doc.files_to_be_created || [];
                const filesModified = doc.files_to_be_modified || [];
                const allFiles = [...filesCreated, ...filesModified];

                if (checkFilesExist(allFiles)) {
                    // Move to Archive
                    const relativePath = path.relative(STORIES_DIR, fullPath);
                    const destPath = path.join(ARCHIVE_DIR, relativePath);
                    const destDir = path.dirname(destPath);

                    if (!fs.existsSync(destDir)) {
                        fs.mkdirSync(destDir, { recursive: true });
                    }

                    fs.renameSync(fullPath, destPath);
                    console.log(`Archived: ${relativePath}`);
                } else {
                    // console.log(`Skipped (Missing Implementation): ${item}`);
                }
            } catch (e) {
                console.error(`Error processing ${item}: ${e.message}`);
            }
        }
    }
}

console.log('Starting Archive Process...');
processDirectory(STORIES_DIR);
console.log('Archive Process Complete.');
