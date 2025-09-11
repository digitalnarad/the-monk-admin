import { useMemo } from "react";
import { Button, Card } from "../../../components/common";
import { Save, Upload, X, Star } from "lucide-react";
import { PRODUCT_VARIANTS } from "../../../utils/constants";

const VariantImagesForm = ({
  activeVariant,
  setActiveVariant,
  variantImages,
  handleVariantImageUpload,
  removeVariantImage,
  setPrimaryImage,
  loading,
  isEdit,
  onBack,
  onSubmit,
}) => {
  const tabs = useMemo(() => PRODUCT_VARIANTS, [PRODUCT_VARIANTS]);

  return (
    <form onSubmit={onSubmit} className="product-step-form">
      <div className="form-grid">
        <Card title="Variant Images" className="form-section form-full-width">
          <div className="form-section-body">
            <div className="variant-tabs">
              {tabs.map((variant) => (
                <button
                  key={variant}
                  type="button"
                  className={`variant-tab ${
                    activeVariant === variant ? "active" : ""
                  }`}
                  onClick={() => setActiveVariant(variant)}
                >
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                  {variantImages[variant].length > 0 && (
                    <span className="variant-count">
                      ({variantImages[variant].length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="variant-content">
              <div className="variant-image-grid">
                {variantImages[activeVariant].map((image, index) => (
                  <div
                    key={index}
                    className={`image-preview ${
                      image.isPrimary ? "primary-image" : ""
                    }`}
                  >
                    <img
                      src={image.preview}
                      alt={`${activeVariant} variant ${index + 1}`}
                    />

                    <button
                      className="remove-image-btn"
                      onClick={() => removeVariantImage(activeVariant, index)}
                      title="Remove image"
                      type="button"
                    >
                      <X size={14} />
                    </button>

                    {!image.isPrimary && (
                      <div className="variant-preview-overlay">
                        <Button
                          className="primary-image-btn"
                          onClick={() => setPrimaryImage(activeVariant, index)}
                          title="Set as primary"
                          type="button"
                        >
                          <Star size={12} />
                          Primary
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {variantImages[activeVariant].length < 6 && (
                  <div className="variant-image-upload">
                    <Upload className="variant-upload-icon" />
                    <div className="variant-upload-text">Add Image</div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleVariantImageUpload(e, activeVariant)
                      }
                      className="file-input-overlay"
                    />
                  </div>
                )}
              </div>

              <div className="variant-footer">
                {variantImages[activeVariant].length}/6 images uploaded for{" "}
                {activeVariant} variant
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="form-actions-row">
        <Button type="button" variant="ghost" onClick={onBack}>
          Back
        </Button>
        <div className="right-actions">
          <Button
            type="submit"
            variant="primary"
            startIcon={<Save size={18} />}
            loading={loading}
          >
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default VariantImagesForm;
