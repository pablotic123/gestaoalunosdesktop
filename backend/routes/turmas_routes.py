from fastapi import APIRouter, HTTPException, status, Depends
from models import Turma, TurmaCreate, TurmaUpdate
from auth import get_current_user, get_current_admin_user
from database import db
from datetime import datetime, timezone
from typing import List
import uuid

router = APIRouter(prefix="/turmas", tags=["turmas"])

@router.post("/", response_model=Turma, status_code=status.HTTP_201_CREATED)
async def create_turma(turma_data: TurmaCreate, current_user: dict = Depends(get_current_admin_user)):
    course_doc = await db.courses.find_one({"id": turma_data.course_id}, {"_id": 0})
    if not course_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso não encontrado",
        )
    
    turma_dict = turma_data.model_dump()
    turma_dict["id"] = str(uuid.uuid4())
    turma_dict["course_name"] = course_doc["name"]
    turma_dict["active"] = True
    turma_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.turmas.insert_one(turma_dict)
    
    turma_dict['created_at'] = datetime.fromisoformat(turma_dict['created_at'])
    return Turma(**turma_dict)

@router.get("/", response_model=List[Turma])
async def get_turmas(current_user: dict = Depends(get_current_user)):
    turmas = await db.turmas.find({}, {"_id": 0}).to_list(1000)
    
    for turma in turmas:
        if isinstance(turma['created_at'], str):
            turma['created_at'] = datetime.fromisoformat(turma['created_at'])
    
    return turmas

@router.get("/{turma_id}", response_model=Turma)
async def get_turma(turma_id: str, current_user: dict = Depends(get_current_user)):
    turma_doc = await db.turmas.find_one({"id": turma_id}, {"_id": 0})
    if not turma_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )
    
    if isinstance(turma_doc['created_at'], str):
        turma_doc['created_at'] = datetime.fromisoformat(turma_doc['created_at'])
    
    return Turma(**turma_doc)

@router.put("/{turma_id}", response_model=Turma)
async def update_turma(
    turma_id: str,
    turma_data: TurmaUpdate,
    current_user: dict = Depends(get_current_admin_user)
):
    existing_turma = await db.turmas.find_one({"id": turma_id})
    if not existing_turma:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )
    
    update_data = turma_data.model_dump(exclude_unset=True)
    
    if "course_id" in update_data:
        course_doc = await db.courses.find_one({"id": update_data["course_id"]}, {"_id": 0})
        if not course_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Curso não encontrado",
            )
        update_data["course_name"] = course_doc["name"]
    
    await db.turmas.update_one({"id": turma_id}, {"$set": update_data})
    
    updated_turma = await db.turmas.find_one({"id": turma_id}, {"_id": 0})
    if isinstance(updated_turma['created_at'], str):
        updated_turma['created_at'] = datetime.fromisoformat(updated_turma['created_at'])
    
    return Turma(**updated_turma)

@router.delete("/{turma_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_turma(turma_id: str, current_user: dict = Depends(get_current_admin_user)):
    result = await db.turmas.delete_one({"id": turma_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )