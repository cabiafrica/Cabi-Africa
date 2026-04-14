const bcrypt = require('bcryptjs');
const hash = '$2b$10$wy05o8oLWLVwXyoZce2X7.f.5ZINGddDfaEp1pDitdrBDGXShRbkq';
const password = 'Admin@2026';

bcrypt.compare(password, hash).then(result => {
  console.log(`Password: ${password}`);
  console.log(`Match: ${result}`);
});
