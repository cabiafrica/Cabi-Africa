const bcrypt = require('bcryptjs');
const password = 'Admin@2026';
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log(hash);
});
