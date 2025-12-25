const fs = require('fs');
const path = require('path');

const STORIES_DIR = 'D:\\IBN KENYA\\PROJECTS\\Cabi Alpha\\stories\\done';

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix 1: Duplicate qa_results or dev_agent_record
    // We'll regex to find if it appears twice.
    if ((content.match(/^qa_results:/gm) || []).length > 1) {
        // Remove the empty one "qa_results: []" caused by template
        content = content.replace(/qa_results: \[\]\s*qa_results:/, 'qa_results:');
        // if still, remove the last one?
        if ((content.match(/^qa_results:/gm) || []).length > 1) {
            // Basic fallback: remove the first instance if it looks empty
            content = content.replace(/qa_results:(\s*\[\])?\s+(?=qa_results:)/, '');
        }
    }
    if ((content.match(/^dev_agent_record:/gm) || []).length > 1) {
        content = content.replace(/dev_agent_record:\s+(?=dev_agent_record:)/, '');
    }

    // Fix 2: Unidentified alias * (Markdown bolding in YAML without quotes)
    // - **Cancellation -> "- '**Cancellation"
    // We'll just quote lines starting with - **
    content = content.replace(/^(\s*-\s+)(\*\*.*)$/gm, '$1"$2"');
    // Fix: `User-agent: *` in story-6.1
    content = content.replace(/(`User-agent: \*`)/g, '"$1"');

    // Fix 3: Bad indentation (Commonly "     - ...") where it should be "  - ..."
    // This is risky but standardizing to 2 spaces for list items might help if they are far off
    // Only target known bad ones?
    // "     ... ip statuses:" in web-real-time-tracking.yml
    content = content.replace(/^\s+\.\.\. ip statuses:/gm, '      ... ip statuses:'); // targeted hack

    // Fix 4: Story 1.x mapping pair errors
    // "title: ... : ..." The colon inside title might confusing parser if unquoted
    // Regex to quote titles that have colons
    // title: Passenger: Register... -> title: "Passenger: Register..."
    content = content.replace(/^title:\s+([^"\n]*:[^"\n]*)$/gm, 'title: "$1"');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Patched YAML syntax: ${path.basename(filePath)}`);
    }
}

function processDirectory(directory) {
    const items = fs.readdirSync(directory);
    for (const item of items) {
        const fullPath = path.join(directory, item);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (item.endsWith('.yml')) {
            fixFile(fullPath);
        }
    }
}

// Specific fix for web-user-dashboard "Book a New Ride" quoting issue if any
// (Previous log: bad indentation at "Book a New Ride")

processDirectory(STORIES_DIR);
