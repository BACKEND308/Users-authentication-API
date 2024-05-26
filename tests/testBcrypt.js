const bcrypt = require('bcrypt');

async function testHashing() {
    const plainPassword = 'oldpassword';

    // Hash the password with 12 salt rounds
    const salt = await bcrypt.genSalt(12);
    const hashedPasswordJS = await bcrypt.hash(plainPassword, salt);
    console.log('Hashed Password (JS):', hashedPasswordJS);

    // Verify the password
    const isMatch = await bcrypt.compare(plainPassword, hashedPasswordJS);
    console.log('Password match (JS):', isMatch);
}

testHashing();
