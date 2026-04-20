const bcrypt = require('bcryptjs');
const hash = '$2b$10$xoZdc.UYMYq1BVKkNUf2le7UoaNiKXbUQ3NWgEkkVVAw53H4uAEiW';
const password = 'Admin@2026';

bcrypt.compare(password, hash, (err, res) => {
    if (res) {
        console.log('Password matches!');
    } else {
        console.log('Password does not match.');
    }
});
