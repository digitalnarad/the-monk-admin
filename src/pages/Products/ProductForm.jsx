import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCheck } from "lucide-react";
import { Button } from "../../components/common";
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
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [productSkuId, setProductSkuId] = useState(null);
  const [productData, setProductData] = useState({});

  useEffect(() => {
    if (isEdit) {
      setProductSkuId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  useEffect(() => {
    if (productSkuId) {
      loadProduct();
    }
  }, [productSkuId]);

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
      const res = await api.get(`/products/${productSkuId}`);
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
              currentStep === 1 ? "active" : productSkuId ? "completed" : ""
            }`}
            onClick={() => setCurrentStep(1)}
          >
            <div className="step-circle">
              <span>
                {productSkuId ? <Check size={18} strokeWidth={4} /> : "1"}
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
                : productSkuId
                ? "clickable"
                : "disabled"
            }`}
            onClick={() => {
              if (productSkuId || isEdit) setCurrentStep(2);
            }}
          >
            <div className="step-circle">
              <span>
                {isEdit ? <CheckCheck size={18} strokeWidth={4} /> : "2"}
              </span>
            </div>
            <div className="step-label">Variant images</div>
          </div>
        </div>

        {currentStep === 1 && (
          <BasicInfoForm
            onProductSubmit={(id) => {
              setProductSkuId(id);
              setCurrentStep(2);
            }}
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
            setCurrentStep={setCurrentStep}
            productId={productData?._id}
            product={productData}
          />
        )}
      </div>
    </div>
  );
};

export default ProductForm;
