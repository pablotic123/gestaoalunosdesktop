from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def init_db():
    await db.users.create_index("email", unique=True)
    await db.courses.create_index("name")
    await db.turmas.create_index("name")
    await db.students.create_index("name")
    await db.students.create_index("turma_id")