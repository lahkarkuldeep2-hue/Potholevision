from pathlib import Path

import cv2
from ultralytics import YOLO


class PotholeDetector:
    def __init__(self, model_path: str = "models/best.pt"):
        self.model_path = Path(model_path)
        self.model = None

    def load_model(self):
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Pothole model not found: {self.model_path}"
            )

        self.model = YOLO(str(self.model_path))
        return self.model

    def detect(self, image_path: str):
        """
        Detect potholes in a single image.
        """

        if self.model is None:
            self.load_model()

        results = self.model.predict(
            source=image_path,
            conf=0.25,
            verbose=False,
        )

        detections = []

        for result in results:
            if result.boxes is None:
                continue

            for box in result.boxes:
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])

                x1, y1, x2, y2 = box.xyxy[0].tolist()

                detections.append(
                    {
                        "class_id": class_id,
                        "confidence": round(confidence, 4),
                        "bounding_box": {
                            "x1": round(x1, 2),
                            "y1": round(y1, 2),
                            "x2": round(x2, 2),
                            "y2": round(y2, 2),
                        },
                    }
                )

        return detections

    def detect_video(
        self,
        video_path: str,
        output_path: str = "uploads/videos/annotated_output.mp4",
    ):
        """
        Detect and track potholes in a video using YOLO + ByteTrack.
        """

        if self.model is None:
            self.load_model()

        video = cv2.VideoCapture(video_path)

        if not video.isOpened():
            raise ValueError(
                f"Unable to open video: {video_path}"
            )

        fps = video.get(cv2.CAP_PROP_FPS)
        width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

        if fps <= 0:
            fps = 30.0

        output_file = Path(output_path)
        output_file.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        fourcc = cv2.VideoWriter_fourcc(
            *"mp4v"
        )

        writer = cv2.VideoWriter(
            str(output_file),
            fourcc,
            fps,
            (width, height),
        )

        tracked_potholes = {}

        frame_number = 0

        try:
            while True:
                success, frame = video.read()

                if not success:
                    break

                frame_number += 1

                results = self.model.track(
                    source=frame,
                    conf=0.25,
                    persist=True,
                    tracker="bytetrack.yaml",
                    verbose=False,
                )

                result = results[0]

                if result.boxes is not None:

                    for box in result.boxes:

                        confidence = float(box.conf[0])
                        class_id = int(box.cls[0])

                        x1, y1, x2, y2 = box.xyxy[0].tolist()

                        track_id = None

                        if box.id is not None:
                            track_id = int(box.id[0])

                        # ----------------------------------
                        # Use tracking ID for deduplication
                        # ----------------------------------

                        unique_id = (
                            f"track_{track_id}"
                            if track_id is not None
                            else f"frame_{frame_number}_{len(tracked_potholes)}"
                        )

                        detection = {
                            "track_id": track_id,
                            "class_id": class_id,
                            "confidence": round(
                                confidence,
                                4,
                            ),
                            "frame": frame_number,
                            "bounding_box": {
                                "x1": round(x1, 2),
                                "y1": round(y1, 2),
                                "x2": round(x2, 2),
                                "y2": round(y2, 2),
                            },
                        }

                        # Keep highest-confidence detection
                        # for each tracked pothole.

                        if (
                            unique_id not in tracked_potholes
                            or confidence
                            > tracked_potholes[
                                unique_id
                            ]["confidence"]
                        ):
                            tracked_potholes[
                                unique_id
                            ] = detection

                # --------------------------------------
                # Write annotated frame
                # --------------------------------------

                annotated_frame = result.plot()

                writer.write(annotated_frame)

        finally:
            video.release()
            writer.release()

        return {
            "total_frames": total_frames,
            "processed_frames": frame_number,
            "unique_potholes": len(
                tracked_potholes
            ),
            "detections": list(
                tracked_potholes.values()
            ),
            "output_video": str(output_file),
        }