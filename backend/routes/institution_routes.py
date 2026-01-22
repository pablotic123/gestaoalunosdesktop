from fastapi import APIRouter, HTTPException, status, Depends
from models import Institution, InstitutionUpdate
from auth import get_current_user, get_current_admin_user
from database import db
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/institution", tags=["institution"])

@router.get("/", response_model=Institution)
async def get_institution(current_user: dict = Depends(get_current_user)):
    institution = await db.institution.find_one({}, {"_id": 0})
    
    if not institution:
        default_institution = {
            "id": str(uuid.uuid4()),
            "name": "Minha Instituição",
            "address": "",
            "phone": "",
            "email": "",
            "logo": "",
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        await db.institution.insert_one(default_institution)
        institution = default_institution
    
    if isinstance(institution['updated_at'], str):
        institution['updated_at'] = datetime.fromisoformat(institution['updated_at'])
    
    return Institution(**institution)

@router.put("/", response_model=Institution)
async def update_institution(
    institution_data: InstitutionUpdate,
    current_user: dict = Depends(get_current_admin_user)
):
    existing = await db.institution.find_one({}, {"_id": 0})
    
    if not existing:
        institution_dict = institution_data.model_dump()
        institution_dict["id"] = str(uuid.uuid4())
        institution_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.institution.insert_one(institution_dict)
    else:
        update_data = institution_data.model_dump()
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.institution.update_one({"id": existing["id"]}, {"$set": update_data})
    
    updated_institution = await db.institution.find_one({}, {"_id": 0})
    if isinstance(updated_institution['updated_at'], str):
        updated_institution['updated_at'] = datetime.fromisoformat(updated_institution['updated_at'])
    
    return Institution(**updated_institution)