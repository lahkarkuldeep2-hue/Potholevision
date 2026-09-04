import os
import shutil
from pathlib import Path

from fastapi import FastAPI, Depends, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models.pothole import Pothole
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
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        detections = detector.detect(
            str(file_path)
        )

        return {
            "success": True,
            "type": "image",
            "filename": safe_filename,
            "image_path": str(file_path),
            "potholes_detected": len(detections),
            "detections": detections,
        }

    except Exception as e:
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

        # ---------------------------------------------
        # Save uploaded video
        # ---------------------------------------------

        with input_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # ---------------------------------------------
        # Run YOLO + ByteTrack
        # ---------------------------------------------

        result = detector.detect_video(
            str(input_path),
            str(output_path),
        )

        # ---------------------------------------------
        # Return result
        # ---------------------------------------------

        return {
            "success": True,
            "type": "video",
            "filename": safe_filename,
            "video_path": str(input_path),
            "annotated_video": str(output_path),
            "total_frames": result["total_frames"],
            "processed_frames": result["processed_frames"],
            "unique_potholes": result["unique_potholes"],
            "detections": result["detections"],
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Video detection failed: {str(e)}",
        )

    finally:
        await file.close()


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