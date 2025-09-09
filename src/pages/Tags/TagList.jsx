import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Table, Button, Card, Modal } from "../../components/common";
import { formatDate } from "../../utils/helpers";
import "./Tags.css";
import { useDispatch } from "react-redux";
import api from "../../services/api";
import { handelCatch, throwError } from "../../store/globalSlice";

const TagList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, tag: null });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 10,
    count: 0,
  });

  // Mock data
  const mockTags = [
    {
      _id: "1",
      name: "Modern",
      desc: "Modern style artwork",
      value: "modern",
      isActive: true,
      createdAt: "2024-01-15T10:30:00Z",
    },
    {
      _id: "2",
      name: "Abstract",
      desc: "Abstract art pieces",
      value: "abstract",
      isActive: true,
      createdAt: "2024-01-14T09:15:00Z",
    },
    {
      _id: "3",
      name: "Minimalist",
      desc: "Clean and simple designs",
      value: "minimalist",
      isActive: true,
      createdAt: "2024-01-13T14:45:00Z",
    },
    {
      _id: "4",
      name: "Colorful",
      desc: "Vibrant and colorful artwork",
      value: "colorful",
      isActive: false,
      createdAt: "2024-01-12T11:20:00Z",
    },
  ];

  useEffect(() => {
    loadTags();
  }, [pagination.currentPage]);

  const loadTags = async () => {
    setLoading(true);
    try {
      // await new Promise((resolve) => setTimeout(resolve, 800));
      const res = await api.get("/tags/getAllTags");
      console.log("res", res);
      if (res.status !== 200) {
        dispatch(
          throwError(
            res?.data?.message || "Failed to load tags. Please try again."
          )
        );
        return;
      }

      setTags(res?.data?.response || []);
      setPagination((prev) => ({
        ...prev,
        count: res?.data?.response.length || 0,
      }));
    } catch (error) {
      console.error("Error loading tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagId) => {
    try {
      const res = await api.delete(`/tags/${tagId}`);
      if (res.status !== 200) {
        dispatch(
          throwError(
            res?.data?.message || "Failed to delete tag. Please try again."
          )
        );
        return;
      }
      loadTags();
      setDeleteModal({ isOpen: false, tag: null });
      dispatch(showSuccess("Tag deleted successfully."));
    } catch (error) {
      console.error("Error deleting tag:", error);
      dispatch(handelCatch("Failed to delete tag. Please try again."));
    }
  };

  const getTableHeaders = () => [
    { title: "Name", className: "w-200", isSort: true, key: "name" },
    { title: "Description", className: "w-300", isSort: false },
    { title: "Value", className: "w-150", isSort: true, key: "value" },
    {
      title: "Status",
      className: "w-100 text-center",
      isSort: true,
      key: "isActive",
    },
    { title: "Created", className: "w-150", isSort: true, key: "createdAt" },
    { title: "Actions", className: "w-150 text-center" },
  ];

  const getTableRows = () => {
    return tags.map((tag) => ({
      data: [
        { value: tag.name, className: "font-medium" },
        { value: tag.desc || "-" },
        { value: tag.value, className: "text-sm text-gray-600" },
        {
          value: (
            <div className="text-center">
              <span
                className={`status-badge ${
                  tag.isActive ? "active" : "inactive"
                }`}
              >
                {tag.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ),
        },
        { value: formatDate(tag.createdAt) },
        {
          value: (
            <div className="action-buttons">
              <Button
                variant="ghost"
                size="small"
                startIcon={<Edit size={14} />}
                onClick={() => navigate(`/tags/edit/${tag._id}`)}
              />
              <Button
                variant="ghost"
                size="small"
                startIcon={<Trash2 size={14} />}
                onClick={() => setDeleteModal({ isOpen: true, tag })}
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
          <h1 className="page-title">Tags</h1>
          <p className="page-subtitle">Manage product tags</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            startIcon={<Plus size={18} />}
            onClick={() => navigate("/tags/add")}
          >
            Add Tag
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
          onPaginationChange={(page) =>
            setPagination((prev) => ({ ...prev, currentPage: page }))
          }
          min="900px"
        />
      </Card>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, tag: null })}
        title="Delete Tag"
        size="small"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteModal({ isOpen: false, tag: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleDeleteTag(deleteModal.tag?._id)}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="modal-confirm">
          <p>Are you sure you want to delete "{deleteModal.tag?.name}"?</p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default TagList;
