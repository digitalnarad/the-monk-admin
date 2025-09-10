import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Save, ArrowLeft } from "lucide-react";
import {
  Button,
  Card,
  Input,
  Textarea,
  Checkbox,
  ImageCropper,
} from "../../components/common";
import "./Categories.css";
import api from "../../services/api";
import { useDispatch, useSelector } from "react-redux";
import {
  handelCatch,
  setPageLoading,
  showSuccess,
  throwError,
} from "../../store/globalSlice";

const CategoryForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isPageLoading } = useSelector((state) => state.global);
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);
  const [editCategory, setEditCategory] = useState(null);

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must be less than 80 characters")
      .required("Name is required"),
    desc: Yup.string().max(500, "Description must be less than 500 characters"),
    sortOrder: Yup.number()
      .min(0, "Sort order must be positive")
      .required("Sort order is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      desc: "",
      sortOrder: 0,
      isActive: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        console.log("Category data:", {
          ...values,
          bannerImage,
        });

        const formData = new FormData();
        formData.append("desc", values.desc);
        formData.append("name", values.name);
        formData.append("sortOrder", values.sortOrder);
        formData.append("isActive", values.isActive);
        if (bannerImage) {
          formData.append("image", bannerImage.file);
        }

        const res = await api?.[isEdit ? "put" : "post"](
          `/categories${isEdit ? `/${id}` : ""}`,
          formData
        );

        if (![200, 201].includes(res.status)) {
          console.error("Failed to save category:", res);
          dispatch(
            throwError(
              res?.data?.message || "Failed to save category. Please try again."
            )
          );
          return;
        }
        navigate("/categories");
        dispatch(
          showSuccess(res?.data?.message || "Category saved successfully.")
        );
      } catch (error) {
        console.error("Error saving category:", error);
        dispatch(handelCatch(error));
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadCategory();
    }
  }, [id, isEdit]);

  const loadCategory = async () => {
    dispatch(setPageLoading(true));
    try {
      // await new Promise((resolve) => setTimeout(resolve, 1000));
      const res = await api.get(`/categories/${id}`);
      if (res.status !== 200) {
        console.error("Failed to fetch category:", res);
        dispatch(
          throwError(
            res?.data?.message || "Failed to fetch category. Please try again."
          )
        );
        navigate("/categories");
        return;
      }

      const data = res.data.response;
      formik.setValues({
        name: data.name || "",
        desc: data.desc || "",
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive || false,
      });
      setEditCategory(data);
    } catch (error) {
      console.error("Error loading category:", error);
    } finally {
      dispatch(setPageLoading(false));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            {isEdit ? "Edit Category" : "Add New Category"}
          </h1>
          <p className="page-subtitle">
            {isEdit
              ? "Update category information"
              : "Create a new product category"}
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="ghost"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/categories")}
          >
            Back to Categories
          </Button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="category-form">
        <Card title="Category Information" className="form-section">
          <div className="form-section-body">
            <Input
              label="Category Name"
              name="name"
              placeholder="Enter category name"
              required
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && formik.errors.name}
            />

            <Textarea
              label="Description"
              name="desc"
              placeholder="Enter category description"
              rows={3}
              value={formik.values.desc}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.desc && formik.errors.desc}
            />

            <div className="two-column-fields">
              <Input
                label="Sort Order"
                name="sortOrder"
                type="number"
                placeholder="0"
                required
                className="sort-order-input"
                value={formik.values.sortOrder}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.sortOrder && formik.errors.sortOrder}
              />

              <div className="checkbox-bottom-align">
                <Checkbox
                  label="Active Category"
                  checked={formik.values.isActive}
                  onChange={(e) =>
                    formik.setFieldValue("isActive", e.target.checked)
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Banner Image (Optional)" className="form-section">
          <div className="form-section-body">
            {!isPageLoading && (
              <ImageCropper
                label="Banner Image"
                value={bannerImage}
                onChange={setBannerImage}
                aspectRatio={3}
                placeholder="Upload category banner"
                accept="image/*"
                url={editCategory?.bannerUrl || ""}
              />
            )}
            <div className="upload-hint">
              Recommended size: 1200x400px (3:1)
            </div>
          </div>
        </Card>

        <div className="form-actions-footer">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/categories")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            startIcon={<Save size={18} />}
          >
            {isEdit ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
