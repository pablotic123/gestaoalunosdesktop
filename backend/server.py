from fastapi import FastAPI
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.datastructures import URL
import os
import logging
from pathlib import Path
from database import init_db
from routes import auth_routes, students_routes, courses_routes, turmas_routes, institution_routes, users_routes, dashboard_routes

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

class RemoveTrailingSlashMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        url_path = request.url.path
        if url_path != "/" and url_path.endswith("/"):
            url_path = url_path.rstrip("/")
            url = request.url.replace(path=url_path)
            request._url = url
            request.scope["path"] = url_path
        response = await call_next(request)
        return response

app = FastAPI(title="SGE - Sistema de Gestão Escolar")

app.add_middleware(RemoveTrailingSlashMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api")
app.include_router(students_routes.router, prefix="/api")
app.include_router(courses_routes.router, prefix="/api")
app.include_router(turmas_routes.router, prefix="/api")
app.include_router(institution_routes.router, prefix="/api")
app.include_router(users_routes.router, prefix="/api")
app.include_router(dashboard_routes.router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    await init_db()
    logging.info("Database initialized")

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
