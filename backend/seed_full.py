from dotenv import load_dotenv
from pathlib import Path
import os
import requests
import base64
from io import BytesIO

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from database import db
from auth import get_password_hash
from datetime import datetime, timezone
import uuid
import asyncio
import random

# Nomes brasileiros para gerar alunos
FIRST_NAMES = [
    "João", "Maria", "Pedro", "Ana", "Lucas", "Juliana", "Felipe", "Beatriz", "Rafael", "Fernanda",
    "Gabriel", "Carolina", "Matheus", "Amanda", "Bruno", "Larissa", "Thiago", "Camila", "Diego", "Letícia",
    "Vinicius", "Mariana", "Guilherme", "Isabela", "Rodrigo", "Patrícia", "Marcelo", "Jéssica", "André", "Aline",
    "Gustavo", "Priscila", "Renato", "Natália", "Leonardo", "Vanessa", "Ricardo", "Bruna", "Carlos", "Tatiana",
    "Paulo", "Adriana", "Marcos", "Daniela", "Fernando", "Roberta", "Henrique", "Sabrina", "Eduardo", "Cristina",
    "Alexandre", "Michele", "Daniel", "Bianca", "José", "Eliane", "Fábio", "Raquel", "Leandro", "Simone"
]

LAST_NAMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Lima", "Ferreira", "Costa", "Rodrigues", "Almeida", "Nascimento",
    "Araújo", "Ribeiro", "Carvalho", "Gomes", "Martins", "Rocha", "Barbosa", "Dias", "Castro", "Monteiro",
    "Cardoso", "Correia", "Pereira", "Mendes", "Teixeira", "Moreira", "Cavalcanti", "Melo", "Azevedo", "Campos"
]

CURSOS = [
    {"name": "Medicina", "workload": 7200, "description": "Curso de Medicina com formação completa"},
    {"name": "Direito", "workload": 3600, "description": "Bacharelado em Direito"},
    {"name": "Ciência da Computação", "workload": 3200, "description": "Bacharelado em Ciência da Computação"},
]

PERIODOS = ["Matutino", "Vespertino", "Noturno", "Integral"]
ANOS = [2024, 2025]

def get_avatar_base64(seed):
    """Gera um avatar único usando DiceBear API e retorna em base64"""
    try:
        url = f"https://api.dicebear.com/7.x/avataaars/png?seed={seed}&size=200"
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            img_base64 = base64.b64encode(response.content).decode('utf-8')
            return f"data:image/png;base64,{img_base64}"
        else:
            return None
    except Exception as e:
        print(f"Erro ao gerar avatar: {e}")
        return None

def generate_student_name():
    """Gera um nome brasileiro aleatório"""
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    return f"{first} {last}"

def generate_email(name):
    """Gera um email baseado no nome"""
    name_clean = name.lower().replace(" ", ".")
    return f"{name_clean}@aluno.escola.com"

def generate_phone():
    """Gera um telefone brasileiro aleatório"""
    ddd = random.randint(11, 99)
    num = random.randint(900000000, 999999999)
    return f"({ddd}) {str(num)[:5]}-{str(num)[5:]}"

def generate_birth_date():
    """Gera uma data de nascimento aleatória entre 1995 e 2005"""
    year = random.randint(1995, 2005)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    return f"{year}-{month:02d}-{day:02d}"

async def seed_database():
    print("🚀 Iniciando população completa do banco de dados...")
    
    # Limpar dados antigos (exceto usuários)
    print("\n🗑️  Limpando dados antigos...")
    await db.students.delete_many({})
    await db.turmas.delete_many({})
    
    # Manter apenas os 2 cursos originais e adicionar 3 novos
    existing_courses = await db.courses.find({}, {"_id": 0}).to_list(10)
    print(f"✓ Mantendo {len(existing_courses)} cursos existentes")
    
    # Adicionar 3 novos cursos
    print("\n📚 Adicionando 3 novos cursos...")
    new_courses = []
    for curso_data in CURSOS:
        curso = {
            "id": str(uuid.uuid4()),
            "name": curso_data["name"],
            "workload": curso_data["workload"],
            "description": curso_data["description"],
            "active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.courses.insert_one(curso)
        new_courses.append(curso)
        print(f"  ✓ Curso criado: {curso['name']}")
    
    # Buscar todos os cursos
    all_courses = await db.courses.find({}, {"_id": 0}).to_list(20)
    print(f"\n✅ Total de cursos no sistema: {len(all_courses)}")
    
    # Criar 5 turmas para cada curso
    print(f"\n🏫 Criando 5 turmas para cada curso ({len(all_courses)} x 5 = {len(all_courses) * 5} turmas)...")
    all_turmas = []
    
    for course in all_courses:
        for i in range(5):
            periodo = PERIODOS[i % len(PERIODOS)]
            ano = random.choice(ANOS)
            
            turma = {
                "id": str(uuid.uuid4()),
                "name": f"{course['name']} - {ano}.{i+1}",
                "course_id": course["id"],
                "course_name": course["name"],
                "period": periodo,
                "year": ano,
                "active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.turmas.insert_one(turma)
            all_turmas.append(turma)
        
        print(f"  ✓ 5 turmas criadas para: {course['name']}")
    
    print(f"\n✅ Total de turmas criadas: {len(all_turmas)}")
    
    # Criar 30 alunos para cada turma
    total_alunos = len(all_turmas) * 30
    print(f"\n👨‍🎓 Criando 30 alunos para cada turma ({len(all_turmas)} x 30 = {total_alunos} alunos)...")
    print("⏳ Isso pode levar alguns minutos (gerando fotos únicas)...")
    
    alunos_criados = 0
    
    for idx, turma in enumerate(all_turmas):
        print(f"\n  📋 Turma {idx+1}/{len(all_turmas)}: {turma['name']}")
        
        for j in range(30):
            # Gerar dados únicos para o aluno
            name = generate_student_name()
            seed = f"{turma['id']}-{j}-{uuid.uuid4()}"
            
            # Gerar foto (avatar)
            photo = get_avatar_base64(seed)
            
            aluno = {
                "id": str(uuid.uuid4()),
                "name": name,
                "email": generate_email(name),
                "phone": generate_phone(),
                "birth_date": generate_birth_date(),
                "photo": photo,
                "turma_id": turma["id"],
                "turma_name": turma["name"],
                "course_name": turma["course_name"],
                "status": "active",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.students.insert_one(aluno)
            alunos_criados += 1
            
            # Progresso a cada 10 alunos
            if (j + 1) % 10 == 0:
                print(f"    ✓ {j+1}/30 alunos criados para esta turma")
    
    print(f"\n🎉 SEED CONCLUÍDO COM SUCESSO!")
    print(f"\n📊 Resumo:")
    print(f"  • Cursos: {len(all_courses)}")
    print(f"  • Turmas: {len(all_turmas)}")
    print(f"  • Alunos: {alunos_criados}")
    print(f"  • Fotos únicas geradas: {alunos_criados}")

if __name__ == "__main__":
    asyncio.run(seed_database())
