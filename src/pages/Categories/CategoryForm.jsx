import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import { Button, Card, Input, Textarea, Checkbox } from '../../components/common';
import { validateImageFile, createImagePreview, cleanupImagePreview } from '../../utils/helpers';
import './Categories.css';

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [bannerImage, setBannerImage] = useState(null);

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must be less than 80 characters')
      .required('Name is required'),
    desc: Yup.string()
      .max(500, 'Description must be less than 500 characters'),
    sortOrder: Yup.number()
      .min(0, 'Sort order must be positive')
      .required('Sort order is required')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      desc: '',
      sortOrder: 0,
      isActive: true
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    }
  });

  useEffect(() => {
    if (isEdit) {
      loadCategory();
    }
  }, [id, isEdit]);

  const loadCategory = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockCategory = {
        name: 'Wall Art',
        desc: 'Beautiful wall art pieces for home decoration',
        sortOrder: 1,
        isActive: true
      };
      
      formik.setValues(mockCategory);
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Category data:', {
        ...values,
        bannerImage
      });
      
      navigate('/categories');
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBannerUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (bannerImage?.preview) {
      cleanupImagePreview(bannerImage.preview);
    }

    setBannerImage({
      file,
      preview: createImagePreview(file),
      url: createImagePreview(file)
    });
  };

  const removeBanner = () => {
    if (bannerImage?.preview) {
      cleanupImagePreview(bannerImage.preview);
    }
    setBannerImage(null);
  };

  if (loading && isEdit) {
    return (
      <div className="page-loading">
        <div>Loading category...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            {isEdit ? 'Edit Category' : 'Add New Category'}
          </h1>
          <p className="page-subtitle">
            {isEdit ? 'Update category information' : 'Create a new product category'}
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="ghost"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/categories')}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '1rem' }}>
                <Checkbox
                  label="Active Category"
                  checked={formik.values.isActive}
                  onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Banner Image (Optional)" className="form-section">
          <div className="form-section-body">
            {!bannerImage ? (
              <div className="banner-upload-container">
                <Upload className="image-upload-icon" />
                <div className="image-upload-text">Upload category banner</div>
                <div className="image-upload-subtext">
                  JPG, PNG or WebP (Max 5MB) - Recommended size: 1200x300px
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    pointerEvents: 'auto',
                    zIndex: 1
                  }}
                />
              </div>
            ) : (
              <div className="banner-preview">
                <img src={bannerImage.preview} alt="Category banner" />
                <div className="banner-preview-overlay">
                  <Button
                    variant="danger"
                    size="small"
                    startIcon={<X size={14} />}
                    onClick={removeBanner}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/categories')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            startIcon={<Save size={18} />}
          >
            {isEdit ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
