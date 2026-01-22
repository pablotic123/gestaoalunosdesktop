from fastapi import APIRouter, Depends
from models import DashboardMetrics, StudentStatus
from auth import get_current_user
from database import db
from datetime import datetime

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(current_user: dict = Depends(get_current_user)):
    total_students = await db.students.count_documents({})
    active_students = await db.students.count_documents({"status": StudentStatus.ACTIVE})
    total_turmas = await db.turmas.count_documents({"active": True})
    total_courses = await db.courses.count_documents({"active": True})
    
    pipeline = [
        {
            "$group": {
                "_id": "$course_name",
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "course": "$_id",
                "count": 1
            }
        },
        {"$sort": {"count": -1}}
    ]
    
    students_by_course = await db.students.aggregate(pipeline).to_list(100)
    
    recent_students_docs = await db.students.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).limit(5).to_list(5)
    
    for student in recent_students_docs:
        if isinstance(student['created_at'], str):
            student['created_at'] = datetime.fromisoformat(student['created_at'])
    
    return DashboardMetrics(
        total_students=total_students,
        active_students=active_students,
        total_turmas=total_turmas,
        total_courses=total_courses,
        students_by_course=students_by_course,
        recent_students=recent_students_docs
    )