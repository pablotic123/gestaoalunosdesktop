from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    PROFESSOR = "professor"

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    email: str
    name: str
    role: UserRole
    active: bool = True
    created_at: datetime

class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role: UserRole = UserRole.PROFESSOR

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class Institution(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    logo: Optional[str] = None
    updated_at: datetime

class InstitutionUpdate(BaseModel):
    name: str
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    logo: Optional[str] = None

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    workload: int
    description: Optional[str] = None
    active: bool = True
    created_at: datetime

class CourseCreate(BaseModel):
    name: str
    workload: int
    description: Optional[str] = None

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    workload: Optional[int] = None
    description: Optional[str] = None
    active: Optional[bool] = None

class Turma(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    course_id: str
    course_name: str
    period: str
    year: int
    active: bool = True
    created_at: datetime

class TurmaCreate(BaseModel):
    name: str
    course_id: str
    period: str
    year: int

class TurmaUpdate(BaseModel):
    name: Optional[str] = None
    course_id: Optional[str] = None
    period: Optional[str] = None
    year: Optional[int] = None
    active: Optional[bool] = None

class StudentStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    GRADUATED = "graduated"

class Student(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    photo: Optional[str] = None
    turma_id: str
    turma_name: str
    course_name: str
    status: StudentStatus = StudentStatus.ACTIVE
    created_at: datetime

class StudentCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    photo: Optional[str] = None
    turma_id: str

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    birth_date: Optional[str] = None
    photo: Optional[str] = None
    turma_id: Optional[str] = None
    status: Optional[StudentStatus] = None

class DashboardMetrics(BaseModel):
    total_students: int
    active_students: int
    total_turmas: int
    total_courses: int
    students_by_course: List[dict]
    recent_students: List[Student]