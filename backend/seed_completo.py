"""
Script de Seed - Popula o banco de dados com:
- 4 cursos
- 3 turmas por curso (12 turmas)
- 35 alunos por turma (420 alunos)
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os
import uuid
from datetime import datetime, timezone
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Conectar ao MongoDB
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'sge_database')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Dados dos cursos
CURSOS = [
    {"name": "Engenharia de Software", "workload": 3200, "description": "Curso de graduação em Engenharia de Software com foco em desenvolvimento de sistemas e metodologias ágeis."},
    {"name": "Administração de Empresas", "workload": 3000, "description": "Curso de graduação em Administração com ênfase em gestão empresarial e empreendedorismo."},
    {"name": "Ciências Contábeis", "workload": 2800, "description": "Curso de graduação em Ciências Contábeis preparando profissionais para auditoria, controladoria e finanças."},
    {"name": "Direito", "workload": 3700, "description": "Curso de graduação em Direito formando bacharéis para advocacia, magistratura e carreiras jurídicas."},
]

# Períodos para turmas
PERIODOS = ["Matutino", "Vespertino", "Noturno"]

# Nomes brasileiros para gerar alunos
NOMES = [
    "Ana", "Bruno", "Carla", "Daniel", "Elena", "Felipe", "Gabriela", "Henrique", "Isabela", "João",
    "Karina", "Lucas", "Mariana", "Nicolas", "Olivia", "Pedro", "Quezia", "Rafael", "Sofia", "Thiago",
    "Ursula", "Vitor", "Wesley", "Ximena", "Yuri", "Zilda", "Amanda", "Bernardo", "Camila", "Diego",
    "Eduarda", "Fernando", "Giovana", "Hugo", "Ingrid", "Julio", "Kelly", "Leonardo", "Melissa", "Nathan",
    "Patricia", "Ricardo", "Sabrina", "Tiago", "Valentina", "William", "Alice", "Arthur", "Beatriz", "Caio",
    "Diana", "Eduardo", "Fernanda", "Guilherme", "Helena", "Igor", "Julia", "Kevin", "Laura", "Matheus",
    "Natalia", "Otavio", "Priscila", "Renan", "Sara", "Tales", "Vanessa", "Wagner", "Yasmin", "Augusto"
]

SOBRENOMES = [
    "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
    "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
    "Rocha", "Dias", "Nascimento", "Andrade", "Moreira", "Nunes", "Marques", "Machado", "Mendes", "Freitas",
    "Cardoso", "Ramos", "Gonçalves", "Santana", "Teixeira", "Araújo", "Pinto", "Correia", "Monteiro", "Batista"
]

def gerar_nome():
    """Gera um nome completo aleatório"""
    nome = random.choice(NOMES)
    sobrenome1 = random.choice(SOBRENOMES)
    sobrenome2 = random.choice(SOBRENOMES)
    return f"{nome} {sobrenome1} {sobrenome2}"

def gerar_email(nome):
    """Gera um email baseado no nome"""
    partes = nome.lower().split()
    email = f"{partes[0]}.{partes[-1]}{random.randint(1, 99)}@email.com"
    return email.replace(" ", "")

def gerar_telefone():
    """Gera um telefone brasileiro"""
    ddd = random.choice(["11", "21", "31", "41", "51", "61", "71", "81", "85", "92"])
    numero = f"9{random.randint(1000, 9999)}-{random.randint(1000, 9999)}"
    return f"({ddd}) {numero}"

def gerar_data_nascimento():
    """Gera uma data de nascimento entre 18 e 30 anos atrás"""
    ano = random.randint(1995, 2006)
    mes = random.randint(1, 12)
    dia = random.randint(1, 28)
    return f"{ano}-{mes:02d}-{dia:02d}"

async def limpar_dados():
    """Remove dados existentes"""
    print("🗑️  Limpando dados existentes...")
    await db.students.delete_many({})
    await db.turmas.delete_many({})
    await db.courses.delete_many({})
    print("✅ Dados limpos!")

async def criar_cursos():
    """Cria os 4 cursos"""
    print("\n📚 Criando cursos...")
    cursos_criados = []
    
    for curso_data in CURSOS:
        curso = {
            "id": str(uuid.uuid4()),
            "name": curso_data["name"],
            "workload": curso_data["workload"],
            "description": curso_data["description"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.courses.insert_one(curso)
        cursos_criados.append(curso)
        print(f"   ✓ {curso['name']} ({curso['workload']}h)")
    
    print(f"✅ {len(cursos_criados)} cursos criados!")
    return cursos_criados

async def criar_turmas(cursos):
    """Cria 3 turmas por curso"""
    print("\n🏫 Criando turmas...")
    turmas_criadas = []
    ano_atual = datetime.now().year
    
    for curso in cursos:
        for i, periodo in enumerate(PERIODOS):
            turma = {
                "id": str(uuid.uuid4()),
                "name": f"{curso['name'][:3].upper()}-{ano_atual}.{i+1}",
                "course_id": curso["id"],
                "course_name": curso["name"],
                "period": periodo,
                "year": ano_atual,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.turmas.insert_one(turma)
            turmas_criadas.append(turma)
            print(f"   ✓ {turma['name']} - {periodo} ({curso['name']})")
    
    print(f"✅ {len(turmas_criadas)} turmas criadas!")
    return turmas_criadas

async def criar_alunos(turmas):
    """Cria 35 alunos por turma"""
    print("\n👨‍🎓 Criando alunos...")
    total_alunos = 0
    
    for turma in turmas:
        print(f"   📝 Turma {turma['name']}...", end=" ")
        alunos_turma = []
        
        for _ in range(35):
            nome = gerar_nome()
            aluno = {
                "id": str(uuid.uuid4()),
                "name": nome,
                "email": gerar_email(nome),
                "phone": gerar_telefone(),
                "birth_date": gerar_data_nascimento(),
                "turma_id": turma["id"],
                "turma_name": turma["name"],
                "course_name": turma["course_name"],
                "photo": "",  # Sem foto por padrão
                "status": random.choices(["active", "inactive", "graduated"], weights=[85, 10, 5])[0],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            alunos_turma.append(aluno)
        
        await db.students.insert_many(alunos_turma)
        total_alunos += len(alunos_turma)
        print(f"✓ 35 alunos")
    
    print(f"\n✅ {total_alunos} alunos criados no total!")
    return total_alunos

async def main():
    print("=" * 60)
    print("🎓 SGE - Script de Seed do Banco de Dados")
    print("=" * 60)
    print(f"\n📊 Configuração:")
    print(f"   • 4 cursos")
    print(f"   • 3 turmas por curso (12 turmas)")
    print(f"   • 35 alunos por turma (420 alunos)")
    print(f"\n🔗 Conectando ao MongoDB: {mongo_url}")
    print(f"📁 Banco de dados: {db_name}")
    
    try:
        # Limpar dados existentes
        await limpar_dados()
        
        # Criar dados
        cursos = await criar_cursos()
        turmas = await criar_turmas(cursos)
        total_alunos = await criar_alunos(turmas)
        
        # Resumo final
        print("\n" + "=" * 60)
        print("📊 RESUMO FINAL")
        print("=" * 60)
        print(f"   ✅ Cursos: {len(cursos)}")
        print(f"   ✅ Turmas: {len(turmas)}")
        print(f"   ✅ Alunos: {total_alunos}")
        print("\n🎉 Seed concluído com sucesso!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Erro durante o seed: {e}")
        raise
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
