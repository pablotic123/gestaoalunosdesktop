from fastapi import APIRouter, HTTPException, status, Depends
from models import Student, StudentCreate, StudentUpdate, StudentStatus
from auth import get_current_user
from database import db
from datetime import datetime, timezone
from typing import List, Optional
import uuid

router = APIRouter(prefix="/students", tags=["students"])

@router.post("/", response_model=Student, status_code=status.HTTP_201_CREATED)
async def create_student(student_data: StudentCreate, current_user: dict = Depends(get_current_user)):
    turma_doc = await db.turmas.find_one({"id": student_data.turma_id}, {"_id": 0})
    if not turma_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Turma não encontrada",
        )
    
    student_dict = student_data.model_dump()
    student_dict["id"] = str(uuid.uuid4())
    student_dict["turma_name"] = turma_doc["name"]
    student_dict["course_name"] = turma_doc["course_name"]
    student_dict["status"] = StudentStatus.ACTIVE
    student_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.students.insert_one(student_dict)
    
    student_dict['created_at'] = datetime.fromisoformat(student_dict['created_at'])
    return Student(**student_dict)

@router.get("/", response_model=List[Student])
async def get_students(
    turma_id: Optional[str] = None,
    status_filter: Optional[StudentStatus] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {}
    if turma_id:
        query["turma_id"] = turma_id
    if status_filter:
        query["status"] = status_filter
    
    students = await db.students.find(query, {"_id": 0}).to_list(1000)
    
    for student in students:
        if isinstance(student['created_at'], str):
            student['created_at'] = datetime.fromisoformat(student['created_at'])
    
    return students

@router.get("/{student_id}", response_model=Student)
async def get_student(student_id: str, current_user: dict = Depends(get_current_user)):
    student_doc = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not student_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado",
        )
    
    if isinstance(student_doc['created_at'], str):
        student_doc['created_at'] = datetime.fromisoformat(student_doc['created_at'])
    
    return Student(**student_doc)

@router.put("/{student_id}", response_model=Student)
async def update_student(
    student_id: str,
    student_data: StudentUpdate,
    current_user: dict = Depends(get_current_user)
):
    existing_student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if not existing_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado",
        )
    
    update_data = student_data.model_dump(exclude_unset=True)
    
    if "turma_id" in update_data:
        turma_doc = await db.turmas.find_one({"id": update_data["turma_id"]}, {"_id": 0})
        if not turma_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Turma não encontrada",
            )
        update_data["turma_name"] = turma_doc["name"]
        update_data["course_name"] = turma_doc["course_name"]
    
    await db.students.update_one({"id": student_id}, {"$set": update_data})
    
    updated_student = await db.students.find_one({"id": student_id}, {"_id": 0})
    if isinstance(updated_student['created_at'], str):
        updated_student['created_at'] = datetime.fromisoformat(updated_student['created_at'])
    
    return Student(**updated_student)

@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(student_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.students.delete_one({"id": student_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado",
        )