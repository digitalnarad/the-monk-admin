import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { Table, Button, Card, Modal, Input } from "../../components/common";
import { formatDate, formatCurrency, truncateText } from "../../utils/helpers";
import "./Products.css";
import api from "../../services/api";
import { handelCatch, showSuccess, throwError } from "../../store/globalSlice";
import { useDispatch } from "react-redux";
import useDebounce from "../../hooks/useDebounce";

const ProductList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    product: null,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [shortBy, setShortBy] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 5,
    count: 0,
  });

  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    loadProducts();
  }, [
    pagination.currentPage,
    pagination.pageSize,
    shortBy.key,
    shortBy.direction,
    debouncedSearch,
  ]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const searchQuery = debouncedSearch?.trim()
        ? `&search=${encodeURIComponent(debouncedSearch.trim())}`
        : "";
      const res = await api.get(
        `/products/?page=${pagination.currentPage}&limit=${pagination.pageSize}&sortBy=${shortBy.key}&order=${shortBy.direction}${searchQuery}`
      );
      if (res.status !== 200) {
        dispatch(
          throwError(
            res?.data?.message || "Failed to load products. Please try again."
          )
        );
        return;
      }
      // Filter products based on search term

      setProducts(res.data.response?.products || []);
      setPagination((prev) => ({
        ...prev,
        count: res.data.response?.count || 0,
      }));
    } catch (error) {
      console.error("Error loading products:", error);
      dispatch(handelCatch(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleDeleteProduct = async (productId) => {
    setIsDeleting(true);

    try {
      const res = await api.delete(`/products/${productId}`);
      console.log("res", res);
      if (res.status !== 200) {
        dispatch(
          throwError(
            res?.data?.message || "Failed to delete product. Please try again."
          )
        );
        return;
      }
      dispatch(showSuccess(res.data.message));
      loadProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      dispatch(handelCatch(error));
    } finally {
      setDeleteModal({ isOpen: false, product: null });
      setIsDeleting(false);
    }
  };

  const getTableHeaders = () => [
    {
      title: "SKU",
      className: "wp-15",
      isSort: true,
      key: "skuId",
      widthPercent: 15,
    },
    {
      title: "Product",
      className: "wp-30",
      isSort: true,
      key: "title",
      widthPercent: 30,
    },
    {
      title: "Category",
      className: "wp-15",
      isSort: true,
      key: "category",
      widthPercent: 15,
    },
    {
      title: "Price",
      className: "wp-10 text-right",
      isSort: true,
      key: "price",
      widthPercent: 10,
    },
    {
      title: "Status",
      className: "wp-10 text-center",
      isSort: true,
      key: "isActive",
      widthPercent: 10,
    },
    {
      title: "Created",
      className: "wp-15",
      isSort: true,
      key: "createdAt",
      widthPercent: 10,
    },
    { title: "Actions", className: "wp-15 text-center", widthPercent: 10 },
  ];

  const getTableRows = () => {
    return products.map((product) => ({
      data: [
        { value: product.skuId, className: "font-medium" },
        {
          value: (
            <div>
              <div className="font-medium">
                {truncateText(product.title, 30)}
              </div>
              <div className="text-xs text-gray-500">
                {truncateText(product.desc, 40)}
              </div>
            </div>
          ),
        },
        { value: product.category?.name || "-" },
        {
          value: (
            <div className="text-right ">
              <div className="font-medium text-primary">
                {formatCurrency(product.price)}
              </div>
              {product.discount > 0 && (
                <div className="text-xs text-green-600">
                  {product.discount}% off
                </div>
              )}
            </div>
          ),
        },
        {
          value: (
            <div className="text-center">
              <span
                className={`status-badge ${
                  product.isActive ? "active" : "inactive"
                }`}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ),
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
                onClick={() => navigate(`/products/edit/${product.skuId}`)}
              />
              <Button
                variant="ghost"
                size="small"
                startIcon={<Trash2 size={14} />}
                onClick={() => setDeleteModal({ isOpen: true, product })}
                className="text-red-600 hover:text-red-700"
              />
            </div>
          ),
        },
      ],
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
            onClick={() => navigate("/products/add")}
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
          onSort={(key, direction) => {
            setShortBy({ key, direction });
            console.log("{ key, direction }", { key, direction });
            setPagination((prev) => ({ ...prev, currentPage: 0 }));
          }}
          defaultSort={shortBy}
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
              loading={isDeleting}
              onClick={() => handleDeleteProduct(deleteModal.product?._id)}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="modal-confirm">
          <p>Are you sure you want to delete "{deleteModal.product?.title}"?</p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ProductList;
