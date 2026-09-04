import os
import shutil
from pathlib import Path

from fastapi import FastAPI, Depends, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from datetime import datetime

from database import Base, engine, get_db
from models.pothole import Pothole
from models.complaint import Complaint
from models.inspection import Inspection
from models.work_order import WorkOrder
from models.pothole_detector import PotholeDetector


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="PotholeVision API",
    description="AI-powered pothole detection and road infrastructure management API",
    version="1.0.0",
)


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# AI MODEL
# =========================================================

detector = PotholeDetector()


# =========================================================
# DIRECTORIES
# =========================================================

IMAGE_UPLOAD_DIR = Path("uploads/images")
VIDEO_UPLOAD_DIR = Path("uploads/videos")

IMAGE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
VIDEO_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to PotholeVision API",
        "status": "running",
        "version": "1.0.0",
        "ai": "YOLO pothole detection",
        "video_tracking": "ByteTrack",
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "status": "healthy",
            "database": "connected",
            "service": "PotholeVision API",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
        }


# =========================================================
# CREATE POTHOLE REPORT
# =========================================================

@app.post("/potholes")
def create_pothole(
    latitude: float,
    longitude: float,
    severity: str = "medium",
    confidence: float = 0.0,
    description: str = "",
    db: Session = Depends(get_db),
):
    pothole = Pothole(
        latitude=latitude,
        longitude=longitude,
        severity=severity,
        confidence=confidence,
        description=description,
    )

    db.add(pothole)
    db.commit()
    db.refresh(pothole)

    return {
        "message": "Pothole reported successfully",
        "pothole_id": pothole.id,
        "latitude": pothole.latitude,
        "longitude": pothole.longitude,
        "severity": pothole.severity,
        "confidence": pothole.confidence,
        "status": pothole.status,
    }


# =========================================================
# GET POTHOLES
# =========================================================

@app.get("/potholes")
def get_potholes(
    db: Session = Depends(get_db),
):
    potholes = (
        db.query(Pothole)
        .order_by(Pothole.created_at.desc())
        .all()
    )

    return [
        {
            "id": p.id,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "severity": p.severity,
            "confidence": p.confidence,
            "image_path": p.image_path,
            "status": p.status,
            "description": p.description,
            "created_at": p.created_at,
        }
        for p in potholes
    ]


# =========================================================
# AI IMAGE DETECTION
# =========================================================

@app.post("/detect/image")
async def detect_image(
    file: UploadFile = File(...),
    latitude: float | None = None,
    longitude: float | None = None,
    db: Session = Depends(get_db),
):
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG, and WEBP images are supported.",
        )

    safe_filename = Path(file.filename).name

    if not safe_filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid file name.",
        )

    file_path = IMAGE_UPLOAD_DIR / safe_filename

    try:
        # Save image
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Real AI detection
        detections = detector.detect(str(file_path))

        saved_potholes = []

        # Save every detected pothole
        for detection in detections:
            confidence = float(
                detection.get("confidence", 0.0)
            )

            if confidence >= 0.80:
                severity = "high"
            elif confidence >= 0.50:
                severity = "medium"
            else:
                severity = "low"

            pothole = Pothole(
                latitude=latitude,
                longitude=longitude,
                severity=severity,
                confidence=confidence,
                image_path=str(file_path),
                status="reported",
                description=(
                    f"AI detected pothole in image "
                    f"'{safe_filename}'. "
                    f"Bounding box: "
                    f"{detection.get('bounding_box', {})}"
                ),
            )

            db.add(pothole)
            db.flush()

            saved_potholes.append(
                {
                    "pothole_id": pothole.id,
                    "severity": severity,
                    "confidence": confidence,
                    "bounding_box": detection.get(
                        "bounding_box",
                        {},
                    ),
                }
            )

        db.commit()

        return {
            "success": True,
            "type": "image",
            "filename": safe_filename,
            "image_path": str(file_path),
            "potholes_detected": len(detections),
            "database_records_created": len(saved_potholes),
            "saved_potholes": saved_potholes,
            "detections": detections,
        }

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Image detection failed: {str(e)}",
        )

    finally:
        await file.close()


# =========================================================
# AI VIDEO DETECTION + TRACKING
# =========================================================

@app.post("/detect/video")
async def detect_video(
    file: UploadFile = File(...),
    latitude: float | None = None,
    longitude: float | None = None,
    db: Session = Depends(get_db),
):
    allowed_types = {
        "video/mp4",
        "video/mpeg",
        "video/quicktime",
        "video/x-msvideo",
        "video/webm",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported video format. "
                "Use MP4, MPEG, MOV, AVI, or WEBM."
            ),
        )

    safe_filename = Path(file.filename).name

    if not safe_filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid file name.",
        )

    input_path = VIDEO_UPLOAD_DIR / safe_filename

    output_filename = (
        f"{Path(safe_filename).stem}_annotated.mp4"
    )

    output_path = VIDEO_UPLOAD_DIR / output_filename

    try:
        # Save uploaded video
        with input_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Real YOLO + ByteTrack
        result = detector.detect_video(
            str(input_path),
            str(output_path),
        )

        # Get unique tracked potholes
        unique_tracks = {}

        for detection in result.get("detections", []):
            track_id = detection.get("track_id")

            if track_id is None:
                continue

            confidence = float(
                detection.get("confidence", 0.0)
            )

            if (
                track_id not in unique_tracks
                or confidence
                > unique_tracks[track_id]["confidence"]
            ):
                unique_tracks[track_id] = detection

        # Save detected potholes
        saved_potholes = []

        for track_id, detection in unique_tracks.items():

            confidence = float(
                detection.get("confidence", 0.0)
            )

            bbox = detection.get(
                "bounding_box",
                {},
            )

            if confidence >= 0.80:
                severity = "high"
            elif confidence >= 0.50:
                severity = "medium"
            else:
                severity = "low"

            description = (
                f"AI detected pothole from video "
                f"'{safe_filename}'. "
                f"Track ID: {track_id}. "
                f"Frame: {detection.get('frame')}. "
                f"Bounding box: {bbox}."
            )

            pothole = Pothole(
                latitude=latitude,
                longitude=longitude,
                severity=severity,
                confidence=confidence,
                image_path=str(output_path),
                status="reported",
                description=description,
            )

            db.add(pothole)
            db.flush()

            saved_potholes.append(
                {
                    "pothole_id": pothole.id,
                    "track_id": track_id,
                    "severity": severity,
                    "confidence": confidence,
                }
            )

        db.commit()

        return {
            "success": True,
            "type": "video",
            "filename": safe_filename,
            "video_path": str(input_path),
            "annotated_video": str(output_path),
            "total_frames": result.get(
                "total_frames",
                0,
            ),
            "processed_frames": result.get(
                "processed_frames",
                0,
            ),
            "unique_potholes": result.get(
                "unique_potholes",
                0,
            ),
            "database_records_created": len(
                saved_potholes
            ),
            "saved_potholes": saved_potholes,
            "detections": result.get(
                "detections",
                [],
            ),
        }

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Video detection failed: {str(e)}",
        )

    finally:
        await file.close()


# =========================================================
# COMPLAINT SCHEMA
# =========================================================

class ComplaintCreate(BaseModel):
    pothole_id: int | None = None
    citizen_name: str | None = None
    citizen_email: str | None = None
    description: str


class ComplaintStatusUpdate(BaseModel):
    status: str


# =========================================================
# CREATE COMPLAINT
# =========================================================

@app.post("/complaints")
def create_complaint(
    complaint_data: ComplaintCreate,
    db: Session = Depends(get_db),
):
    # If pothole ID is supplied, verify that pothole exists
    if complaint_data.pothole_id is not None:
        pothole = (
            db.query(Pothole)
            .filter(
                Pothole.id == complaint_data.pothole_id
            )
            .first()
        )

        if pothole is None:
            raise HTTPException(
                status_code=404,
                detail="Pothole not found.",
            )

    if not complaint_data.description.strip():
        raise HTTPException(
            status_code=400,
            detail="Complaint description is required.",
        )

    complaint = Complaint(
        pothole_id=complaint_data.pothole_id,
        citizen_name=complaint_data.citizen_name,
        citizen_email=complaint_data.citizen_email,
        description=complaint_data.description.strip(),
        status="submitted",
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    return {
        "success": True,
        "message": "Complaint submitted successfully",
        "complaint_id": complaint.id,
        "pothole_id": complaint.pothole_id,
        "citizen_name": complaint.citizen_name,
        "citizen_email": complaint.citizen_email,
        "description": complaint.description,
        "status": complaint.status,
        "created_at": complaint.created_at,
    }


# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@app.get("/complaints")
def get_complaints(
    db: Session = Depends(get_db),
):
    complaints = (
        db.query(Complaint)
        .order_by(Complaint.created_at.desc())
        .all()
    )

    return [
        {
            "id": complaint.id,
            "pothole_id": complaint.pothole_id,
            "citizen_name": complaint.citizen_name,
            "citizen_email": complaint.citizen_email,
            "description": complaint.description,
            "status": complaint.status,
            "created_at": complaint.created_at,
        }
        for complaint in complaints
    ]


# =========================================================
# GET SINGLE COMPLAINT
# =========================================================

@app.get("/complaints/{complaint_id}")
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
):
    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found.",
        )

    return {
        "id": complaint.id,
        "pothole_id": complaint.pothole_id,
        "citizen_name": complaint.citizen_name,
        "citizen_email": complaint.citizen_email,
        "description": complaint.description,
        "status": complaint.status,
        "created_at": complaint.created_at,
    }


# =========================================================
# UPDATE COMPLAINT STATUS
# =========================================================

@app.put("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    status_data: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
):
    allowed_statuses = {
        "submitted",
        "under_review",
        "inspection_scheduled",
        "work_order_created",
        "in_progress",
        "resolved",
        "rejected",
    }

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Allowed values: "
                f"{sorted(allowed_statuses)}"
            ),
        )

    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found.",
        )

    complaint.status = status_data.status

    db.commit()
    db.refresh(complaint)

    return {
        "success": True,
        "message": "Complaint status updated",
        "complaint_id": complaint.id,
        "status": complaint.status,
    }


# =========================================================
# DOWNLOAD / VIEW ANNOTATED VIDEO
# =========================================================

@app.get("/videos/{filename}")
def get_video(filename: str):

    safe_filename = Path(filename).name

    video_path = VIDEO_UPLOAD_DIR / safe_filename

    if not video_path.exists():
        raise HTTPException(
            status_code=404,
            detail="Video not found.",
        )

    return FileResponse(
        path=str(video_path),
        media_type="video/mp4",
        filename=safe_filename,
    )
    
    # =========================================================
# INSPECTION SCHEMA
# =========================================================

class InspectionCreate(BaseModel):
    pothole_id: int
    complaint_id: int | None = None
    inspector_name: str
    inspection_notes: str | None = None
    confirmed_severity: str | None = None


class InspectionStatusUpdate(BaseModel):
    status: str


# =========================================================
# CREATE AUTHORITY INSPECTION
# =========================================================

@app.post("/inspections")
def create_inspection(
    inspection_data: InspectionCreate,
    db: Session = Depends(get_db),
):
    # Verify pothole exists
    pothole = (
        db.query(Pothole)
        .filter(Pothole.id == inspection_data.pothole_id)
        .first()
    )

    if pothole is None:
        raise HTTPException(
            status_code=404,
            detail="Pothole not found.",
        )

    # Verify complaint if supplied
    if inspection_data.complaint_id is not None:
        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.id == inspection_data.complaint_id
            )
            .first()
        )

        if complaint is None:
            raise HTTPException(
                status_code=404,
                detail="Complaint not found.",
            )

    if not inspection_data.inspector_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Inspector name is required.",
        )

    inspection = Inspection(
        pothole_id=inspection_data.pothole_id,
        complaint_id=inspection_data.complaint_id,
        inspector_name=inspection_data.inspector_name.strip(),
        inspection_notes=inspection_data.inspection_notes,
        confirmed_severity=inspection_data.confirmed_severity,
        status="scheduled",
    )

    db.add(inspection)
    db.commit()
    db.refresh(inspection)

    return {
        "success": True,
        "message": "Inspection created successfully",
        "inspection_id": inspection.id,
        "pothole_id": inspection.pothole_id,
        "complaint_id": inspection.complaint_id,
        "inspector_name": inspection.inspector_name,
        "confirmed_severity": inspection.confirmed_severity,
        "status": inspection.status,
        "created_at": inspection.created_at,
    }


# =========================================================
# GET ALL INSPECTIONS
# =========================================================

@app.get("/inspections")
def get_inspections(
    db: Session = Depends(get_db),
):
    inspections = (
        db.query(Inspection)
        .order_by(Inspection.created_at.desc())
        .all()
    )

    return [
        {
            "id": inspection.id,
            "pothole_id": inspection.pothole_id,
            "complaint_id": inspection.complaint_id,
            "inspector_name": inspection.inspector_name,
            "inspection_notes": inspection.inspection_notes,
            "confirmed_severity": inspection.confirmed_severity,
            "status": inspection.status,
            "inspected_at": inspection.inspected_at,
            "created_at": inspection.created_at,
        }
        for inspection in inspections
    ]


# =========================================================
# UPDATE INSPECTION STATUS
# =========================================================

@app.put("/inspections/{inspection_id}/status")
def update_inspection_status(
    inspection_id: int,
    status_data: InspectionStatusUpdate,
    db: Session = Depends(get_db),
):
    allowed_statuses = {
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
    }

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid inspection status. "
                f"Allowed values: {sorted(allowed_statuses)}"
            ),
        )

    inspection = (
        db.query(Inspection)
        .filter(Inspection.id == inspection_id)
        .first()
    )

    if inspection is None:
        raise HTTPException(
            status_code=404,
            detail="Inspection not found.",
        )

    inspection.status = status_data.status

    if status_data.status == "completed":
        inspection.inspected_at = datetime.utcnow()

    db.commit()
    db.refresh(inspection)

    return {
        "success": True,
        "message": "Inspection status updated",
        "inspection_id": inspection.id,
        "status": inspection.status,
        "inspected_at": inspection.inspected_at,
    }
    
    # =========================================================
# WORK ORDER SCHEMA
# =========================================================

class WorkOrderCreate(BaseModel):
    pothole_id: int
    inspection_id: int | None = None
    contractor_name: str
    work_description: str
    priority: str = "medium"
    estimated_cost: float | None = None
    scheduled_date: datetime | None = None


class WorkOrderStatusUpdate(BaseModel):
    status: str


# =========================================================
# CREATE WORK ORDER
# =========================================================

@app.post("/work-orders")
def create_work_order(
    work_order_data: WorkOrderCreate,
    db: Session = Depends(get_db),
):
    # Verify pothole exists
    pothole = (
        db.query(Pothole)
        .filter(Pothole.id == work_order_data.pothole_id)
        .first()
    )

    if pothole is None:
        raise HTTPException(
            status_code=404,
            detail="Pothole not found.",
        )

    # Verify inspection if supplied
    if work_order_data.inspection_id is not None:
        inspection = (
            db.query(Inspection)
            .filter(
                Inspection.id == work_order_data.inspection_id
            )
            .first()
        )

        if inspection is None:
            raise HTTPException(
                status_code=404,
                detail="Inspection not found.",
            )

    allowed_priorities = {
        "low",
        "medium",
        "high",
        "critical",
    }

    if work_order_data.priority not in allowed_priorities:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid priority. "
                f"Allowed values: {sorted(allowed_priorities)}"
            ),
        )

    if not work_order_data.contractor_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Contractor name is required.",
        )

    if not work_order_data.work_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Work description is required.",
        )

    work_order = WorkOrder(
        pothole_id=work_order_data.pothole_id,
        inspection_id=work_order_data.inspection_id,
        contractor_name=work_order_data.contractor_name.strip(),
        work_description=work_order_data.work_description.strip(),
        priority=work_order_data.priority,
        status="assigned",
        estimated_cost=work_order_data.estimated_cost,
        scheduled_date=work_order_data.scheduled_date,
    )

    db.add(work_order)
    db.commit()
    db.refresh(work_order)

    return {
        "success": True,
        "message": "Work order created successfully",
        "work_order_id": work_order.id,
        "pothole_id": work_order.pothole_id,
        "inspection_id": work_order.inspection_id,
        "contractor_name": work_order.contractor_name,
        "work_description": work_order.work_description,
        "priority": work_order.priority,
        "status": work_order.status,
        "estimated_cost": work_order.estimated_cost,
        "scheduled_date": work_order.scheduled_date,
        "created_at": work_order.created_at,
    }


# =========================================================
# GET ALL WORK ORDERS
# =========================================================

@app.get("/work-orders")
def get_work_orders(
    db: Session = Depends(get_db),
):
    work_orders = (
        db.query(WorkOrder)
        .order_by(WorkOrder.created_at.desc())
        .all()
    )

    return [
        {
            "id": work_order.id,
            "pothole_id": work_order.pothole_id,
            "inspection_id": work_order.inspection_id,
            "contractor_name": work_order.contractor_name,
            "work_description": work_order.work_description,
            "priority": work_order.priority,
            "status": work_order.status,
            "estimated_cost": work_order.estimated_cost,
            "scheduled_date": work_order.scheduled_date,
            "completed_at": work_order.completed_at,
            "created_at": work_order.created_at,
        }
        for work_order in work_orders
    ]


# =========================================================
# UPDATE WORK ORDER STATUS
# =========================================================

@app.put("/work-orders/{work_order_id}/status")
def update_work_order_status(
    work_order_id: int,
    status_data: WorkOrderStatusUpdate,
    db: Session = Depends(get_db),
):
    allowed_statuses = {
        "assigned",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
    }

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid work order status. "
                f"Allowed values: {sorted(allowed_statuses)}"
            ),
        )

    work_order = (
        db.query(WorkOrder)
        .filter(WorkOrder.id == work_order_id)
        .first()
    )

    if work_order is None:
        raise HTTPException(
            status_code=404,
            detail="Work order not found.",
        )

    work_order.status = status_data.status

    if status_data.status == "completed":
        work_order.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(work_order)

    return {
        "success": True,
        "message": "Work order status updated",
        "work_order_id": work_order.id,
        "status": work_order.status,
        "completed_at": work_order.completed_at,
    }