import {
  Button,
  Card,
  Input,
  Textarea,
  Select,
  MultiSelect,
  ImageCropper,
  Checkbox,
} from "../../../components/common";
import {
  Circle,
  CircleDashed,
  CircleX,
  RefreshCcwDot,
  Save,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../../services/api";
import { useDispatch } from "react-redux";
import {
  handelCatch,
  showSuccess,
  throwError,
} from "../../../store/globalSlice";
import { useEffect, useRef, useState } from "react";
import { PRODUCT_VARIANTS } from "../../../utils/constants";
const BasicInfoForm = ({
  onProductSubmit = () => {},
  productData = {},
  tags,
  categories,
  loadProduct,
}) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [mainImage, setMainImage] = useState(null);

  const [isReset, setIsReset] = useState(false);

  const [isBasicEdit, setIsBasicEdit] = useState(false);

  useEffect(() => {
    setIsBasicEdit(Boolean(productData?._id));
    if (productData?._id) {
      loadProductData();
    }
  }, [JSON.stringify(productData)]);

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
    isActive: Yup.boolean(),
  });

  const loadProductData = () => {
    formik.setValues({
      title: productData?.title || "",
      desc: productData?.desc || "",
      price: productData?.price || "",
      discount: productData?.discount || 0,
      category: productData?.category || "",
      defaultVariant: productData?.defaultVariant || "square",
      tags: productData?.tags || [],
      isActive: productData?.isActive || true,
    });
    // setExistingMainImage(productData?.mainImage);
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      desc: "",
      price: "",
      discount: 0,
      category: "",
      defaultVariant: "square",
      tags: [],
      isActive: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      const errors = await formik.validateForm();
      const hasErrors = Object.keys(errors).length > 0;

      if (hasErrors) {
        Object.keys(values).forEach((k) =>
          formik.setFieldTouched(k, true, false)
        );
        return;
      }

      if (!mainImage && !isBasicEdit) {
        dispatch(
          throwError("Please upload a main product image before proceeding.")
        );
        return;
      }

      setLoading(true);

      try {
        console.log("values", values);
        const formdata = new FormData();
        formdata.append("title", values.title);
        formdata.append("desc", values.desc);
        formdata.append("price", values.price);
        formdata.append("discount", values.discount);
        formdata.append("category", values.category);
        formdata.append("defaultVariant", values.defaultVariant);
        formdata.append("tags", JSON.stringify(values.tags));
        formdata.append("isActive", values.isActive);
        if (mainImage) {
          formdata.append("image", mainImage.file);
        }

        const res = await api?.[isBasicEdit ? "put" : "post"](
          `/products${isBasicEdit ? `/${productData?._id}` : ""}`,
          formdata
        );
        if (![200, 201].includes(res.status)) {
          dispatch(
            throwError(
              res?.data?.message || "Failed to save product. Please try again."
            )
          );
          return;
        }
        onProductSubmit(res.data?.response?._id || "");
        if (isBasicEdit) {
          loadProduct();
        }
        dispatch(
          showSuccess(res?.data?.message || "Product saved successfully.")
        );

        return;
      } catch (error) {
        console.log("error", error);
        dispatch(handelCatch(error));
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="product-step-form">
      <div className="form-grid">
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

            <div className="two-col-grid">
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <Checkbox
                label="Active Tag"
                checked={formik.values.isActive}
                onChange={(e) =>
                  formik.setFieldValue("isActive", e.target.checked)
                }
              />
            </div>
          </div>
        </Card>

        <Card title="Main Product Image" className="form-section ">
          <div className="form-section-body">
            <div className="main-image-wrapper">
              <ImageCropper
                label=""
                value={mainImage}
                onChange={setMainImage}
                enableCropping={true}
                placeholder="Upload main product image"
                accept="image/*"
                maxSize={10 * 1024 * 1024}
                url={productData?.image || ""}
                isReset={isReset}
                setIsReset={setIsReset}
              />
            </div>

            <div className="form-note">
              Image will be cropped to square format automatically
            </div>
          </div>
        </Card>

        <Card title="Categorization" className="form-section form-full-width">
          <div className="form-section-body">
            <div className="three-col-grid">
              <Select
                label="Category"
                name="category"
                placeholder="Select category"
                required
                options={categories.map((ele) => ({
                  value: ele._id,
                  label: ele.name,
                }))}
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
                  formik.touched.defaultVariant && formik.errors.defaultVariant
                }
              />

              <MultiSelect
                label="Tags"
                placeholder="Select tags"
                options={tags.map((ele) => ({
                  value: ele._id,
                  label: ele.name,
                }))}
                value={formik.values.tags}
                onChange={(value) => formik.setFieldValue("tags", value)}
                error={formik.touched.tags && formik.errors.tags}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="form-actions-row">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate("/products")}
        >
          Cancel
        </Button>
        <div className="right-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              loadProductData();
              setIsReset(true);
            }}
            endIcon={<RefreshCcwDot size={18} strokeWidth={2} />}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            startIcon={<Save size={18} />}
            loading={loading}
          >
            {isBasicEdit ? "Update " : "Create "} & Next
          </Button>
        </div>
      </div>
    </form>
  );
};

export default BasicInfoForm;
