from fastapi import FastAPI
from app.api import auth, ai, workflow
from fastapi.middleware.cors import CORSMiddleware
from app.core.CreateUser_router import router as user_router

app = FastAPI()
app.include_router(user_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(ai.router, prefix="/ai")
app.include_router(workflow.router, prefix="/workflow")

@app.get("/")
def read_root():
    return {"message": "Hello!"}
