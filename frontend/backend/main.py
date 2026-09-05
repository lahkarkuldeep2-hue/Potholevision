import os
import math
import shutil
from pathlib import Path
from datetime import datetime

from fastapi import FastAPI, Depends, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy import text
from sqlalchemy.orm import Session

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
    description=(
        "AI-powered pothole detection and road infrastructure "
        "management API"
    ),
    version="1.1.0",
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
        "https://potholevision-seven.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# CONSTANTS
# =========================================================

GPS_DUPLICATE_RADIUS_METERS = 20.0

POTHOLE_STATUSES = {
    "reported",
    "under_review",
    "inspection_scheduled",
    "inspection_completed",
    "repair_required",
    "work_order_created",
    "in_progress",
    "resolved",
    "rejected",
    "duplicate",
}

COMPLAINT_STATUSES = {
    "submitted",
    "under_review",
    "inspection_scheduled",
    "work_order_created",
    "in_progress",
    "resolved",
    "rejected",
}

INSPECTION_STATUSES = {
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
}

WORK_ORDER_STATUSES = {
    "assigned",
    "accepted",
    "in_progress",
    "completed",
    "cancelled",
}

SEVERITIES = {
    "low",
    "medium",
    "high",
    "critical",
}


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def calculate_severity(confidence: float) -> str:
    """
    Convert AI confidence into a simple severity level.
    """

    if confidence >= 0.90:
        return "critical"

    if confidence >= 0.80:
        return "high"

    if confidence >= 0.50:
        return "medium"

    return "low"


def calculate_distance_meters(
    lat1: float,
    lon1: float,
    lat2: float,
    lon2: float,
) -> float:
    """
    Calculate geographic distance between two GPS coordinates
    using the Haversine formula.
    """

    earth_radius = 6371000.0

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)

    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad)
        * math.cos(lat2_rad)
        * math.sin(delta_lon / 2) ** 2
    )

    # Protect against tiny floating-point errors.
    a = min(1.0, max(0.0, a))

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a),
    )

    return earth_radius * c


def find_nearby_pothole(
    db: Session,
    latitude: float,
    longitude: float,
    radius_meters: float = GPS_DUPLICATE_RADIUS_METERS,
):
    """
    Find the nearest existing pothole within the given
    GPS radius.
    """

    potholes = (
        db.query(Pothole)
        .filter(
            Pothole.latitude.isnot(None),
            Pothole.longitude.isnot(None),
        )
        .all()
    )

    nearest_pothole = None
    nearest_distance = None

    for pothole in potholes:
        distance = calculate_distance_meters(
            latitude,
            longitude,
            pothole.latitude,
            pothole.longitude,
        )

        if distance <= radius_meters:
            if (
                nearest_distance is None
                or distance < nearest_distance
            ):
                nearest_pothole = pothole
                nearest_distance = distance

    return nearest_pothole, nearest_distance


def get_pothole_dict(pothole: Pothole):
    return {
        "id": pothole.id,
        "latitude": pothole.latitude,
        "longitude": pothole.longitude,
        "severity": pothole.severity,
        "confidence": pothole.confidence,
        "image_path": pothole.image_path,
        "status": pothole.status,
        "description": pothole.description,
        "created_at": pothole.created_at,
    }


def get_complaint_dict(complaint: Complaint):
    return {
        "id": complaint.id,
        "pothole_id": complaint.pothole_id,
        "citizen_name": complaint.citizen_name,
        "citizen_email": complaint.citizen_email,
        "description": complaint.description,
        "status": complaint.status,
        "created_at": complaint.created_at,
    }


def get_inspection_dict(inspection: Inspection):
    return {
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


def get_work_order_dict(work_order: WorkOrder):
    return {
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


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to PotholeVision API",
        "status": "running",
        "version": "1.1.0",
        "ai": "YOLO pothole detection",
        "video_tracking": "ByteTrack",
        "gps_duplicate_detection": True,
        "gps_duplicate_radius_meters": GPS_DUPLICATE_RADIUS_METERS,
        "workflow": (
            "Detection -> Complaint -> Inspection -> "
            "Authority Decision -> Work Order -> Repair -> Resolution"
        ),
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
            "ai_model": "loaded",
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
        }


# =========================================================
# CREATE POTHOLE REPORT
# GPS DUPLICATE MATCHING ENABLED
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
    # -----------------------------------------------------
    # Validate coordinates
    # -----------------------------------------------------

    if not -90 <= latitude <= 90:
        raise HTTPException(
            status_code=400,
            detail="Latitude must be between -90 and 90.",
        )

    if not -180 <= longitude <= 180:
        raise HTTPException(
            status_code=400,
            detail="Longitude must be between -180 and 180.",
        )

    severity = severity.lower().strip()

    if severity not in SEVERITIES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid severity. Allowed values: "
                f"{sorted(SEVERITIES)}"
            ),
        )

    if not 0 <= confidence <= 1:
        raise HTTPException(
            status_code=400,
            detail="Confidence must be between 0 and 1.",
        )

    # -----------------------------------------------------
    # GPS duplicate check
    # -----------------------------------------------------

    existing_pothole, distance = find_nearby_pothole(
        db,
        latitude,
        longitude,
        GPS_DUPLICATE_RADIUS_METERS,
    )

    if existing_pothole is not None:
        return {
            "success": True,
            "message": "Nearby pothole already exists",
            "duplicate": True,
            "pothole_id": existing_pothole.id,
            "latitude": existing_pothole.latitude,
            "longitude": existing_pothole.longitude,
            "severity": existing_pothole.severity,
            "confidence": existing_pothole.confidence,
            "status": existing_pothole.status,
            "distance_meters": round(distance, 2),
            "radius_meters": GPS_DUPLICATE_RADIUS_METERS,
        }

    # -----------------------------------------------------
    # Create new pothole
    # -----------------------------------------------------

    pothole = Pothole(
        latitude=latitude,
        longitude=longitude,
        severity=severity,
        confidence=confidence,
        description=description.strip(),
        status="reported",
    )

    db.add(pothole)
    db.commit()
    db.refresh(pothole)

    return {
        "success": True,
        "message": "Pothole reported successfully",
        "duplicate": False,
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
        get_pothole_dict(pothole)
        for pothole in potholes
    ]


# =========================================================
# GET SINGLE POTHOLE
# =========================================================

@app.get("/potholes/{pothole_id}")
def get_pothole(
    pothole_id: int,
    db: Session = Depends(get_db),
):
    pothole = (
        db.query(Pothole)
        .filter(Pothole.id == pothole_id)
        .first()
    )

    if pothole is None:
        raise HTTPException(
            status_code=404,
            detail="Pothole not found.",
        )

    return get_pothole_dict(pothole)


# =========================================================
# UPDATE POTHOLE STATUS
# =========================================================

class PotholeStatusUpdate(BaseModel):
    status: str


@app.put("/potholes/{pothole_id}/status")
def update_pothole_status(
    pothole_id: int,
    status_data: PotholeStatusUpdate,
    db: Session = Depends(get_db),
):
    status = status_data.status.lower().strip()

    if status not in POTHOLE_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid pothole status. Allowed values: "
                f"{sorted(POTHOLE_STATUSES)}"
            ),
        )

    pothole = (
        db.query(Pothole)
        .filter(Pothole.id == pothole_id)
        .first()
    )

    if pothole is None:
        raise HTTPException(
            status_code=404,
            detail="Pothole not found.",
        )

    pothole.status = status

    db.commit()
    db.refresh(pothole)

    return {
        "success": True,
        "message": "Pothole status updated",
        "pothole_id": pothole.id,
        "status": pothole.status,
    }


# =========================================================
# AI IMAGE DETECTION
# REAL YOLO MODEL
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

    if latitude is not None and not -90 <= latitude <= 90:
        raise HTTPException(
            status_code=400,
            detail="Latitude must be between -90 and 90.",
        )

    if longitude is not None and not -180 <= longitude <= 180:
        raise HTTPException(
            status_code=400,
            detail="Longitude must be between -180 and 180.",
        )

    safe_filename = Path(file.filename or "").name

    if not safe_filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid file name.",
        )

    file_path = IMAGE_UPLOAD_DIR / safe_filename

    try:
        # -------------------------------------------------
        # Save uploaded image
        # -------------------------------------------------

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # -------------------------------------------------
        # REAL AI detection
        # -------------------------------------------------

        detections = detector.detect(str(file_path))

        saved_potholes = []

        # -------------------------------------------------
        # Save each AI detection
        #
        # IMPORTANT:
        # GPS duplicate matching is intentionally NOT
        # applied here because one image can contain
        # multiple potholes at the same camera location.
        # -------------------------------------------------

        for detection in detections:
            confidence = float(
                detection.get("confidence", 0.0)
            )

            severity = calculate_severity(confidence)

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
            "gps": {
                "latitude": latitude,
                "longitude": longitude,
            },
            "potholes_detected": len(detections),
            "database_records_created": len(
                saved_potholes
            ),
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
# AI VIDEO DETECTION + BYTETRACK
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

    if latitude is not None and not -90 <= latitude <= 90:
        raise HTTPException(
            status_code=400,
            detail="Latitude must be between -90 and 90.",
        )

    if longitude is not None and not -180 <= longitude <= 180:
        raise HTTPException(
            status_code=400,
            detail="Longitude must be between -180 and 180.",
        )

    safe_filename = Path(file.filename or "").name

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
        # -------------------------------------------------
        # Save uploaded video
        # -------------------------------------------------

        with input_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # -------------------------------------------------
        # REAL YOLO + ByteTrack
        # -------------------------------------------------

        result = detector.detect_video(
            str(input_path),
            str(output_path),
        )

        # -------------------------------------------------
        # Keep one database record per unique track
        # -------------------------------------------------

        unique_tracks = {}

        for detection in result.get(
            "detections",
            [],
        ):
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

        saved_potholes = []

        for track_id, detection in unique_tracks.items():
            confidence = float(
                detection.get("confidence", 0.0)
            )

            severity = calculate_severity(confidence)

            bbox = detection.get(
                "bounding_box",
                {},
            )

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
            "gps": {
                "latitude": latitude,
                "longitude": longitude,
            },
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
# VIDEO FILE
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
# COMPLAINT SCHEMAS
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
    # -----------------------------------------------------
    # Verify pothole
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # Validate description
    # -----------------------------------------------------

    description = complaint_data.description.strip()

    if not description:
        raise HTTPException(
            status_code=400,
            detail="Complaint description is required.",
        )

    # -----------------------------------------------------
    # Create complaint
    # -----------------------------------------------------

    complaint = Complaint(
        pothole_id=complaint_data.pothole_id,
        citizen_name=(
            complaint_data.citizen_name.strip()
            if complaint_data.citizen_name
            else None
        ),
        citizen_email=(
            complaint_data.citizen_email.strip()
            if complaint_data.citizen_email
            else None
        ),
        description=description,
        status="submitted",
    )

    db.add(complaint)

    # Put linked pothole under authority review.
    if complaint.pothole_id is not None:
        pothole = (
            db.query(Pothole)
            .filter(Pothole.id == complaint.pothole_id)
            .first()
        )

        if (
            pothole is not None
            and pothole.status == "reported"
        ):
            pothole.status = "under_review"

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
        get_complaint_dict(complaint)
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

    return get_complaint_dict(complaint)


# =========================================================
# UPDATE COMPLAINT STATUS
# =========================================================

@app.put("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: int,
    status_data: ComplaintStatusUpdate,
    db: Session = Depends(get_db),
):
    status = status_data.status.lower().strip()

    if status not in COMPLAINT_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid status. Allowed values: "
                f"{sorted(COMPLAINT_STATUSES)}"
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

    complaint.status = status

    # Keep linked pothole status aligned with workflow.
    if complaint.pothole_id is not None:
        pothole = (
            db.query(Pothole)
            .filter(Pothole.id == complaint.pothole_id)
            .first()
        )

        if pothole is not None:
            status_mapping = {
                "under_review": "under_review",
                "inspection_scheduled": (
                    "inspection_scheduled"
                ),
                "work_order_created": (
                    "work_order_created"
                ),
                "in_progress": "in_progress",
                "resolved": "resolved",
                "rejected": "rejected",
            }

            if status in status_mapping:
                pothole.status = status_mapping[status]

    db.commit()
    db.refresh(complaint)

    return {
        "success": True,
        "message": "Complaint status updated",
        "complaint_id": complaint.id,
        "status": complaint.status,
    }


# =========================================================
# INSPECTION SCHEMAS
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
    # -----------------------------------------------------
    # Verify pothole
    # -----------------------------------------------------

    pothole = (
        db.query(Pothole)
        .filter(
            Pothole.id == inspection_data.pothole_id
        )
        .first()
    )

    if pothole is None:
        raise HTTPException(
            status_code=404,
            detail="Pothole not found.",
        )

    # -----------------------------------------------------
    # Verify complaint
    # -----------------------------------------------------

    complaint = None

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

        # Prevent linking a complaint to a different pothole.
        if (
            complaint.pothole_id is not None
            and complaint.pothole_id
            != inspection_data.pothole_id
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Complaint does not belong to "
                    "the selected pothole."
                ),
            )

    # -----------------------------------------------------
    # Validate inspector
    # -----------------------------------------------------

    inspector_name = inspection_data.inspector_name.strip()

    if not inspector_name:
        raise HTTPException(
            status_code=400,
            detail="Inspector name is required.",
        )

    confirmed_severity = (
        inspection_data.confirmed_severity.lower().strip()
        if inspection_data.confirmed_severity
        else None
    )

    if (
        confirmed_severity is not None
        and confirmed_severity not in SEVERITIES
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid confirmed severity. "
                f"Allowed values: {sorted(SEVERITIES)}"
            ),
        )

    # -----------------------------------------------------
    # Create inspection
    # -----------------------------------------------------

    inspection = Inspection(
        pothole_id=inspection_data.pothole_id,
        complaint_id=inspection_data.complaint_id,
        inspector_name=inspector_name,
        inspection_notes=(
            inspection_data.inspection_notes.strip()
            if inspection_data.inspection_notes
            else None
        ),
        confirmed_severity=confirmed_severity,
        status="scheduled",
    )

    db.add(inspection)

    pothole.status = "inspection_scheduled"

    if complaint is not None:
        complaint.status = "inspection_scheduled"

    db.commit()
    db.refresh(inspection)

    return {
        "success": True,
        "message": "Inspection created successfully",
        "inspection_id": inspection.id,
        "pothole_id": inspection.pothole_id,
        "complaint_id": inspection.complaint_id,
        "inspector_name": inspection.inspector_name,
        "confirmed_severity": (
            inspection.confirmed_severity
        ),
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
        get_inspection_dict(inspection)
        for inspection in inspections
    ]


# =========================================================
# GET SINGLE INSPECTION
# =========================================================

@app.get("/inspections/{inspection_id}")
def get_inspection(
    inspection_id: int,
    db: Session = Depends(get_db),
):
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

    return get_inspection_dict(inspection)


# =========================================================
# UPDATE INSPECTION STATUS
# =========================================================

@app.put("/inspections/{inspection_id}/status")
def update_inspection_status(
    inspection_id: int,
    status_data: InspectionStatusUpdate,
    db: Session = Depends(get_db),
):
    status = status_data.status.lower().strip()

    if status not in INSPECTION_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid inspection status. "
                f"Allowed values: {sorted(INSPECTION_STATUSES)}"
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

    inspection.status = status

    pothole = (
        db.query(Pothole)
        .filter(Pothole.id == inspection.pothole_id)
        .first()
    )

    complaint = None

    if inspection.complaint_id is not None:
        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.id == inspection.complaint_id
            )
            .first()
        )

    if status == "in_progress":
        if pothole is not None:
            pothole.status = "inspection_scheduled"

        if complaint is not None:
            complaint.status = "inspection_scheduled"

    elif status == "completed":
        inspection.inspected_at = datetime.utcnow()

        if pothole is not None:
            pothole.status = "inspection_completed"

            if inspection.confirmed_severity:
                pothole.severity = (
                    inspection.confirmed_severity
                )

        if complaint is not None:
            complaint.status = "under_review"

    elif status == "cancelled":
        if pothole is not None:
            pothole.status = "under_review"

        if complaint is not None:
            complaint.status = "under_review"

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
# AUTHORITY DECISION
# =========================================================

class AuthorityDecision(BaseModel):
    decision: str
    notes: str | None = None
    confirmed_severity: str | None = None


@app.put("/inspections/{inspection_id}/decision")
def authority_decision(
    inspection_id: int,
    decision_data: AuthorityDecision,
    db: Session = Depends(get_db),
):
    """
    GMC/authority decision after physical inspection.

    Decisions:
    - repair_required
    - no_repair_required
    - rejected
    - duplicate
    """

    allowed_decisions = {
        "repair_required",
        "no_repair_required",
        "rejected",
        "duplicate",
    }

    decision = decision_data.decision.lower().strip()

    if decision not in allowed_decisions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid decision. Allowed values: "
                f"{sorted(allowed_decisions)}"
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

    if inspection.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=(
                "Authority decision can only be made "
                "after inspection is completed."
            ),
        )

    pothole = (
        db.query(Pothole)
        .filter(Pothole.id == inspection.pothole_id)
        .first()
    )

    if pothole is None:
        raise HTTPException(
            status_code=404,
            detail="Pothole not found.",
        )

    complaint = None

    if inspection.complaint_id is not None:
        complaint = (
            db.query(Complaint)
            .filter(
                Complaint.id == inspection.complaint_id
            )
            .first()
        )

    # -----------------------------------------------------
    # Update confirmed severity
    # -----------------------------------------------------

    if decision_data.confirmed_severity:
        severity = (
            decision_data.confirmed_severity
            .lower()
            .strip()
        )

        if severity not in SEVERITIES:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid confirmed severity. "
                    f"Allowed values: {sorted(SEVERITIES)}"
                ),
            )

        pothole.severity = severity
        inspection.confirmed_severity = severity

    # -----------------------------------------------------
    # Append authority decision to inspection notes.
    #
    # No DB migration is required because the existing
    # inspection_notes field is used.
    # -----------------------------------------------------

    decision_note = (
        f"Authority decision: {decision}."
    )

    if decision_data.notes:
        decision_note += (
            f" Authority notes: "
            f"{decision_data.notes.strip()}"
        )

    if inspection.inspection_notes:
        inspection.inspection_notes += (
            f"\n{decision_note}"
        )
    else:
        inspection.inspection_notes = decision_note

    # -----------------------------------------------------
    # Workflow decision
    # -----------------------------------------------------

    if decision == "repair_required":
        pothole.status = "repair_required"

        if complaint is not None:
            complaint.status = "under_review"

    elif decision == "no_repair_required":
        pothole.status = "resolved"

        if complaint is not None:
            complaint.status = "resolved"

    elif decision == "rejected":
        pothole.status = "rejected"

        if complaint is not None:
            complaint.status = "rejected"

    elif decision == "duplicate":
        pothole.status = "duplicate"

        if complaint is not None:
            complaint.status = "rejected"

    db.commit()
    db.refresh(inspection)
    db.refresh(pothole)

    return {
        "success": True,
        "message": "Authority decision recorded",
        "inspection_id": inspection.id,
        "pothole_id": pothole.id,
        "decision": decision,
        "pothole_status": pothole.status,
        "complaint_status": (
            complaint.status
            if complaint is not None
            else None
        ),
        "confirmed_severity": pothole.severity,
        "notes": inspection.inspection_notes,
    }


# =========================================================
# WORK ORDER SCHEMAS
# =========================================================

class WorkOrderCreate(BaseModel):
    pothole_id: int
    inspection_id: int | None = None
    contractor_name: str
    work_description: str
    priority: str = "medium"
    estimated_cost: float | None = Field(
        default=None,
        ge=0,
    )
    scheduled_date: datetime | None = None


class WorkOrderStatusUpdate(BaseModel):
    status: str


# =========================================================
# CREATE WORK ORDER
# AUTHORITY ASSIGNS CONTRACTOR HERE
# =========================================================

@app.post("/work-orders")
def create_work_order(
    work_order_data: WorkOrderCreate,
    db: Session = Depends(get_db),
):
    # -----------------------------------------------------
    # Verify pothole
    # -----------------------------------------------------

    pothole = (
        db.query(Pothole)
        .filter(
            Pothole.id == work_order_data.pothole_id
        )
        .first()
    )

    if pothole is None:
        raise HTTPException(
            status_code=404,
            detail="Pothole not found.",
        )

    # -----------------------------------------------------
    # Verify inspection
    # -----------------------------------------------------

    inspection = None

    if work_order_data.inspection_id is not None:
        inspection = (
            db.query(Inspection)
            .filter(
                Inspection.id
                == work_order_data.inspection_id
            )
            .first()
        )

        if inspection is None:
            raise HTTPException(
                status_code=404,
                detail="Inspection not found.",
            )

        if (
            inspection.pothole_id
            != work_order_data.pothole_id
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Inspection does not belong to "
                    "the selected pothole."
                ),
            )

    # -----------------------------------------------------
    # Validate priority
    # -----------------------------------------------------

    priority = work_order_data.priority.lower().strip()

    allowed_priorities = {
        "low",
        "medium",
        "high",
        "critical",
    }

    if priority not in allowed_priorities:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid priority. Allowed values: "
                f"{sorted(allowed_priorities)}"
            ),
        )

    # -----------------------------------------------------
    # Validate contractor
    # -----------------------------------------------------

    contractor_name = (
        work_order_data.contractor_name.strip()
    )

    if not contractor_name:
        raise HTTPException(
            status_code=400,
            detail="Contractor name is required.",
        )

    work_description = (
        work_order_data.work_description.strip()
    )

    if not work_description:
        raise HTTPException(
            status_code=400,
            detail="Work description is required.",
        )

    # -----------------------------------------------------
    # Authority should create work order only when repair
    # is required / appropriate.
    #
    # Existing old records are not blocked.
    # -----------------------------------------------------

    if pothole.status not in {
        "repair_required",
        "work_order_created",
        "in_progress",
    }:
        # Allow existing workflow if inspection is completed.
        if (
            inspection is None
            or inspection.status != "completed"
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Work order requires a completed "
                    "inspection and authority repair decision."
                ),
            )

    # -----------------------------------------------------
    # Create work order
    # -----------------------------------------------------

    work_order = WorkOrder(
        pothole_id=work_order_data.pothole_id,
        inspection_id=work_order_data.inspection_id,
        contractor_name=contractor_name,
        work_description=work_description,
        priority=priority,
        status="assigned",
        estimated_cost=work_order_data.estimated_cost,
        scheduled_date=work_order_data.scheduled_date,
    )

    db.add(work_order)

    pothole.status = "work_order_created"

    # Linked complaint, if any.
    if inspection is not None:
        if inspection.complaint_id is not None:
            complaint = (
                db.query(Complaint)
                .filter(
                    Complaint.id
                    == inspection.complaint_id
                )
                .first()
            )

            if complaint is not None:
                complaint.status = (
                    "work_order_created"
                )

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
        get_work_order_dict(work_order)
        for work_order in work_orders
    ]


# =========================================================
# GET SINGLE WORK ORDER
# =========================================================

@app.get("/work-orders/{work_order_id}")
def get_work_order(
    work_order_id: int,
    db: Session = Depends(get_db),
):
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

    return get_work_order_dict(work_order)


# =========================================================
# UPDATE WORK ORDER STATUS
# =========================================================

@app.put("/work-orders/{work_order_id}/status")
def update_work_order_status(
    work_order_id: int,
    status_data: WorkOrderStatusUpdate,
    db: Session = Depends(get_db),
):
    status = status_data.status.lower().strip()

    if status not in WORK_ORDER_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid work order status. "
                f"Allowed values: {sorted(WORK_ORDER_STATUSES)}"
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

    work_order.status = status

    pothole = (
        db.query(Pothole)
        .filter(
            Pothole.id == work_order.pothole_id
        )
        .first()
    )

    complaint = None
    inspection = None

    if work_order.inspection_id is not None:
        inspection = (
            db.query(Inspection)
            .filter(
                Inspection.id
                == work_order.inspection_id
            )
            .first()
        )

        if inspection is not None:
            if inspection.complaint_id is not None:
                complaint = (
                    db.query(Complaint)
                    .filter(
                        Complaint.id
                        == inspection.complaint_id
                    )
                    .first()
                )

    # -----------------------------------------------------
    # Contractor accepted work
    # -----------------------------------------------------

    if status == "accepted":
        if pothole is not None:
            pothole.status = "work_order_created"

    # -----------------------------------------------------
    # Contractor started repair
    # -----------------------------------------------------

    elif status == "in_progress":
        if pothole is not None:
            pothole.status = "in_progress"

        if complaint is not None:
            complaint.status = "in_progress"

    # -----------------------------------------------------
    # Contractor completed repair
    #
    # At this point repair is completed, but final
    # authority verification is still needed.
    # -----------------------------------------------------

    elif status == "completed":
        work_order.completed_at = datetime.utcnow()

        if pothole is not None:
            pothole.status = "resolved"

        if complaint is not None:
            complaint.status = "resolved"

    # -----------------------------------------------------
    # Cancelled
    # -----------------------------------------------------

    elif status == "cancelled":
        if pothole is not None:
            pothole.status = "repair_required"

        if complaint is not None:
            complaint.status = "under_review"

    db.commit()
    db.refresh(work_order)

    return {
        "success": True,
        "message": "Work order status updated",
        "work_order_id": work_order.id,
        "status": work_order.status,
        "pothole_status": (
            pothole.status
            if pothole is not None
            else None
        ),
        "complaint_status": (
            complaint.status
            if complaint is not None
            else None
        ),
        "completed_at": work_order.completed_at,
    }


# =========================================================
# DASHBOARD SUMMARY
# =========================================================

@app.get("/dashboard/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
):
    """
    Real database statistics for the dashboard.
    """

    potholes = db.query(Pothole).all()
    complaints = db.query(Complaint).all()
    inspections = db.query(Inspection).all()
    work_orders = db.query(WorkOrder).all()

    total_potholes = len(potholes)

    critical = sum(
        1
        for p in potholes
        if p.severity == "critical"
        or p.severity == "high"
    )

    in_progress = sum(
        1
        for p in potholes
        if p.status == "in_progress"
    )

    resolved = sum(
        1
        for p in potholes
        if p.status == "resolved"
    )

    reported = sum(
        1
        for p in potholes
        if p.status in {
            "reported",
            "under_review",
        }
    )

    repair_required = sum(
        1
        for p in potholes
        if p.status in {
            "repair_required",
            "work_order_created",
        }
    )

    return {
        "success": True,
        "potholes": {
            "total": total_potholes,
            "critical": critical,
            "in_progress": in_progress,
            "resolved": resolved,
            "reported": reported,
            "repair_required": repair_required,
        },
        "complaints": {
            "total": len(complaints),
            "submitted": sum(
                1
                for c in complaints
                if c.status == "submitted"
            ),
            "under_review": sum(
                1
                for c in complaints
                if c.status == "under_review"
            ),
            "resolved": sum(
                1
                for c in complaints
                if c.status == "resolved"
            ),
        },
        "inspections": {
            "total": len(inspections),
            "scheduled": sum(
                1
                for i in inspections
                if i.status == "scheduled"
            ),
            "completed": sum(
                1
                for i in inspections
                if i.status == "completed"
            ),
        },
        "work_orders": {
            "total": len(work_orders),
            "assigned": sum(
                1
                for w in work_orders
                if w.status == "assigned"
            ),
            "in_progress": sum(
                1
                for w in work_orders
                if w.status == "in_progress"
            ),
            "completed": sum(
                1
                for w in work_orders
                if w.status == "completed"
            ),
        },
    }


# =========================================================
# MAP DATA
# =========================================================

@app.get("/map/potholes")
def get_map_potholes(
    db: Session = Depends(get_db),
):
    """
    Returns only GPS-enabled potholes for the live map.
    """

    potholes = (
        db.query(Pothole)
        .filter(
            Pothole.latitude.isnot(None),
            Pothole.longitude.isnot(None),
        )
        .order_by(Pothole.created_at.desc())
        .all()
    )

    return [
        {
            "id": pothole.id,
            "latitude": pothole.latitude,
            "longitude": pothole.longitude,
            "severity": pothole.severity,
            "confidence": pothole.confidence,
            "status": pothole.status,
            "description": pothole.description,
            "created_at": pothole.created_at,
        }
        for pothole in potholes
    ]


# =========================================================
# ANALYTICS
# =========================================================

@app.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
):
    potholes = (
        db.query(Pothole)
        .order_by(Pothole.created_at.asc())
        .all()
    )

    severity_distribution = {
        "low": 0,
        "medium": 0,
        "high": 0,
        "critical": 0,
    }

    status_distribution = {}

    confidence_values = []

    for pothole in potholes:
        if pothole.severity in severity_distribution:
            severity_distribution[
                pothole.severity
            ] += 1

        if pothole.status:
            status_distribution[
                pothole.status
            ] = (
                status_distribution.get(
                    pothole.status,
                    0,
                )
                + 1
            )

        if pothole.confidence is not None:
            confidence_values.append(
                float(pothole.confidence)
            )

    average_confidence = (
        sum(confidence_values)
        / len(confidence_values)
        if confidence_values
        else 0
    )

    return {
        "success": True,
        "total_potholes": len(potholes),
        "average_ai_confidence": round(
            average_confidence,
            4,
        ),
        "severity_distribution": (
            severity_distribution
        ),
        "status_distribution": status_distribution,
    }


# =========================================================
# STARTUP MESSAGE
# =========================================================

@app.on_event("startup")
def startup_event():
    print("=" * 60)
    print("PotholeVision API started")
    print("Real YOLO pothole detection: ENABLED")
    print("ByteTrack video tracking: ENABLED")
    print(
        "GPS duplicate matching: "
        f"{GPS_DUPLICATE_RADIUS_METERS} meters"
    )
    print("PostgreSQL database: ENABLED")
    print("=" * 60)