from utils.tools import retriever
from utils.agents import MultiAgentWorkflow, AgentState
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId, json_util
import urllib.parse
import json

app = Flask(__name__)
CORS(app)


MONGO_USERNAME = os.getenv('MONGO_USERNAME')  # Default if not set
MONGO_PASSWORD = os.getenv('MONGO_PASSWORD')  # Default if not set

encoded_username = urllib.parse.quote_plus(MONGO_USERNAME)
encoded_password = urllib.parse.quote_plus(MONGO_PASSWORD)
MONGO_URI = f"mongodb+srv://{encoded_username}:{encoded_password}@cluster0.mnbs1.mongodb.net/?retryWrites=true&w=majority"

client = MongoClient(MONGO_URI)
db = client["bee"]
collection = db["bee_data"]
print(collection)

@app.route('/rag_qa_api_stream', methods=['POST'])
def rag_qa_api_stream():
    data = request.json
    print(data)
    prompt = data.get('text')
    print(prompt)
    workflow = MultiAgentWorkflow(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        verbose=True
    )
    result = workflow.run(prompt)
    ai_message_content = result['messages'][-1].content
    print(ai_message_content)
    append_chat_entry(prompt,ai_message_content)
    return ai_message_content

def append_chat_entry(query, response):
    print("data added to mongodb")
    current_date = datetime.now().strftime('%Y-%m-%d')
    # Find if there's an entry for the current date
    date_entry = collection.find_one({"date": current_date})
    new_entry = {
        "Query": query,
        "Response": response,
        "_id": {"$oid": str(ObjectId())}  # Create unique ID for the entry
    }
    print(new_entry)
    if date_entry:
        # Append to existing date's entries
        collection.update_one(
            {"_id": date_entry["_id"]},
            {"$push": {"entries": new_entry}}
        )
    else:
        # Create a new document for today's date
        collection.insert_one({
            "date": current_date,
            "entries": [new_entry]
        })
    return "success"

# Error handling for history routes
@app.route('/list_files', methods=['POST', 'GET'])
def list_files():
    try:
        # Fetch distinct dates sorted in descending order
        files = collection.distinct('date')
        print(files)
        files.sort(reverse=True)  # Sort the dates in descending order
        return jsonify(files)
    except Exception as e:
        # logger.error(f"Error retrieving file list: {str(e)}")
        return jsonify({"error": "Failed to retrieve file list"}), 500

def get_chat_history_by_date(date_str):
    # Fetch the document for the given date
    chat_history = collection.find_one({"date": date_str})
    if chat_history:
        entries = chat_history.get("entries", [])
        if entries:
            result = []
            for entry in entries:
                # Only include non-empty fields
                record = {key: value for key, value in entry.items() if value}
                result.append(record)
                print(result)
            return result
        else:
            return None  # No entries for this date
    else:
        return None  

@app.route('/one_file', methods=['POST', 'GET'])
def one_file():
    try:
        data = request.get_json()
        file_date = data.get('file')
        print(file_date)
        if not file_date:
            print("file date not there")
            return jsonify({"error": "File parameter is required"}), 400
        chat_history = get_chat_history_by_date(file_date)
        print(chat_history)
        if chat_history:
            return json.loads(json_util.dumps(chat_history))
        else:
            return jsonify([])
    except Exception as e:
        # logger.error(f"Error retrieving chat history: {str(e)}")
        return jsonify({"error": "Failed to retrieve data"}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8000)
