const { execSync } = require('child_process');

const ADB = 'adb -s emulator-5556';

function run(cmd) {
  console.log('>>', cmd);
  return execSync(`${ADB} ${cmd}`, { stdio: 'pipe' }).toString();
}

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {}
}

async function main() {
  console.log('--- 1. Tap Email Input ---');
  run('shell input tap 540 630');
  sleep(600);

  console.log('--- 2. Clear Email Input ---');
  // Send 30 backspaces
  for (let i = 0; i < 30; i++) {
    run('shell input keyevent 67');
  }
  sleep(300);

  console.log('--- 3. Type Email ---');
  run('shell input text "driver@test.com"');
  sleep(500);

  console.log('--- 4. Reveal Password Field (Tap Eye Icon) ---');
  // Eye icon is at bounds [855, 1454][981, 1580] -> center ~ 918, 1517 (or y=915 when un-scrolled)
  // Let's tap eye icon on the right side of password box: x=860, y=915
  run('shell input tap 860 915');
  sleep(500);

  console.log('--- 5. Tap Password Input and Clear ---');
  run('shell input tap 540 915');
  sleep(500);
  for (let i = 0; i < 30; i++) {
    run('shell input keyevent 67');
  }
  sleep(300);

  console.log('--- 6. Type Password ---');
  // In adb shell, we can run: input text Password123 && input keyevent 59 --press 8
  // Or test sending character by character or escaping
  run('shell input text Password123');
  sleep(200);
  // Send exclamation mark: keyevent 75 or shift+1
  // In Android, keycode 8 is '1', keycode 59 is SHIFT_LEFT.
  // We can send: adb shell input keyevent --longpress 8, or adb shell input text "\\!"
  run('shell input text "\\!"');
  sleep(500);

  console.log('--- 7. Dismiss Keyboard ---');
  run('shell input keyevent 4');
  sleep(800);

  console.log('--- 8. Capture Verification Screenshot ---');
  run('shell screencap -p /sdcard/screen.png');
  run('pull /sdcard/screen.png docs/screenshots/02e_filled_check.png');
  console.log('Saved to docs/screenshots/02e_filled_check.png');
}

main().catch(err => console.error(err));
