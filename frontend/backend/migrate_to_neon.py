import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from models.pothole import Pothole
from models.complaint import Complaint
from models.inspection import Inspection
from models.work_order import WorkOrder

load_dotenv()

LOCAL_DATABASE_URL = os.getenv("DATABASE_URL")
NEON_DATABASE_URL = os.getenv("NEON_DATABASE_URL")

if not LOCAL_DATABASE_URL:
    raise RuntimeError("DATABASE_URL not found in .env")

if not NEON_DATABASE_URL:
    raise RuntimeError("NEON_DATABASE_URL not found in .env")

local_engine = create_engine(LOCAL_DATABASE_URL)
neon_engine = create_engine(NEON_DATABASE_URL)

LocalSession = sessionmaker(bind=local_engine)
NeonSession = sessionmaker(bind=neon_engine)

local_db = LocalSession()
neon_db = NeonSession()

try:
    print("Creating PotholeVision tables in Neon...")

    for model in [Pothole, Complaint, Inspection, WorkOrder]:
        model.metadata.create_all(
            bind=neon_engine,
            tables=[model.__table__],
        )

    print("Tables ready.")

    # Read local data
    potholes = local_db.query(Pothole).order_by(Pothole.id).all()
    complaints = local_db.query(Complaint).order_by(Complaint.id).all()
    inspections = local_db.query(Inspection).order_by(Inspection.id).all()
    work_orders = local_db.query(WorkOrder).order_by(WorkOrder.id).all()

    print(f"Local potholes: {len(potholes)}")
    print(f"Local complaints: {len(complaints)}")
    print(f"Local inspections: {len(inspections)}")
    print(f"Local work orders: {len(work_orders)}")

    # Clear only PotholeVision tables in Neon
    neon_db.query(WorkOrder).delete()
    neon_db.query(Inspection).delete()
    neon_db.query(Complaint).delete()
    neon_db.query(Pothole).delete()
    neon_db.commit()

    # Copy in foreign-key order
    for source in potholes:
        target = Pothole(
            id=source.id,
            latitude=source.latitude,
            longitude=source.longitude,
            severity=source.severity,
            confidence=source.confidence,
            image_path=source.image_path,
            status=source.status,
            description=source.description,
            created_at=source.created_at,
        )
        neon_db.add(target)

    neon_db.flush()

    for source in complaints:
        target = Complaint(
            id=source.id,
            pothole_id=source.pothole_id,
            citizen_name=source.citizen_name,
            citizen_email=source.citizen_email,
            description=source.description,
            status=source.status,
            created_at=source.created_at,
        )
        neon_db.add(target)

    neon_db.flush()

    for source in inspections:
        target = Inspection(
            id=source.id,
            pothole_id=source.pothole_id,
            complaint_id=source.complaint_id,
            inspector_name=source.inspector_name,
            inspection_notes=source.inspection_notes,
            confirmed_severity=source.confirmed_severity,
            status=source.status,
            inspected_at=source.inspected_at,
            created_at=source.created_at,
        )
        neon_db.add(target)

    neon_db.flush()

    for source in work_orders:
        target = WorkOrder(
            id=source.id,
            pothole_id=source.pothole_id,
            inspection_id=source.inspection_id,
            contractor_name=source.contractor_name,
            work_description=source.work_description,
            priority=source.priority,
            status=source.status,
            estimated_cost=source.estimated_cost,
            scheduled_date=source.scheduled_date,
            completed_at=source.completed_at,
            created_at=source.created_at,
        )
        neon_db.add(target)

    neon_db.commit()

    # Reset PostgreSQL sequences after preserving IDs
    tables = [
        "potholes",
        "complaints",
        "inspections",
        "work_orders",
    ]

    with neon_engine.begin() as connection:
        for table in tables:
            connection.execute(
                text(
                    f"""
                    SELECT setval(
                        pg_get_serial_sequence('{table}', 'id'),
                        COALESCE((SELECT MAX(id) FROM {table}), 1),
                        (SELECT COUNT(*) > 0 FROM {table})
                    )
                    """
                )
            )

    print()
    print("====================================")
    print("NEON MIGRATION SUCCESSFUL")
    print("====================================")
    print(f"Potholes:     {len(potholes)}")
    print(f"Complaints:   {len(complaints)}")
    print(f"Inspections:  {len(inspections)}")
    print(f"Work Orders:  {len(work_orders)}")
    print()
    print("students table was NOT touched.")
    print("====================================")

except Exception as error:
    neon_db.rollback()
    print()
    print("MIGRATION FAILED")
    print(error)
    raise

finally:
    local_db.close()
    neon_db.close()