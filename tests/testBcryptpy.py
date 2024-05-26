import bcrypt

def hash_password(password):
    salt = bcrypt.gensalt()  # Default rounds is 12
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# Test
plain_password = "oldpassword"
hashed_password = hash_password(plain_password)
print("Hashed Password (Python):", hashed_password)
print("Password match (Python):", check_password(plain_password, hashed_password))
