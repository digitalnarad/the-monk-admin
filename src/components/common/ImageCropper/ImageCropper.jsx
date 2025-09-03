import { useState, useRef, useCallback } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Upload, Crop, Check, X } from "lucide-react";
import { Button, Modal } from "../";
import "./ImageCropper.css";

const ImageCropper = ({
  label = "Upload Image",
  value = null,
  onChange,
  enableCropping = true,
  aspectRatio = 1, // 1 for square, 16/9 for landscape, etc.
  disabled = false,
  error,
  placeholder = "Click to upload or drag and drop",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  className = "",
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState();
  const [showCropModal, setShowCropModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file size
      if (file.size > maxSize) {
        alert(
          `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
        );
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result);

        if (enableCropping) {
          setShowCropModal(true);
          const initialCrop = {
            unit: "px",
            width: 50,
            height: 50,
            x: 10,
            y: 10,
          };
          setCrop(initialCrop);
        } else {
          // If cropping is disabled, use image as-is
          const imageData = {
            file,
            preview: e.target?.result,
            cropped: false,
          };
          onChange?.(imageData);
        }
      };
      reader.readAsDataURL(file);
    },
    [enableCropping, aspectRatio, maxSize, onChange]
  );

  const getCroppedImage = useCallback(
    (image, crop, fileName = "cropped-image.jpg") => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      canvas.width = crop.width * scaleX;
      canvas.height = crop.height * scaleY;

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              console.error("Canvas is empty");
              return;
            }

            const file = new File([blob], fileName, { type: "image/jpeg" });
            const preview = URL.createObjectURL(blob);

            resolve({
              file,
              preview,
              cropped: true,
            });
          },
          "image/jpeg",
          0.9
        );
      });
    },
    []
  );

  const handleCropComplete = useCallback(async () => {
    if (!completedCrop || !imgRef.current) return;

    setIsLoading(true);
    try {
      const croppedImageData = await getCroppedImage(
        imgRef.current,
        completedCrop,
        "cropped-image.jpg"
      );

      onChange?.(croppedImageData);
      setShowCropModal(false);
      setSelectedImage(null);
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Failed to crop image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [completedCrop, getCroppedImage, onChange]);

  const handleCropCancel = useCallback(() => {
    setShowCropModal(false);
    setSelectedImage(null);
    setCrop(null);
    setCompletedCrop(null);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    onChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onChange]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`image-cropper ${className}`}>
      {label && <label className="image-cropper-label">{label}</label>}

      <div className="image-cropper-container">
        {!value ? (
          <div
            className={`image-upload-area ${disabled ? "disabled" : ""}`}
            onClick={!disabled ? triggerFileInput : undefined}
          >
            <Upload className="upload-icon" size={32} />
            <div className="upload-text">{placeholder}</div>
            <div className="upload-subtext">
              {enableCropping
                ? "Image will be cropped to square format"
                : "JPG, PNG or WebP"}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={disabled}
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <div className="image-preview-container">
            <img src={value.preview} alt="Preview" className="image-preview" />
            <div className="image-preview-overlay">
              <div className="image-preview-actions">
                <Button
                  variant="ghost"
                  size="small"
                  startIcon={<Upload size={14} />}
                  onClick={triggerFileInput}
                  disabled={disabled}
                >
                  Change
                </Button>
                <Button
                  variant="danger"
                  size="small"
                  startIcon={<X size={14} />}
                  onClick={handleRemoveImage}
                  disabled={disabled}
                >
                  Remove
                </Button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={disabled}
              style={{ display: "none" }}
            />
          </div>
        )}
      </div>

      {error && <span className="error-message">{error}</span>}

      {/* Crop Modal */}
      {showCropModal && selectedImage && crop && (
        <Modal
          isOpen={showCropModal}
          onClose={handleCropCancel}
          title="Crop Image"
          size="large"
        >
          <div className="crop-modal-content">
            <div className="crop-container">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspectRatio}
                minWidth={50}
                minHeight={50}
                keepSelection
              >
                <img
                  ref={imgRef}
                  src={selectedImage}
                  alt="Crop preview"
                  style={{ maxWidth: "100%", maxHeight: "400px" }}
                />
              </ReactCrop>
            </div>

            <div className="crop-modal-actions">
              <Button
                variant="ghost"
                onClick={handleCropCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                startIcon={<Check size={16} />}
                onClick={handleCropComplete}
                loading={isLoading}
                disabled={!completedCrop}
              >
                Apply Crop
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageCropper;
