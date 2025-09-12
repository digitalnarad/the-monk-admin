import { useEffect, useMemo, useState } from "react";
import { Button, Card } from "../../../components/common";
import { Save, Upload, X, Star, RefreshCcwDot } from "lucide-react";
import { PRODUCT_VARIANTS } from "../../../utils/constants";
import { useDispatch } from "react-redux";
import { handelCatch, showSuccess } from "../../../store/globalSlice";
import api from "../../../services/api";
import { ClipLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const VariantImagesForm = ({ setCurrentStep, productId, product }) => {
  const tabs = useMemo(() => PRODUCT_VARIANTS, [PRODUCT_VARIANTS]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeVariant, setActiveVariant] = useState("vertical");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [variantImages, setVariantImages] = useState({
    vertical: {
      isPrimary: "",
      images: [],
    },
    horizontal: {
      isPrimary: "",
      images: [],
    },
    square: {
      isPrimary: "",
      images: [],
    },
  });

  useEffect(() => {
    if (product?.variants) {
      setVariantImages(product?.variants || {});
    }
  }, [JSON.stringify(product?.variants)]);

  useEffect(() => {
    if (!productId) {
      setCurrentStep(1);
    }
  }, [productId]);

  const handleVariantImageUpload = async (event, variant) => {
    setUploading(true);
    try {
      const file = event.target.files?.[0];
      if (!file) return dispatch(throwError("Please select a file"));

      const currentImages = variantImages[variant];
      if (currentImages.length + 1 > 6) {
        dispatch(
          throwError("You can only upload a maximum of 6 images per variant.")
        );
        return;
      }

      const res = await api.uploadToCloudinary(
        file,
        `the-monk/products/${product.skuId}/variants/${variant}`
      );

      setVariantImages((prev) => ({
        ...prev,
        [variant]: {
          isPrimary: prev[variant]?.isPrimary || res.public_id,
          images: [
            ...prev[variant].images,
            {
              url: res.secure_url,
              public_id: res.public_id,
              alt: res.display_name,
              token: res.delete_token,
              width: res.width,
              height: res.height,
              format: res.format,
            },
          ],
        },
      }));
    } catch (error) {
      console.log("error", error);
      dispatch(handelCatch(error));
    } finally {
      setUploading(false);
    }
  };

  const removeVariantImage = (variant, image) => {
    const images = variantImages[variant].images;
    const isPrimary = variantImages[variant].isPrimary;
    const updatedImages = images.filter(
      (img) => img.public_id !== image.public_id
    );
    setVariantImages((prev) => ({
      ...prev,
      [variant]: {
        isPrimary:
          isPrimary === image.public_id
            ? updatedImages?.[0]?.public_id || ""
            : isPrimary,
        images: updatedImages,
      },
    }));
  };

  const setPrimaryImage = (variant, public_id) => {
    setVariantImages((prev) => ({
      ...prev,
      [variant]: {
        ...prev[variant],
        isPrimary: public_id,
      },
    }));
  };

  const onSubmit = async () => {
    console.log("variantImages", variantImages);
    setLoading(true);
    try {
      const res = await api.put(
        `/products/${productId}/variants`,
        variantImages
      );
      console.log("res", res);
      if (res.status !== 200) {
        dispatch(
          throwError(
            res?.data?.message || "Failed to update product. Please try again."
          )
        );
        setVariantImages(product?.variants || {});
        return;
      }
      dispatch(showSuccess(res.data.message));
      navigate(`/products`);
    } catch (error) {
      console.log("error", error);
      dispatch(handelCatch(error));
    } finally {
      setLoading(false);
    }
  };
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
                  {variantImages[variant].images.length > 0 && (
                    <span className="variant-count">
                      ({variantImages[variant].images.length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="variant-content">
              <div className="variant-image-grid">
                {(variantImages[activeVariant]?.images || []).map(
                  (image, index) => {
                    const isPrimary =
                      variantImages[activeVariant]?.isPrimary ===
                      image.public_id;
                    return (
                      <div
                        key={index}
                        className={`image-preview ${
                          isPrimary ? "primary-image" : ""
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`${activeVariant} variant ${index + 1}`}
                        />

                        <button
                          className="remove-image-btn"
                          onClick={() =>
                            removeVariantImage(activeVariant, image)
                          }
                          title="Remove image"
                          type="button"
                        >
                          <X size={14} />
                        </button>

                        {!isPrimary && (
                          <div className="variant-preview-overlay">
                            <Button
                              className="primary-image-btn"
                              onClick={() =>
                                setPrimaryImage(activeVariant, image.public_id)
                              }
                              title="Set as primary"
                              type="button"
                            >
                              <Star size={12} />
                              Primary
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}

                {variantImages[activeVariant].images.length < 6 && (
                  <div className="variant-image-upload">
                    <ClipLoader
                      loading={uploading}
                      color="#6b7280"
                      size={30}
                      className="variant-upload-icon"
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                    {!uploading && <Upload className="variant-upload-icon" />}
                    <div className="variant-upload-text ">
                      {uploading ? "Uploading..." : "Add Image"}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={uploading}
                      onChange={(e) =>
                        handleVariantImageUpload(e, activeVariant)
                      }
                      className="file-input-overlay"
                    />
                  </div>
                )}
              </div>

              <div className="variant-footer">
                {variantImages[activeVariant].images.length}/6 images uploaded
                for {activeVariant} variant
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="form-actions-row">
        <Button type="button" variant="ghost" onClick={() => setCurrentStep(1)}>
          Back
        </Button>
        <div className="right-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (product?.variants) setVariantImages(product.variants);
            }}
            endIcon={<RefreshCcwDot size={18} strokeWidth={2} />}
          >
            Reset
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onSubmit}
            startIcon={<Save size={18} />}
            loading={loading}
            disabled={uploading || loading}
          >
            Update Variant
          </Button>
        </div>
      </div>
    </form>
  );
};

export default VariantImagesForm;
