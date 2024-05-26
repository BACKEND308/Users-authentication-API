const bcrypt = require('bcryptjs');

async function testBcrypt() {
    const plainTextPassword = 'passwords';
    const hashedPassword = await bcrypt.hash(plainTextPassword, 8);

    console.log('Plain text password:', plainTextPassword);
    console.log('Hashed password:', hashedPassword);

    const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
    console.log('Password match:', isMatch);
}

testBcrypt();
