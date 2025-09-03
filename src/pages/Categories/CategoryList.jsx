import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Table, Button, Card, Modal } from '../../components/common';
import { formatDate } from '../../utils/helpers';
import './Categories.css';

const CategoryList = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, category: null });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 10,
    count: 0
  });

  // Mock data
  const mockCategories = [
    {
      _id: '1',
      name: 'Wall Art',
      desc: 'Beautiful wall art pieces for home decoration',
      slug: 'wall-art',
      sortOrder: 1,
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      _id: '2',
      name: 'Paintings',
      desc: 'Original and print paintings',
      slug: 'paintings',
      sortOrder: 2,
      isActive: true,
      createdAt: '2024-01-14T09:15:00Z'
    },
    {
      _id: '3',
      name: 'Prints',
      desc: 'High-quality art prints',
      slug: 'prints',
      sortOrder: 3,
      isActive: false,
      createdAt: '2024-01-13T14:45:00Z'
    }
  ];

  useEffect(() => {
    loadCategories();
  }, [pagination.currentPage]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCategories(mockCategories);
      setPagination(prev => ({ ...prev, count: mockCategories.length }));
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCategories(prev => prev.filter(c => c._id !== categoryId));
      setDeleteModal({ isOpen: false, category: null });
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const getTableHeaders = () => [
    { title: 'Name', className: 'w-200', isSort: true, key: 'name' },
    { title: 'Description', className: 'w-300', isSort: false },
    { title: 'Slug', className: 'w-150', isSort: true, key: 'slug' },
    { title: 'Sort Order', className: 'w-100 text-center', isSort: true, key: 'sortOrder' },
    { title: 'Status', className: 'w-100 text-center', isSort: true, key: 'isActive' },
    { title: 'Created', className: 'w-150', isSort: true, key: 'createdAt' },
    { title: 'Actions', className: 'w-150 text-center' }
  ];

  const getTableRows = () => {
    return categories.map((category) => ({
      data: [
        { value: category.name, className: 'font-medium' },
        { value: category.desc || '-' },
        { value: category.slug, className: 'text-sm text-gray-600' },
        { value: category.sortOrder, className: 'text-center' },
        { 
          value: (
            <div className="text-center">
              <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                {category.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          )
        },
        { value: formatDate(category.createdAt) },
        { 
          value: (
            <div className="action-buttons">
              <Button
                variant="ghost"
                size="small"
                startIcon={<Edit size={14} />}
                onClick={() => navigate(`/categories/edit/${category._id}`)}
              />
              <Button
                variant="ghost"
                size="small"
                startIcon={<Trash2 size={14} />}
                onClick={() => setDeleteModal({ isOpen: true, category })}
                className="text-red-600 hover:text-red-700"
              />
            </div>
          )
        }
      ]
    }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage product categories</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            startIcon={<Plus size={18} />}
            onClick={() => navigate('/categories/add')}
          >
            Add Category
          </Button>
        </div>
      </div>

      <Card>
        <Table
          header={getTableHeaders()}
          row={getTableRows()}
          loader={loading}
          searchable={true}
          paginationOption={pagination}
          onPaginationChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
          min="1000px"
        />
      </Card>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, category: null })}
        title="Delete Category"
        size="small"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ isOpen: false, category: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDeleteCategory(deleteModal.category?._id)}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="modal-confirm">
          <p>Are you sure you want to delete "{deleteModal.category?.name}"?</p>
          <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryList;
