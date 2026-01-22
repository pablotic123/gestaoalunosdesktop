from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from database import db
from auth import get_password_hash
from datetime import datetime, timezone
import uuid
import asyncio

async def seed_database():
    print("Iniciando seed do banco de dados...")
    
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": "admin",
        "password": get_password_hash("#admin123%"),
        "name": "Administrador",
        "role": "admin",
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    professor_user = {
        "id": str(uuid.uuid4()),
        "email": "professor",
        "password": get_password_hash("#professor123%"),
        "name": "Professor",
        "role": "professor",
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.delete_many({})
    print("✓ Usuários antigos removidos")
    
    await db.users.insert_one(admin_user)
    print("✓ Usuário admin criado: admin / #admin123%")
    
    await db.users.insert_one(professor_user)
    print("✓ Usuário professor criado: professor / #professor123%")
    
    courses = [
        {
            "id": str(uuid.uuid4()),
            "name": "Engenharia de Software",
            "workload": 3200,
            "description": "Curso superior em Engenharia de Software",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Administração",
            "workload": 3000,
            "description": "Curso superior em Administração",
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    course_count = await db.courses.count_documents({})
    if course_count == 0:
        await db.courses.insert_many(courses)
        print(f"✓ {len(courses)} cursos criados")
    
    course_docs = await db.courses.find({}, {"_id": 0}).to_list(10)
    
    turmas = []
    for course in course_docs[:2]:
        turmas.append({
            "id": str(uuid.uuid4()),
            "name": f"{course['name']} - 2025.1",
            "course_id": course["id"],
            "course_name": course["name"],
            "period": "Matutino",
            "year": 2025,
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    turma_count = await db.turmas.count_documents({})
    if turma_count == 0 and turmas:
        await db.turmas.insert_many(turmas)
        print(f"✓ {len(turmas)} turmas criadas")
    
    print("Seed concluído com sucesso!")

if __name__ == "__main__":
    asyncio.run(seed_database())
