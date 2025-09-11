import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "../../components/common";
import { PRODUCT_VARIANTS } from "../../utils/constants";
import {
  validateImageFile,
  createImagePreview,
  cleanupImagePreview,
} from "../../utils/helpers";
import BasicInfoForm from "./components/BasicInfoForm";
import VariantImagesForm from "./components/VariantImagesForm";
import "./Products.css";
import api from "../../services/api";
import { useDispatch } from "react-redux";
import { handelCatch, throwError } from "../../store/globalSlice";

const ProductForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [activeVariant, setActiveVariant] = useState("vertical");
  const [variantImages, setVariantImages] = useState({
    vertical: [],
    horizontal: [],
    square: [],
  });
  const [mainImage, setMainImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [productId, setProductId] = useState(null);
  const [productData, setProductData] = useState({});

  useEffect(() => {
    if (isEdit) {
      setProductId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const getCategories = async () => {
    try {
      const res = await api.get("/categories/get-list");
      console.log("res", res);
      if (res.status !== 200) {
        setCategories([]);
        return;
      }
      // return res.data;
      setCategories(res.data.response?.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      dispatch(handelCatch(error));
      return;
    }
  };

  const getTags = async () => {
    try {
      const res = await api.get("/tags/get-List");
      if (res.status !== 200) {
        setTags([]);
        return;
      }
      // return res.data;
      setTags(res.data.response?.tags || []);
    } catch (error) {
      console.error("Error fetching tags:", error);
      dispatch(handelCatch(error));
      return;
    }
  };
  useEffect(() => {
    getCategories();
    getTags();
  }, []);

  const loadProduct = async () => {
    setLoading(true);
    try {
      // await new Promise((resolve) => setTimeout(resolve, 800));
      const res = await api.get(`/products/${productId}`);
      if (res.status !== 200) {
        dispatch(
          throwError(
            res?.data?.message || "Failed to fetch product. Please try again."
          )
        );
        setProductData({});
        navigate("/products");
        return;
      }

      const product = res?.data?.response;
      setProductData(product);
    } catch (error) {
      console.error("Error loading product:", error);
      dispatch(handelCatch(error));
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      console.log("Final product payload:", {
        ...values,
        productId: productId || "(no-id)",
        mainImage,
        variantImages,
      });
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

      <div className="product-form">
        <div className="stepper">
          <div
            className={`step ${
              currentStep === 1 ? "active" : productId ? "completed" : ""
            }`}
            onClick={() => setCurrentStep(1)}
          >
            <div className="step-circle">
              <span>
                {productId ? <Check size={18} strokeWidth={4} /> : "1"}
              </span>
            </div>
            <div className="step-label">Product basic info</div>
          </div>

          <div className={`step-line ${currentStep === 2 ? "active" : ""} `}>
            <span></span>
          </div>

          <div
            className={`step ${
              currentStep === 2
                ? "active"
                : isEdit
                ? "completed"
                : productId
                ? "clickable"
                : "disabled"
            }`}
            onClick={() => {
              if (productId || isEdit) setCurrentStep(2);
            }}
          >
            <div className="step-circle">
              <span>{isEdit ? <Check size={18} strokeWidth={4} /> : "2"}</span>
            </div>
            <div className="step-label">Children Step 2</div>
          </div>
        </div>

        {currentStep === 1 && (
          <BasicInfoForm
            onProductSubmit={(id) => {
              setProductId(id);
              setCurrentStep(2);
            }}
            productId={productId}
            productData={productData}
            categories={categories}
            tags={tags}
            loadProduct={() => {
              loadProduct();
            }}
          />
        )}

        {currentStep === 2 && (
          <VariantImagesForm
            PRODUCT_VARIANTS={PRODUCT_VARIANTS}
            activeVariant={activeVariant}
            setActiveVariant={setActiveVariant}
            variantImages={variantImages}
            handleVariantImageUpload={handleVariantImageUpload}
            removeVariantImage={removeVariantImage}
            setPrimaryImage={setPrimaryImage}
            loading={loading}
            isEdit={isEdit}
            onBack={() => setCurrentStep(1)}
            onSubmit={() => {}}
          />
        )}
      </div>
    </div>
  );
};

export default ProductForm;
