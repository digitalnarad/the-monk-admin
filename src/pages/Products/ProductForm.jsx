import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Save, ArrowLeft, Upload, X, Star } from "lucide-react";
import {
  Button,
  Card,
  Input,
  Textarea,
  Select,
  MultiSelect,
  ImageCropper,
} from "../../components/common";
import { PRODUCT_VARIANTS } from "../../utils/constants";
import {
  validateImageFile,
  createImagePreview,
  cleanupImagePreview,
} from "../../utils/helpers";
import "./Products.css";

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [activeVariant, setActiveVariant] = useState("vertical");
  const [variantImages, setVariantImages] = useState({
    vertical: [],
    horizontal: [],
    square: [],
  });
  const [mainImage, setMainImage] = useState(null);

  // Mock data
  const mockCategories = [
    { value: "1", label: "Wall Art" },
    { value: "2", label: "Paintings" },
    { value: "3", label: "Prints" },
  ];

  const mockTags = [
    { value: "1", label: "Modern" },
    { value: "2", label: "Abstract" },
    { value: "3", label: "Minimalist" },
    { value: "4", label: "Colorful" },
    { value: "5", label: "Canvas" },
  ];

  const validationSchema = Yup.object({
    title: Yup.string()
      .min(3, "Title must be at least 3 characters")
      .max(100, "Title must be less than 100 characters")
      .required("Title is required"),
    desc: Yup.string()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description must be less than 500 characters")
      .required("Description is required"),
    price: Yup.number()
      .min(0, "Price must be positive")
      .required("Price is required"),
    discount: Yup.number()
      .min(0, "Discount must be positive")
      .test(
        "max-discount",
        "Discount cannot exceed product price",
        function (value) {
          const { price } = this.parent;
          if (!price || !value) return true;
          return value <= price;
        }
      ),
    category: Yup.string().required("Category is required"),
    defaultVariant: Yup.string()
      .oneOf(PRODUCT_VARIANTS, "Invalid variant")
      .required("Default variant is required"),
    tags: Yup.array().min(1, "At least one tag is required"),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
      desc: "",
      price: "",
      discount: 0,
      category: "",
      defaultVariant: "square",
      tags: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  useEffect(() => {
    setCategories(mockCategories);
    setTags(mockTags);

    if (isEdit) {
      loadProduct();
    }
  }, [id, isEdit]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock product data
      const mockProduct = {
        title: "Modern Art Canvas",
        desc: "Beautiful modern art piece for your living room decoration",
        price: 299.99,
        discount: 50.0,
        category: "1",
        defaultVariant: "vertical",
        tags: ["1", "5"],
      };

      formik.setValues(mockProduct);
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Product data:", {
        ...values,
        mainImage,
        variantImages,
      });

      // navigate("/products");
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVariantImageUpload = (event, variant) => {
    const files = Array.from(event.target.files);
    const currentImages = variantImages[variant];

    if (currentImages.length + files.length > 6) {
      alert("Maximum 6 images allowed per variant");
      return;
    }

    const newImages = [];
    files.forEach((file) => {
      const validation = validateImageFile(file);
      if (validation.valid) {
        newImages.push({
          file,
          preview: createImagePreview(file),
          url: createImagePreview(file),
          isPrimary: currentImages.length === 0 && newImages.length === 0,
        });
      }
    });

    setVariantImages((prev) => ({
      ...prev,
      [variant]: [...currentImages, ...newImages],
    }));
  };

  const removeVariantImage = (variant, index) => {
    const images = variantImages[variant];
    const imageToRemove = images[index];

    if (imageToRemove.preview) {
      cleanupImagePreview(imageToRemove.preview);
    }

    const updatedImages = images.filter((_, i) => i !== index);

    // If removed image was primary, make first image primary
    if (imageToRemove.isPrimary && updatedImages.length > 0) {
      updatedImages[0].isPrimary = true;
    }

    setVariantImages((prev) => ({
      ...prev,
      [variant]: updatedImages,
    }));
  };

  const setPrimaryImage = (variant, index) => {
    setVariantImages((prev) => ({
      ...prev,
      [variant]: prev[variant].map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  if (loading && isEdit) {
    return (
      <div className="page-loading">
        <div>Loading product...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            {isEdit ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="page-subtitle">
            {isEdit
              ? "Update product information"
              : "Create a new product in your catalog"}
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="ghost"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/products")}
          >
            Back to Products
          </Button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="product-form">
        <div className="form-grid">
          {/* Basic Information */}
          <Card title="Basic Information" className="form-section">
            <div className="form-section-body">
              <Input
                label="Product Title"
                name="title"
                placeholder="Enter product title"
                required
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && formik.errors.title}
              />

              <Textarea
                label="Description"
                name="desc"
                placeholder="Enter product description"
                required
                rows={4}
                value={formik.values.desc}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.desc && formik.errors.desc}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <Input
                  label="Price ($)"
                  name="price"
                  type="number"
                  placeholder="0.00"
                  required
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.price && formik.errors.price}
                />

                <Input
                  label="Discount ($)"
                  name="discount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formik.values.discount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.discount && formik.errors.discount}
                />
              </div>
            </div>
          </Card>

          {/* Main Image */}
          <Card title="Main Product Image" className="form-section ">
            <div className="form-section-body">
              <div className="main-upload-container">
                <ImageCropper
                  label=""
                  value={mainImage}
                  onChange={setMainImage}
                  enableCropping={true}
                  placeholder="Upload main product image"
                  accept="image/*"
                  maxSize={10 * 1024 * 1024}
                />
              </div>
              <div
                className="form-section-footer"
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  textAlign: "center",
                }}
              >
                Image will be cropped to square format automatically
              </div>
            </div>
          </Card>

          {/* Category and Tags */}
          <Card title="Categorization" className="form-section form-full-width">
            <div className="form-section-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <Select
                  label="Category"
                  name="category"
                  placeholder="Select category"
                  required
                  options={categories}
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.category && formik.errors.category}
                />

                <Select
                  label="Default Variant"
                  name="defaultVariant"
                  required
                  options={PRODUCT_VARIANTS.map((variant) => ({
                    value: variant,
                    label: variant.charAt(0).toUpperCase() + variant.slice(1),
                  }))}
                  value={formik.values.defaultVariant}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.defaultVariant &&
                    formik.errors.defaultVariant
                  }
                />

                <MultiSelect
                  label="Tags"
                  placeholder="Select tags"
                  options={tags}
                  value={formik.values.tags}
                  onChange={(value) => formik.setFieldValue("tags", value)}
                  error={formik.touched.tags && formik.errors.tags}
                />
              </div>
            </div>
          </Card>

          {/* Variant Images */}
          <Card title="Variant Images" className="form-section form-full-width">
            <div className="form-section-body">
              <div className="variant-tabs">
                {PRODUCT_VARIANTS.map((variant) => (
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
                      <span
                        style={{ marginLeft: "0.5rem", fontSize: "0.75rem" }}
                      >
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
                      >
                        <X size={14} />
                      </button>

                      {!image.isPrimary && (
                        <div className="variant-preview-overlay">
                          <Button
                            className="primary-image-btn"
                            onClick={() =>
                              setPrimaryImage(activeVariant, index)
                            }
                            title="Set as primary"
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
                        style={{
                          position: "absolute",
                          opacity: 0,
                          cursor: "pointer",
                          width: "100%",
                          height: "100%",
                          top: 0,
                          left: 0,
                          pointerEvents: "auto",
                          zIndex: 1,
                        }}
                      />
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "1rem",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                  }}
                >
                  {variantImages[activeVariant].length}/6 images uploaded for{" "}
                  {activeVariant} variant
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/products")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            startIcon={<Save size={18} />}
          >
            {isEdit ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
