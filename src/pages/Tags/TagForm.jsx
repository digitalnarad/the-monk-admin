import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Save, ArrowLeft } from 'lucide-react';
import { Button, Card, Input, Textarea, Checkbox } from '../../components/common';
import { generateSlug } from '../../utils/helpers';
import './Tags.css';

const TagForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(80, 'Name must be less than 80 characters')
      .required('Name is required'),
    desc: Yup.string()
      .max(500, 'Description must be less than 500 characters'),
    value: Yup.string()
      .min(2, 'Value must be at least 2 characters')
      .max(50, 'Value must be less than 50 characters')
      .matches(/^[a-z0-9-]+$/, 'Value can only contain lowercase letters, numbers, and hyphens')
      .required('Value is required')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      desc: '',
      value: '',
      isActive: true
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSubmit(values);
    }
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
      formik.setFieldValue('value', generatedValue);
    }
  }, [formik.values.name, isEdit, formik.touched.value]);

  const loadTag = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTag = {
        name: 'Modern',
        desc: 'Modern style artwork',
        value: 'modern',
        isActive: true
      };
      
      formik.setValues(mockTag);
    } catch (error) {
      console.error('Error loading tag:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Tag data:', values);
      
      navigate('/tags');
    } catch (error) {
      console.error('Error saving tag:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="page-loading">
        <div>Loading tag...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">
            {isEdit ? 'Edit Tag' : 'Add New Tag'}
          </h1>
          <p className="page-subtitle">
            {isEdit ? 'Update tag information' : 'Create a new product tag'}
          </p>
        </div>
        <div className="page-actions">
          <Button
            variant="ghost"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate('/tags')}
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
              This will be used as the tag identifier. Only lowercase letters, numbers, and hyphens allowed.
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Checkbox
                label="Active Tag"
                checked={formik.values.isActive}
                onChange={(e) => formik.setFieldValue('isActive', e.target.checked)}
              />
              
              {formik.values.name && (
                <div className="tag-preview-container">
                  <span>Preview: </span>
                  <span className={`tag-preview ${formik.values.isActive ? '' : 'inactive'}`}>
                    {formik.values.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/tags')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            startIcon={<Save size={18} />}
          >
            {isEdit ? 'Update Tag' : 'Create Tag'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TagForm;
