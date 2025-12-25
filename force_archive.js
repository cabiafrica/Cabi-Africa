const fs = require('fs');
const path = require('path');

const STORIES_DIR = 'D:\\IBN KENYA\\PROJECTS\\Cabi Alpha\\stories\\done';
const ARCHIVE_DIR = 'D:\\IBN KENYA\\PROJECTS\\Cabi Alpha\\docs\\Story Archives';

function processDirectory(directory) {
    let items = [];
    try {
        items = fs.readdirSync(directory);
    } catch (e) {
        return; // Directory might be empty/gone
    }

    for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
            // Attempt to remove empty directories after processing
            try {
                if (fs.readdirSync(fullPath).length === 0) {
                    fs.rmdirSync(fullPath);
                }
            } catch (e) { }
        } else if (item.endsWith('.yml')) {
            // Force move to archive
            const relativePath = path.relative(STORIES_DIR, fullPath);
            const destPath = path.join(ARCHIVE_DIR, relativePath);
            const destDir = path.dirname(destPath);

            if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            fs.renameSync(fullPath, destPath);
            console.log(`Force Archived: ${relativePath}`);
        }
    }
}

console.log('Moving remaining stories...');
processDirectory(STORIES_DIR);
console.log('Done.');
