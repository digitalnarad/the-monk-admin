import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { Table, Button, Card, Modal, Input } from '../../components/common';
import { formatDate, formatCurrency, truncateText } from '../../utils/helpers';
import './Products.css';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, product: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 10,
    count: 0
  });

  // Mock data for demonstration
  const mockProducts = [
    {
      _id: '1',
      skuId: 'SKU001',
      title: 'Modern Art Canvas',
      desc: 'Beautiful modern art piece for your living room decoration',
      price: 299.99,
      discount: 10,
      category: { name: 'Wall Art' },
      tags: [{ name: 'Modern' }, { name: 'Canvas' }],
      defaultVariant: 'vertical',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      _id: '2',
      skuId: 'SKU002',
      title: 'Abstract Painting',
      desc: 'Unique abstract painting with vibrant colors',
      price: 459.99,
      discount: 15,
      category: { name: 'Paintings' },
      tags: [{ name: 'Abstract' }, { name: 'Colorful' }],
      defaultVariant: 'horizontal',
      isActive: true,
      createdAt: '2024-01-14T09:15:00Z'
    },
    {
      _id: '3',
      skuId: 'SKU003',
      title: 'Minimalist Print',
      desc: 'Clean and simple minimalist design for modern spaces',
      price: 149.99,
      discount: 0,
      category: { name: 'Prints' },
      tags: [{ name: 'Minimalist' }, { name: 'Modern' }],
      defaultVariant: 'square',
      isActive: false,
      createdAt: '2024-01-13T14:45:00Z'
    }
  ];

  useEffect(() => {
    loadProducts();
  }, [pagination.currentPage, searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter products based on search term
      const filteredProducts = mockProducts.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.skuId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setProducts(filteredProducts);
      setPagination(prev => ({ ...prev, count: filteredProducts.length }));
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleDeleteProduct = async (productId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProducts(prev => prev.filter(p => p._id !== productId));
      setDeleteModal({ isOpen: false, product: null });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getTableHeaders = () => [
    { title: 'SKU', className: 'w-100', isSort: true, key: 'skuId' },
    { title: 'Product', className: 'w-300', isSort: true, key: 'title' },
    { title: 'Category', className: 'w-150', isSort: true, key: 'category' },
    { title: 'Price', className: 'w-100 text-right', isSort: true, key: 'price' },
    { title: 'Status', className: 'w-100 text-center', isSort: true, key: 'isActive' },
    { title: 'Created', className: 'w-150', isSort: true, key: 'createdAt' },
    { title: 'Actions', className: 'w-150 text-center' }
  ];

  const getTableRows = () => {
    return products.map((product) => ({
      data: [
        { value: product.skuId, className: 'font-medium' },
        { 
          value: (
            <div>
              <div className="font-medium">{truncateText(product.title, 30)}</div>
              <div className="text-xs text-gray-500">{truncateText(product.desc, 40)}</div>
            </div>
          )
        },
        { value: product.category?.name || '-' },
        { 
          value: (
            <div className="text-right">
              <div className="font-medium">{formatCurrency(product.price)}</div>
              {product.discount > 0 && (
                <div className="text-xs text-green-600">{product.discount}% off</div>
              )}
            </div>
          )
        },
        { 
          value: (
            <div className="text-center">
              <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          )
        },
        { value: formatDate(product.createdAt) },
        { 
          value: (
            <div className="action-buttons">
              <Button
                variant="ghost"
                size="small"
                startIcon={<Eye size={14} />}
                onClick={() => navigate(`/products/${product._id}`)}
              />
              <Button
                variant="ghost"
                size="small"
                startIcon={<Edit size={14} />}
                onClick={() => navigate(`/products/edit/${product._id}`)}
              />
              <Button
                variant="ghost"
                size="small"
                startIcon={<Trash2 size={14} />}
                onClick={() => setDeleteModal({ isOpen: true, product })}
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
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            startIcon={<Plus size={18} />}
            onClick={() => navigate('/products/add')}
          >
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <Table
          header={getTableHeaders()}
          row={getTableRows()}
          loader={loading}
          searchable={true}
          onSearch={handleSearch}
          paginationOption={pagination}
          onPaginationChange={handlePageChange}
          min="1200px"
        />
      </Card>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        title="Delete Product"
        size="small"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ isOpen: false, product: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDeleteProduct(deleteModal.product?._id)}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="modal-confirm">
          <p>Are you sure you want to delete "{deleteModal.product?.title}"?</p>
          <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
};

export default ProductList;
