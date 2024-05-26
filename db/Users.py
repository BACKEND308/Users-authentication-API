from connect import connectDB,connect_mysql, fetch_data_from_mongodb, create_table_and_insert_data
import bcrypt
import random

def get_pss():
    password = input("Enter password: ")
    return password

def hash_password(password):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')  # Decode to store as a string

def check_password(plain_password, hashed_password):
    # Check if the provided password matches the hashed password
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_user(email, password, user_type):
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    hashed_password = hash_password(password)
    return {
        "email": email,
        "password": hashed_password,
        "type": user_type
    }
    
def populate_users_collection(db):
    users_collection = db.Users
    sample_emails = [
        "user1@example.com", "user2@example.com", "user3@example.com",
        "user4@example.com", "user5@example.com", "user6@example.com",
        "user7@example.com", "user8@example.com", "user9@example.com", "user10@example.com"
    ]
    sample_passwords = [
        "password1", "password2", "password3", "password4", "password5",
        "password6", "password7", "password8", "password9", "password10"
    ]
    sample_types = ["admin", "passenger"]

    users = []
    for i in range(10):
        email = sample_emails[i]
        password = sample_passwords[i]
        user_type = random.choice(sample_types)
        user = create_user(email, password, user_type)
        users.append(user)

    result = users_collection.insert_many(users)
    print(f"Inserted user IDs: {result.inserted_ids}")
    
    
def main():
    db = connectDB()
    #populate_users_collection(db)
    
    
if __name__ == "__main__":
    main()
