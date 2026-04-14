const bcrypt = require('bcryptjs');
const password = 'Admin@2026';
const existingHash = '$2b$10$wy05o8oLWLVwXyoZce2X7.f.5ZINGddDfaEp1pDitdrBDGXShRbkq';

bcrypt.compare(password, existingHash, (err, res) => {
    if (err) throw err;
    console.log('Match:', res);
});
