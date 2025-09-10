import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { Table, Button, Card, Modal } from "../../components/common";
import { formatDate } from "../../utils/helpers";
import "./Categories.css";
import api from "../../services/api";
import { handelCatch, throwError, showSuccess } from "../../store/globalSlice";
import { useDispatch } from "react-redux";
import useDebounce from "../../hooks/useDebounce";

const CategoryList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    category: null,
  });
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
    loadCategories();
  }, [
    pagination.currentPage,
    pagination.pageSize,
    shortBy.key,
    shortBy.direction,
    debouncedSearch,
  ]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      // await new Promise(resolve => setTimeout(resolve, 800));
      const searchQuery = debouncedSearch?.trim()
        ? `&search=${encodeURIComponent(debouncedSearch.trim())}`
        : "";
      const res = await api.get(
        `/categories/?page=${pagination.currentPage}&limit=${pagination.pageSize}&sortBy=${shortBy.key}&order=${shortBy.direction}${searchQuery}`
      );
      if (res.status !== 200) {
        console.error("Failed to fetch categories:", res);
        setCategories([]);
        setPagination((prev) => ({ ...prev, count: 0 }));
        dispatch(
          throwError(
            res?.data?.message ||
              "Failed to fetch categories. Please try again."
          )
        );
        return;
      }
      setCategories(res.data.response?.categories || []);
      setPagination((prev) => ({
        ...prev,
        count: res.data.response?.count || 0,
      }));
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      const res = await api.delete(`/categories/${categoryId}`);

      if (res.status !== 200) {
        console.error("Failed to delete category:", res);
        dispatch(
          throwError(
            res?.data?.message || "Failed to delete category. Please try again."
          )
        );
        return;
      }
      dispatch(
        showSuccess(res?.data?.message || "Category deleted successfully.")
      );
    } catch (error) {
      console.error("Error deleting category:", error);
      dispatch(handelCatch(error));
    } finally {
      setDeleteModal({ isOpen: false, category: null });
      loadCategories();
    }
  };

  const getTableHeaders = () => [
    { title: "Name", className: "wp-15", isSort: true, key: "name" },
    { title: "Description", className: "", isSort: false },
    { title: "Slug", className: "wp-15", isSort: true, key: "slug" },
    {
      title: "Sort Order",
      className: "wp-10 text-center",
      isSort: true,
      key: "sortOrder",
    },
    {
      title: "Status",
      className: "wp-10 text-center",
      isSort: true,
      key: "isActive",
    },
    { title: "Created", className: "wp-10", isSort: true, key: "createdAt" },
    { title: "Actions", className: "wp-10 text-center" },
  ];

  const getTableRows = () => {
    return categories.map((category) => ({
      data: [
        { value: category.name, className: "font-medium " },
        { value: category.desc || "-", className: "" },
        { value: category.slug, className: "text-sm text-gray-600 " },
        { value: category.sortOrder, className: "text-center " },
        {
          value: (
            <div className="text-center">
              <span
                className={`status-badge ${
                  category.isActive ? "active" : "inactive"
                }`}
              >
                {category.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ),
          className: "",
        },
        { value: formatDate(category.createdAt), className: "" },
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
          ),
          className: "text-center ",
        },
      ],
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
            onClick={() => navigate("/categories/add")}
          >
            Add Category
          </Button>
        </div>
      </div>

      <Card>
        <Table
          header={getTableHeaders()}
          row={getTableRows()}
          onSort={(key, direction) => {
            setShortBy({ key, direction });
            console.log("{ key, direction }", { key, direction });
            setPagination((prev) => ({ ...prev, currentPage: 0 }));
          }}
          loader={loading}
          defaultSort={shortBy}
          searchable={true}
          onSearch={(value) => {
            setSearchTerm(value);
            setPagination((prev) => ({ ...prev, currentPage: 0 }));
          }}
          paginationOption={pagination}
          onPaginationChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
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
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryList;
