# BEE Movie Chatbot

## Chatbot walkthrough
https://www.loom.com/share/36cbd036c45844b3baf078d648c6d103?sid=d2b2fc3d-0d7d-465a-9800-05b12a937fe1

## 📝 Overview
The **BEE Movie Chatbot** is a Retrieval-Augmented Generation (RAG) and sentiment analysis-based chatbot built using **Langraph**. This agentic chatbot is designed to analyze sentiment, understand queries, and provide responses based on the context of the Bee Movie.

## 🤖 Agents
The chatbot is structured into multiple agents, each handling a specific task:
- **Supervisor Agent**: Manages and orchestrates responses between different agents.
- **Sentiment Analysis Agent**: Analyzes the sentiment of user queries to enhance response relevance.
- **Query Response Agent**: Retrieves and generates responses based on the Bee Movie dataset.

---

## 🚀 Setup Instructions

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/sayali-redasani/openLake_bee.git
cd openLake_bee
cd backend
```

### 2️⃣ Create a `.env` File
Create a `.env` file in the root directory and add your API keys and other environment variables:
```ini
OPENAI_API_KEY=your_api_key_here
COHERE_API_KEY=your_api_key_here
```

### 3️⃣ Install Dependencies
Ensure you have Python installed, then install the required packages:
```sh
pip install -r requirements.txt
```

### 4️⃣ Push Data to the Vector Database
Run the following script to populate your vector database with the Bee Movie dataset:
Kindly ingnore this step as the dataset is already pushed to the vector database.
```sh
python vectorDB_push.py
```

### 5️⃣ Run the Application
Start the chatbot server:
```sh
python app.py
```
### Docker Image
```sh
docker pull sayli98/openlakebackend:v1
```
#### Usage
```
docker run -d -p 8000:8000 sayli98/openlakebackend:v1
```

### 6️⃣ Start the Frontend
For a user-friendly interface, start the frontend (if applicable):
```sh
cd FrontEnd
npm install  # Install frontend dependencies (if applicable)
npm start    # Run the frontend
```
### Docker Image
```sh
docker pull sayli98/openlake:v1
```
#### Usage
```
docker run -d -p 3000:3000 sayli98/openlake:v1
```


---

## 📌 Features
✅ Retrieval-Augmented Generation (RAG) for accurate responses
✅ Sentiment analysis to enhance user interactions
✅ Multi-agent architecture for efficient query handling
✅ Vector database integration for fast and relevant retrieval
✅ Scalable and modular design

---

## 🛠️ Technologies Used
- **Langraph** (for agentic chatbot functionality)
- **Python** (FastAPI or Flask for backend, depending on implementation)
- **MongoDB Atlas** (as a vector database)
- **Pinecone** (as a vector database)
- **OpenAI GPT-4oMini** (for sentiment analysis)
- **React.js** (for frontend, if applicable)

---

## 📬 Contributing
Feel free to contribute! Fork the repo, make your changes, and submit a pull request. 🚀

---

## 📞 Contact
For any questions or support, reach out to **Sayali Redasani** at `sayaliredasani@gmail.com` or open an issue in the repository.

---

Happy Coding! 🐝💬

