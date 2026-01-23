from fastapi import APIRouter, HTTPException, status, Depends
from models import Course, CourseCreate, CourseUpdate
from auth import get_current_user, get_current_admin_user
from database import db
from datetime import datetime, timezone
from typing import List
import uuid

router = APIRouter(prefix="/courses", tags=["courses"])

@router.post("", response_model=Course, status_code=status.HTTP_201_CREATED)
async def create_course(course_data: CourseCreate, current_user: dict = Depends(get_current_admin_user)):
    course_dict = course_data.model_dump()
    course_dict["id"] = str(uuid.uuid4())
    course_dict["active"] = True
    course_dict["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.courses.insert_one(course_dict)
    
    course_dict['created_at'] = datetime.fromisoformat(course_dict['created_at'])
    return Course(**course_dict)

@router.get("", response_model=List[Course])
async def get_courses(current_user: dict = Depends(get_current_user)):
    courses = await db.courses.find({}, {"_id": 0}).to_list(1000)
    
    for course in courses:
        if isinstance(course['created_at'], str):
            course['created_at'] = datetime.fromisoformat(course['created_at'])
    
    return courses

@router.get("/{course_id}", response_model=Course)
async def get_course(course_id: str, current_user: dict = Depends(get_current_user)):
    course_doc = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso não encontrado",
        )
    
    if isinstance(course_doc['created_at'], str):
        course_doc['created_at'] = datetime.fromisoformat(course_doc['created_at'])
    
    return Course(**course_doc)

@router.put("/{course_id}", response_model=Course)
async def update_course(
    course_id: str,
    course_data: CourseUpdate,
    current_user: dict = Depends(get_current_admin_user)
):
    existing_course = await db.courses.find_one({"id": course_id})
    if not existing_course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso não encontrado",
        )
    
    update_data = course_data.model_dump(exclude_unset=True)
    await db.courses.update_one({"id": course_id}, {"$set": update_data})
    
    updated_course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if isinstance(updated_course['created_at'], str):
        updated_course['created_at'] = datetime.fromisoformat(updated_course['created_at'])
    
    return Course(**updated_course)

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(course_id: str, current_user: dict = Depends(get_current_admin_user)):
    result = await db.courses.delete_one({"id": course_id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Curso não encontrado",
        )