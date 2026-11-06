"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileImage,
  Film,
  Loader2,
  MapPin,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { LoadingSpinner, DetectionResultsSkeleton } from "@/components/ui/LoadingStates";

type Detection = {
  class_id?: number;
  confidence: number;
  bounding_box?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  track_id?: number | null;
  frame?: number;
};

type DetectionResponse = {
  success: boolean;
  type: "image" | "video";
  filename: string;
  image_path?: string;
  video_path?: string;
  annotated_video?: string;
  potholes_detected?: number;
  unique_potholes?: number;
  database_records_created?: number;
  total_frames?: number;
  processed_frames?: number;
  saved_potholes?: Array<{
    pothole_id: number;
    severity: string;
    confidence: number;
    track_id?: number;
  }>;
  detections?: Detection[];
  detail?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://potholevision.onrender.com";

export default function AIDetectionPage() {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [fileType, setFileType] = useState<
    "image" | "video" | null
  >(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    null
  );

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const [result, setResult] =
    useState<DetectionResponse | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetResult() {
    setResult(null);
    setError("");
  }

  function selectFile(
    file: File,
    type: "image" | "video"
  ) {
    resetResult();

    setSelectedFile(file);
    setFileType(type);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    selectFile(file, "image");
  }

  function handleVideoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    selectFile(file, "video");
  }

  function removeFile() {
    setSelectedFile(null);
    setFileType(null);
    resetResult();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }

  function getLocation() {
    setError("");

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocationLoading(false);
      },
      (locationError) => {
        setLocationLoading(false);

        if (locationError.code === 1) {
          setError(
            "Location permission was denied. You can continue without GPS."
          );
        } else {
          setError(
            "Unable to get your current location."
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }

  async function runDetection() {
    if (!selectedFile || !fileType) {
      setError(
        "Please select an image or video first."
      );
      return;
    }

    setDetecting(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

      const queryParams = new URLSearchParams();

      if (latitude !== null) {
        queryParams.append(
          "latitude",
          String(latitude)
        );
      }

      if (longitude !== null) {
        queryParams.append(
          "longitude",
          String(longitude)
        );
      }

      const endpoint =
        fileType === "image"
          ? `${API_URL}/detect/image`
          : `${API_URL}/detect/video`;

      const url = queryParams.toString()
        ? `${endpoint}?${queryParams.toString()}`
        : endpoint;

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "AI detection failed."
        );
      }

      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "AI detection failed."
      );
    } finally {
      setDetecting(false);
    }
  }

  function getHighestConfidence() {
    if (!result?.detections?.length) {
      return 0;
    }

    return Math.max(
      ...result.detections.map(
        (detection) => detection.confidence
      )
    );
  }

  function getSeverity(confidence: number) {
    if (confidence >= 0.8) {
      return "High";
    }

    if (confidence >= 0.5) {
      return "Medium";
    }

    return "Low";
  }

  return (
    <DashboardLayout>
      <div className="relative isolate min-h-screen overflow-hidden bg-[#101317] text-[#F4E9D0] before:pointer-events-none before:absolute before:inset-0 before:-z-0 before:bg-[radial-gradient(ellipse_at_85%_5%,rgba(200,169,107,0.13),transparent_35%),radial-gradient(ellipse_at_5%_65%,rgba(90,105,115,0.12),transparent_35%)]">
        <main className="relative z-10 min-w-0 px-3 py-5 sm:px-5 sm:py-7 lg:px-8 lg:py-9">
          <div className="mx-auto w-full max-w-[1500px] min-w-0">
            {/* Header */}
            <div className="mb-6 flex min-w-0 flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-center">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96B]">
                  Artificial Intelligence
                </p>

                <h1 className="mt-2 break-words text-3xl font-extrabold tracking-tight text-[#F4E9D0] sm:text-4xl lg:text-5xl">
                  AI Road Damage Detection
                </h1>

                <p className="mt-1 max-w-2xl text-sm text-[#A0AAB1]">
                  Upload road images or videos and let the
                  pothole detection model analyze them.
                </p>
              </div>

              <div className="flex w-full shrink-0 items-center gap-2 rounded-xl border border-white/[0.10] bg-[#1A2026] px-4 py-3 shadow-sm sm:w-auto">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />

                <span className="text-sm font-semibold text-[#E8D7B5]">
                  AI Model Online
                </span>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid min-w-0 gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:gap-6">
              {/* Upload Section */}
              <section className="min-w-0 rounded-2xl border border-white/[0.10] bg-gradient-to-br from-[#222831] to-[#171C22] p-4 shadow-[0_8px_30px_rgba(16,42,67,0.07)] sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#F4E9D0]">
                    Upload Road Media
                  </h2>

                  <p className="mt-1 text-sm text-[#8B969E]">
                    Select a road photo or video for real AI
                    analysis.
                  </p>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
                  className="hidden"
                  onChange={handleVideoChange}
                />

                {/* Upload Buttons */}
                {!selectedFile && (
                  <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        imageInputRef.current?.click()
                      }
                      className="group min-w-0 rounded-2xl border-2 border-dashed border-[#C8A96B]/35 bg-[#1A2026] p-6 text-center transition hover:border-[#C8A96B]/70 hover:bg-[#C8A96B]/[0.10] sm:p-8"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#C8A96B]/[0.12] text-[#C8A96B]">
                        <FileImage size={28} />
                      </div>

                      <p className="mt-4 text-sm font-bold text-[#E8D7B5]">
                        Upload Image
                      </p>

                      <p className="mt-1 text-xs text-[#8B969E]">
                        JPG, PNG or WEBP
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        videoInputRef.current?.click()
                      }
                      className="group min-w-0 rounded-2xl border-2 border-dashed border-[#C8A96B]/35 bg-[#1A2026] p-6 text-center transition hover:border-[#C8A96B]/70 hover:bg-[#C8A96B]/[0.10] sm:p-8"
                    >
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#C8A96B]/[0.12] text-[#C8A96B]">
                        <Film size={28} />
                      </div>

                      <p className="mt-4 text-sm font-bold text-[#E8D7B5]">
                        Upload Video
                      </p>

                      <p className="mt-1 text-xs text-[#8B969E]">
                        MP4, MOV, AVI or WEBM
                      </p>
                    </button>
                  </div>
                )}

                {/* Selected File */}
                {selectedFile && (
                  <div className="min-w-0 rounded-2xl border border-white/[0.10] bg-gradient-to-br from-[#222831] to-[#171C22] p-4">
                    <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C8A96B]/[0.12] text-[#C8A96B]">
                          {fileType === "image" ? (
                            <FileImage size={22} />
                          ) : (
                            <Film size={22} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#F4E9D0]">
                            {selectedFile.name}
                          </p>

                          <p className="text-xs text-[#8B969E]">
                            {(
                              selectedFile.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={removeFile}
                        className="shrink-0 rounded-lg p-2 text-[#8B969E] hover:bg-red-50 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {previewUrl &&
                      fileType === "image" && (
                        <div className="overflow-hidden rounded-xl border border-white/[0.10] bg-[#222831]">
                          <img
                            src={previewUrl}
                            alt="Road preview"
                            className="max-h-[350px] w-full object-contain"
                          />
                        </div>
                      )}

                    {previewUrl &&
                      fileType === "video" && (
                        <div className="overflow-hidden rounded-xl border border-white/[0.10] bg-black">
                          <video
                            src={previewUrl}
                            controls
                            className="max-h-[350px] w-full"
                          />
                        </div>
                      )}
                  </div>
                )}

                {/* GPS */}
                <div className="mt-5 min-w-0 rounded-xl border border-white/[0.10] bg-[#1A2026] p-4">
                  <div className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#C8A96B]/[0.12] text-[#C8A96B]">
                        <MapPin size={19} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#E8D7B5]">
                          GPS Location
                        </p>

                        {latitude !== null &&
                        longitude !== null ? (
                          <p className="mt-0.5 break-all text-xs text-emerald-400">
                            {latitude.toFixed(6)},{" "}
                            {longitude.toFixed(6)}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-xs text-[#8B969E]">
                            Location not attached
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={getLocation}
                      disabled={locationLoading}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.10] bg-[#1A2026] px-4 py-2 text-xs font-semibold text-[#E8D7B5] hover:bg-[#C8A96B]/[0.10] disabled:opacity-50 sm:w-auto"
                    >
                      {locationLoading ? (
                        <Loader2
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <MapPin size={15} />
                      )}

                      {locationLoading
                        ? "Getting GPS..."
                        : "Use Current Location"}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 flex min-w-0 items-start gap-3 rounded-xl border border-red-400/20 bg-red-500/[0.08] p-4">
                    <AlertTriangle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="min-w-0 break-words text-sm text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                {/* Detect */}
                <button
                  type="button"
                  onClick={runDetection}
                  disabled={!selectedFile || detecting}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C8A96B] to-[#D8BB83] px-5 py-3.5 text-sm font-bold text-white shadow-[0_6px_18px_rgba(40,91,137,0.22)] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {detecting ? (
                    <>
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#C8A96B]" />
                      AI is analyzing...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Run AI Detection
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-[#8B969E]">
                  Detection is performed by the real YOLO
                  pothole model on the backend.
                </p>
              </section>

              {/* Results */}
              <section className="min-w-0 rounded-2xl border border-white/[0.10] bg-gradient-to-br from-[#222831] to-[#171C22] p-4 shadow-[0_8px_30px_rgba(16,42,67,0.07)] sm:p-6">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-[#F4E9D0]">
                    AI Detection Results
                  </h2>

                  <p className="mt-1 text-sm text-[#8B969E]">
                    Detection results and database status.
                  </p>
                </div>

                {!result && !detecting && (
                  <div className="flex min-h-[430px] min-w-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.10] bg-[#1A2026] px-5 text-center sm:px-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C8A96B]/[0.12] text-[#C8A96B]">
                      <AlertTriangle size={30} />
                    </div>

                    <h3 className="mt-5 text-base font-bold text-[#E8D7B5]">
                      No analysis yet
                    </h3>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#8B969E]">
                      Upload a road image or video and click
                      Run AI Detection to start the real model.
                    </p>
                  </div>
                )}

                {detecting && (
                  <div className="flex min-h-[430px] min-w-0 flex-col items-center justify-center rounded-2xl border border-white/[0.10] bg-gradient-to-br from-[#222831] to-[#171C22] px-5 text-center">
                    <LoadingSpinner
                      label="AI ANALYZING ROAD DAMAGE"
                      size={23}
                    />

                    <h3 className="mt-5 text-base font-bold text-[#E8D7B5]">
                      AI is analyzing the road...
                    </h3>

                    <p className="mt-2 text-sm text-[#8B969E]">
                      Please wait while the pothole model
                      processes your {fileType}.
                    </p>
                  </div>
                )}

                {result && (
                  <div className="min-w-0 space-y-4">
                    {/* Success */}
                    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08] p-4">
                      <CheckCircle2
                        size={22}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-emerald-700">
                          AI Detection Completed
                        </p>

                        <p className="text-xs text-emerald-400">
                          {result.database_records_created ??
                            0}{" "}
                          database record(s) created
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="min-w-0 rounded-xl border border-white/[0.10] bg-[#1A2026] p-4">
                        <p className="text-xs text-[#8B969E]">
                          Potholes Detected
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[#F4E9D0]">
                          {result.type === "image"
                            ? result.potholes_detected ?? 0
                            : result.unique_potholes ?? 0}
                        </p>
                      </div>

                      <div className="min-w-0 rounded-xl border border-white/[0.10] bg-[#1A2026] p-4">
                        <p className="text-xs text-[#8B969E]">
                          Highest Confidence
                        </p>

                        <p className="mt-1 text-2xl font-bold text-[#C8A96B]">
                          {(
                            getHighestConfidence() * 100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    {result.detections &&
                      result.detections.length > 0 && (
                        <div className="min-w-0 rounded-xl border border-white/[0.10] bg-[#1A2026] p-4">
                          <div className="mb-3 flex min-w-0 items-center justify-between gap-3">
                            <p className="text-sm font-bold text-[#E8D7B5]">
                              Detection Details
                            </p>

                            <span className="shrink-0 rounded-full bg-[#C8A96B]/[0.12] px-2.5 py-1 text-xs font-semibold text-[#C8A96B]">
                              {result.detections.length}{" "}
                              detections
                            </span>
                          </div>

                          <div className="max-h-[220px] space-y-2 overflow-y-auto">
                            {result.detections.map(
                              (detection, index) => {
                                const confidence =
                                  detection.confidence;

                                const severity =
                                  getSeverity(confidence);

                                return (
                                  <div
                                    key={`${index}-${detection.track_id ?? "image"}`}
                                    className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-[#e1e8ee] bg-gradient-to-br from-[#222831] to-[#171C22] px-3 py-3"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-[#E8D7B5]">
                                        Pothole #
                                        {index + 1}
                                      </p>

                                      {detection.track_id !==
                                        undefined &&
                                        detection.track_id !==
                                          null && (
                                          <p className="mt-0.5 text-[11px] text-[#8B969E]">
                                            Track ID:{" "}
                                            {
                                              detection.track_id
                                            }
                                          </p>
                                        )}

                                      {detection.frame !==
                                        undefined && (
                                        <p className="mt-0.5 text-[11px] text-[#8B969E]">
                                          Frame:{" "}
                                          {detection.frame}
                                        </p>
                                      )}
                                    </div>

                                    <div className="shrink-0 text-right">
                                      <p className="text-sm font-bold text-[#C8A96B]">
                                        {(
                                          confidence * 100
                                        ).toFixed(1)}
                                        %
                                      </p>

                                      <span
                                        className={`text-[11px] font-semibold ${
                                          severity ===
                                          "High"
                                            ? "text-red-500"
                                            : severity ===
                                                "Medium"
                                              ? "text-orange-500"
                                              : "text-[#C8A96B]"
                                        }`}
                                      >
                                        {severity}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}

                    {/* No Detection */}
                    {result.detections &&
                      result.detections.length === 0 && (
                        <div className="rounded-xl border border-white/[0.10] bg-[#1A2026] p-5 text-center">
                          <p className="text-sm font-semibold text-[#E8D7B5]">
                            No pothole detected
                          </p>

                          <p className="mt-1 text-xs text-[#8B969E]">
                            The AI model did not find a pothole
                            above the detection threshold.
                          </p>
                        </div>
                      )}

                    {/* Video */}
                    {result.type === "video" && (
                      <div className="min-w-0 rounded-xl border border-white/[0.10] bg-[#1A2026] p-4">
                        <p className="text-sm font-bold text-[#E8D7B5]">
                          Video Processing
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-[#8B969E]">
                              Total Frames
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#F4E9D0]">
                              {result.total_frames ?? 0}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-[#8B969E]">
                              Processed Frames
                            </p>

                            <p className="mt-1 text-sm font-bold text-[#F4E9D0]">
                              {result.processed_frames ??
                                0}
                            </p>
                          </div>
                        </div>

                        {result.annotated_video && (
                          <a
                            href={`${API_URL}/videos/${encodeURIComponent(
                              result.annotated_video
                                .split(/[\\/]/)
                                .pop() || ""
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#C8A96B] to-[#D8BB83] px-4 py-2.5 text-xs font-semibold text-white hover:brightness-110"
                          >
                            <Film size={15} />
                            Open Annotated Video
                          </a>
                        )}
                      </div>
                    )}

                    {/* GPS */}
                    <div className="min-w-0 rounded-xl border border-white/[0.10] bg-[#1A2026] p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <MapPin
                          size={18}
                          className="shrink-0 text-[#C8A96B]"
                        />

                        <div className="min-w-0">
                          <p className="text-xs text-[#8B969E]">
                            Detection Location
                          </p>

                          <p className="mt-1 break-all text-sm font-semibold text-[#E8D7B5]">
                            {latitude !== null &&
                            longitude !== null
                              ? `${latitude.toFixed(
                                  6
                                )}, ${longitude.toFixed(
                                  6
                                )}`
                              : "GPS location not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Bottom Information */}
            <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-3">
              <div className="min-w-0 rounded-xl border border-white/[0.10] bg-[#1A2026] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8B969E]">
                  AI Engine
                </p>

                <p className="mt-2 text-sm font-bold text-[#E8D7B5]">
                  YOLO Pothole Detection
                </p>

                <p className="mt-1 text-xs text-[#8B969E]">
                  Real trained pothole detection model.
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-white/[0.10] bg-[#1A2026] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8B969E]">
                  Video Tracking
                </p>

                <p className="mt-2 text-sm font-bold text-[#E8D7B5]">
                  ByteTrack
                </p>

                <p className="mt-1 text-xs text-[#8B969E]">
                  Tracks detected potholes across video
                  frames.
                </p>
              </div>

              <div className="min-w-0 rounded-xl border border-white/[0.10] bg-[#1A2026] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#8B969E]">
                  Storage
                </p>

                <p className="mt-2 text-sm font-bold text-[#E8D7B5]">
                  PostgreSQL
                </p>

                <p className="mt-1 text-xs text-[#8B969E]">
                  AI results are stored as pothole records.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}

