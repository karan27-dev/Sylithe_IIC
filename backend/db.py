from pymongo import MongoClient, ASCENDING
from config import MONGO_URI

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not set. Please create a .env file with your MongoDB connection string.")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["sylithe"]

users_collection              = db["users"]
newsletter_collection         = db["newsletter"]
projects_collection           = db["projects_cache"]
otp_collection                = db["otp_tokens"]
free_scans_collection         = db["free_scans"]
access_requests_collection    = db["access_requests"]
developer_projects_collection = db["developer_projects"]
dev_activity_collection       = db["dev_activity"]
tree_inventory_collection     = db["tree_inventory"]
lulc_reports_collection       = db["lulc_reports"]
feature_usage_collection      = db["feature_usage"]

try:
    users_collection.create_index([("email", ASCENDING)], unique=True)
    otp_collection.create_index([("email", ASCENDING)])
    projects_collection.create_index([("country", ASCENDING), ("cached_at", ASCENDING)])
    projects_collection.create_index([("country", ASCENDING), ("registry", ASCENDING)])
    projects_collection.create_index([("country", ASCENDING), ("state", ASCENDING)])
    projects_collection.create_index([("country", ASCENDING), ("status", ASCENDING)])
    projects_collection.create_index([("country", ASCENDING), ("credits_issued", ASCENDING)])
    projects_collection.create_index([("name", ASCENDING)])
    free_scans_collection.create_index([("email", ASCENDING), ("created_at", ASCENDING)])
    access_requests_collection.create_index([("user_email", ASCENDING)])
    access_requests_collection.create_index([("status", ASCENDING)])
    access_requests_collection.create_index([("requested_at", ASCENDING)])
    developer_projects_collection.create_index([("developer_email", ASCENDING), ("created_at", ASCENDING)])
    dev_activity_collection.create_index([("developer_email", ASCENDING), ("timestamp", ASCENDING)])
    tree_inventory_collection.create_index([("developer_email", ASCENDING), ("project_id", ASCENDING), ("plot_index", ASCENDING)])
    lulc_reports_collection.create_index([("email", ASCENDING), ("created_at", ASCENDING)])
    feature_usage_collection.create_index([("email", ASCENDING), ("action", ASCENDING)])
except Exception as e:
    print(f"Warning: Could not create indexes: {e}")
