const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const STORIES_DIR = 'D:\\IBN KENYA\\PROJECTS\\Cabi Alpha\\stories\\done';
const ARCHIVE_DIR = 'D:\\IBN KENYA\\PROJECTS\\Cabi Alpha\\docs\\Story Archives';
const PROJECT_ROOT = 'D:\\IBN KENYA\\PROJECTS\\Cabi Alpha';

// Replacements for fixing YAML content
const REPLACEMENTS = [
    { from: /apps\/driver-app\/src\//g, to: 'Cabi Alpha/mobile/driver_app/lib/' },
    { from: /apps\/passenger-app\/src\//g, to: 'Cabi Alpha/mobile/passenger_app/lib/' },
    { from: /apps\/marketing-website\/src\//g, to: 'Cabi Alpha/web/user_portal/src/' }, // refined
    { from: /apps\/marketing-website\//g, to: 'Cabi Alpha/web/user_portal/' },
    { from: /apps\/user-portal\/src\//g, to: 'Cabi Alpha/web/user_portal/src/' },
    { from: /apps\/user-portal\//g, to: 'Cabi Alpha/web/user_portal/' },
    { from: /packages\/shared_ui\//g, to: 'libs/shared/ui/' }, // Potential shared lib fix
    { from: /packages\/core_auth\//g, to: 'libs/shared/auth/' } // Potential shared lib fix
];

function resolvePath(filePath) {
    let normalized = filePath.replace(/\\/g, '/');
    if (normalized.startsWith('Cabi Alpha') || normalized.startsWith('libs')) {
        return path.join(PROJECT_ROOT, normalized);
    }
    return path.join(PROJECT_ROOT, normalized);
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
                let content = fs.readFileSync(fullPath, 'utf8');
                let modified = false;

                // 1. Apply Replacements to Fix Paths
                for (const replacement of REPLACEMENTS) {
                    if (content.match(replacement.from)) {
                        content = content.replace(replacement.from, replacement.to);
                        modified = true;
                    }
                }

                if (modified) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    // console.log(`Fixed paths in: ${item}`);
                }

                // 2. Parsed Check
                const doc = yaml.load(content);
                const filesCreated = doc.files_to_be_created || [];
                const filesModified = doc.files_to_be_modified || [];
                const allFiles = [...filesCreated, ...filesModified];

                let allExist = true;
                if (allFiles.length > 0) {
                    for (const file of allFiles) {
                        // Skip comments/descriptions in list (sometimes user puts comments in list)
                        if (file.includes('#') || file.includes(' ')) continue;

                        const resolvedPath = resolvePath(file.trim());
                        if (!fs.existsSync(resolvedPath)) {
                            allExist = false;
                            break;
                        }
                    }
                }

                if (allExist) {
                    // Move to Archive
                    const relativePath = path.relative(STORIES_DIR, fullPath);
                    const destPath = path.join(ARCHIVE_DIR, relativePath);
                    const destDir = path.dirname(destPath);

                    if (!fs.existsSync(destDir)) {
                        fs.mkdirSync(destDir, { recursive: true });
                    }

                    fs.renameSync(fullPath, destPath);
                    console.log(`Archived (Fixed): ${relativePath}`);
                }
            } catch (e) {
                console.error(`Error processing ${item}: ${e.message}`);
            }
        }
    }
}

console.log('Starting Fix & Archive Process...');
processDirectory(STORIES_DIR);
console.log('Complete.');
