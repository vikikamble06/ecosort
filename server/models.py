from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    address: Optional[str] = None
    phone: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class AnalyzeRequest(BaseModel):
    image_data: Optional[str] = None  # Base64 data if direct or sample key
    filename: Optional[str] = "item.jpg"
    hint: Optional[str] = None

class ConfirmClassificationRequest(BaseModel):
    classification_id: Optional[int] = None
    predicted_item_name: str
    category_id: int
    confirmed_category_id: int
    notes: Optional[str] = None
    image_url: Optional[str] = None
    confidence: Optional[float] = 0.95
    model_provider: Optional[str] = "EcoSort Deterministic Knowledge Classifier"

class CreateBookingRequest(BaseModel):
    waste_category_id: int
    estimated_weight_kg: float = Field(..., gt=0, le=500)
    pickup_address: str = Field(..., min_length=5)
    preferred_date: str = Field(..., description="YYYY-MM-DD")
    time_slot: str
    contact_preference: Optional[str] = "Phone Call"
    notes: Optional[str] = None

class CancelBookingRequest(BaseModel):
    cancellation_reason: str = Field(..., min_length=3)

class WasteItemCreateRequest(BaseModel):
    name: str
    aliases: str
    category_id: int
    preparation_steps: str
    disposal_method: str
    recyclability_status: str
    warnings: Optional[str] = None
    facility_type_needed: Optional[str] = None
    source: str
    region: Optional[str] = "Universal / Municipal Standard"
    popular: Optional[int] = 0

class WasteItemUpdateRequest(BaseModel):
    name: Optional[str] = None
    aliases: Optional[str] = None
    category_id: Optional[int] = None
    preparation_steps: Optional[str] = None
    disposal_method: Optional[str] = None
    recyclability_status: Optional[str] = None
    warnings: Optional[str] = None
    facility_type_needed: Optional[str] = None
    source: Optional[str] = None
    region: Optional[str] = None
    popular: Optional[int] = None

class UpdateBookingStatusRequest(BaseModel):
    status: str = Field(..., pattern="^(requested|confirmed|assigned|collected|cancelled)$")
    cancellation_reason: Optional[str] = None

class FacilityCreateRequest(BaseModel):
    name: str
    facility_type: str
    address: str
    city: str
    postal_code: Optional[str] = None
    latitude: float
    longitude: float
    phone: Optional[str] = None
    operating_hours: str
    supported_materials: List[str]
    verified: Optional[int] = 1
