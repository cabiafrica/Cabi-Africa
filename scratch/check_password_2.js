const bcrypt = require('bcryptjs');
const hash = '$2b$10$xoZdc.UYMYq1BVKkNUf2le7UoaNiKXbUQ3NWgEkkVVAw53H4uAEiW';
const password = 'Cabi2026!';

bcrypt.compare(password, hash, (err, res) => {
    if (res) {
        console.log('Password matches Cabi2026!!');
    } else {
        console.log('Password does not match Cabi2026!.');
    }
});
