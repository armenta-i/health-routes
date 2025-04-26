# 🧠 AI-Powered Mobile App with Python Backend

A cross-platform mobile app built with **React Native** (frontend) and **FastAPI** (backend), integrating:

- 🛡️ Supabase for auth & DB  
- 🧠 LangChain for AI interaction  
- ⚙️ LittleHorse for workflow orchestration

---

## 🧰 Tech Stack

### Frontend

- React Native (JavaScript)
- Expo
- Axios
- Dotenv

### Backend

- Python 3.10+
- FastAPI
- Uvicorn
- Supabase (Python SDK)
- LangChain
- LittleHorse
- Dotenv

---

## 🗂️ Project Structure

```
AI-HACK/
├── backend/
│   ├── main.py
│   ├── .env
│   ├── requirement.txt
│   └── app/
│       ├── api/
│       │   └── __init__.py
│       ├── core/
│       │   └── config.py
│       ├── services/
│       │   ├── langchain_service.py
│       │   ├── littlehorse_service.py
│       │   └── supabase_service.py
│       └── tests/
│           └── __init__.py
│
├── frontend/
│   ├── App.js
│   ├── app.json
│   ├── index.js
│   ├── package.json
│   ├── .env
│   ├── assets/
│   └── node_modules/
│
├── .gitignore
├── .gitattributes
└── readme.md
```

---

## 🧑‍💻 Setup Instructions

### 🔧 Prerequisites

- Node.js v16+
- Python 3.10+
- Expo CLI (`npm install -g expo-cli`)
- Git

---

## 🚀 Backend Setup (`/backend`)

### 1. Navigate to the backend folder:
```bash
cd backend
```

### 2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies:
```bash
pip install -r requirement.txt
```

### 4. Create a `.env` file inside `backend/`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_api_key
LH_SERVER_URL=http://localhost:8080
```

### 5. Run the FastAPI server:
```bash
uvicorn main:app --reload
```

---

## 📱 Frontend Setup (`/frontend`)

### 1. Navigate to the frontend folder:
```bash
cd frontend
```

### 2. Install dependencies:
```bash
npm install
```

### 3. Create a `.env` file inside `frontend/`:
```env
BACKEND_URL=http://localhost:8000
```

### 4. Start the Expo app:
```bash
npx expo start
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.