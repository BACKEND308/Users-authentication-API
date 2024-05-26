import json
import os
from sqlalchemy import create_engine, Table, Column, Integer, String, MetaData
from sqlalchemy.orm import sessionmaker
from pymongo import MongoClient

def connectDB():
    # Replace the connection string with your MongoDB connection string
    # You can obtain the connection string from your MongoDB Atlas dashboard or configure it locally
    # For example, if your database is running on localhost, the connection string might look like this:
    # "mongodb://localhost:27017/"

    connection_string = "mongodb+srv://asfafeeroze:1234@cluster0.zj78qtj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    client = MongoClient(connection_string)

    # Access a specific database (replace "your_database_name" with your actual database name)
    db = client.Cluster0
    print("Connection established to your db")
    return db
    # Close the connection when you're done
    # client.close()

# BELOW CODE IS FOR PROVIDING THE USER THE UTILITY TO CHOOSE BETWEEN NoSQL and MySQL

config = {
    "mysql": {
        "host": "localhost",
        "user": "your_mysql_user",
        "password": "your_mysql_password",
        "database": "your_mysql_database"
    },
    "mongodb": {
        "host": "localhost",
        "port": 27017,
        "database": "your_mongodb_database"
    }
}

def connect_mysql():
    mysql_config = config['mysql']
    engine = create_engine(f'mysql+mysqlconnector://{mysql_config["user"]}:{mysql_config["password"]}@{mysql_config["host"]}/{mysql_config["database"]}')
    Session = sessionmaker(bind=engine)
    return engine, Session()

def connect_nosql():
    mongo_config = config['mongodb']
    client = MongoClient(mongo_config['host'], mongo_config['port'])
    db = client[mongo_config['database']]
    return db

def store_roster_mysql(engine, session, roster):
    metadata = MetaData()
    roster_table = Table('roster', metadata,
                         Column('id', Integer, primary_key=True, autoincrement=True),
                         Column('data', String))
    metadata.create_all(engine)
    roster_json = json.dumps(roster)
    conn = engine.connect()
    conn.execute(roster_table.insert(), {"data": roster_json})
    session.commit()
    conn.close()

def store_roster_nosql(db, roster):
    roster_collection = db['rosters']
    roster_collection.insert_one(roster)

def retrieve_roster_mysql(session):
    result = session.execute('SELECT data FROM roster')
    roster_data = result.fetchall()
    rosters = [json.loads(row['data']) for row in roster_data]
    return rosters

def retrieve_roster_nosql(db):
    roster_collection = db['rosters']
    rosters = list(roster_collection.find({}))
    return rosters

def export_roster_to_json(roster, file_path='roster.json'):
    with open(file_path, 'w') as json_file:
        json.dump(roster, json_file)
