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
} from "../../components/common";
import { generateSlug } from "../../utils/helpers";
import "./Tags.css";
import api from "../../services/api";
import { useDispatch } from "react-redux";
import {
  handelCatch,
  setPageLoading,
  showSuccess,
  throwError,
} from "../../store/globalSlice";

const TagForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .max(80, "Name must be less than 80 characters")
      .required("Name is required"),
    desc: Yup.string().max(500, "Description must be less than 500 characters"),
    value: Yup.string()
      .min(2, "Value must be at least 2 characters")
      .max(50, "Value must be less than 50 characters")
      .matches(
        /^[a-z0-9-]+$/,
        "Value can only contain lowercase letters, numbers, and hyphens"
      )
      .required("Value is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      desc: "",
      value: "",
      isActive: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const res = await api?.[isEdit ? "put" : "post"](
          `/tags${isEdit ? `/${id}` : ""}`,
          values
        );
        if (![200, 201].includes(res.status)) {
          dispatch(
            throwError(
              res?.data?.message || "Failed to save tag. Please try again."
            )
          );
          return;
        }
        navigate("/tags");
        dispatch(showSuccess(res?.data?.message || "Tag saved successfully."));
        return;
      } catch (error) {
        console.error("Error saving tag:", error);
        dispatch(handelCatch(error));
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit) {
      loadTag();
    }
  }, [id, isEdit]);

  useEffect(() => {
    // Auto-generate value from name if not editing
    if (!isEdit && formik.values.name && !formik.touched.value) {
      const generatedValue = generateSlug(formik.values.name);
      formik.setFieldValue("value", generatedValue);
    }
  }, [formik.values.name, isEdit, formik.touched.value]);

  const loadTag = async () => {
    dispatch(setPageLoading(true));

    try {
      const res = await api.get(`/tags/getTagById/${id}`);
      console.log("res", res);
      if (res.status !== 200) {
        dispatch(
          throwError(
            res?.data?.message || "Failed to load tag. Please try again."
          )
        );
        navigate("/tags");
        return;
      }

      const tag = res?.data?.response;
      formik.setValues({
        name: tag.name || "",
        desc: tag.desc || "",
        value: tag.value || "",
        isActive: tag.isActive || false,
      });
    } catch (error) {
      console.error("Error loading tag:", error);
      dispatch(handelCatch(error));
      navigate("/tags");
    } finally {
      dispatch(setPageLoading(false));
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">{isEdit ? "Edit Tag" : "Add New Tag"}</h1>
          <p className="page-subtitle">
            {isEdit ? "Update tag information" : "Create a new product tag"}
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="ghost"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/tags")}
          >
            Back to Tags
          </Button>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="tag-form">
        <Card title="Tag Information" className="form-section">
          <div className="form-section-body">
            <Input
              label="Tag Name"
              name="name"
              placeholder="Enter tag name"
              required
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && formik.errors.name}
            />

            <Input
              label="Tag Value"
              name="value"
              placeholder="Enter tag value (URL-friendly)"
              required
              value={formik.values.value}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.value && formik.errors.value}
            />
            <div className="value-helper">
              This will be used as the tag identifier. Only lowercase letters,
              numbers, and hyphens allowed.
            </div>

            <Textarea
              label="Description"
              name="desc"
              placeholder="Enter tag description"
              rows={3}
              value={formik.values.desc}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.desc && formik.errors.desc}
            />

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
            onClick={() => navigate("/tags")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            startIcon={<Save size={18} />}
            loading={loading}
          >
            {isEdit ? "Update Tag" : "Create Tag"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TagForm;
