import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card } from "../../components/common";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Tag,
  Image as ImageIcon,
  Star,
  Heart,
  ShoppingCart,
} from "lucide-react";
import api from "../../services/api";
import { useDispatch } from "react-redux";
import { handelCatch, throwError } from "../../store/globalSlice";
import { formatCurrency } from "../../utils/helpers";
import { PRODUCT_VARIANTS } from "../../utils/constants";
import "./Products.css";

const RATIO_CLASS = {
  square: "ratio-1-1",
  horizontal: "ratio-3-2",
  vertical: "ratio-2-3",
};

const ProductView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [activeVariant, setActiveVariant] = useState("square");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!product) return;
    const def = product?.defaultVariant || "square";
    setActiveVariant(PRODUCT_VARIANTS.includes(def) ? def : "square");
    // default size preset
    const preset = getSizeOptions(PRODUCT_VARIANTS.includes(def) ? def : "square");
    setSelectedSize(preset[0]?.label || null);
  }, [product]);

  const images = useMemo(() => {
    const imgs = product?.variants?.[activeVariant]?.images || [];
    return Array.isArray(imgs) ? imgs : [];
  }, [product, activeVariant]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [activeVariant]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await api.get(`/products/${id}`);
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          try {
            res = await api.get(`/products/sku/${id}`);
          } catch (err2) {
            throw err2;
          }
        } else {
          throw err;
        }
      }

      if (res.status !== 200) {
        dispatch(
          throwError(
            res?.data?.message || "Failed to fetch product. Please try again."
          )
        );
        navigate("/products");
        return;
      }
      setProduct(res?.data?.response || null);
    } catch (error) {
      dispatch(handelCatch(error));
      navigate("/products");
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prev = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getSizeOptions = (variant) => {
    if (variant === "square") return ["400 x 400", "800 x 800", "1200 x 1200"];
    if (variant === "horizontal") return ["600 x 400", "900 x 600", "1200 x 800"];
    return ["400 x 600", "600 x 900", "800 x 1200"];
  };

  const handleAddToCart = () => {
    // Placeholder: integrate cart API or state
    alert(`Added ${quantity} to cart`);
  };

  const handleBuyNow = () => {
    // Placeholder action
    alert("Proceeding to checkout...");
  };

  return (
    <div className="page-container">
      <div className="page-header flipkart-header">
        <div className="page-header-content">
          <h1 className="page-title">{product?.title || "Product"}</h1>
          <p className="page-subtitle flipkart-sub">{product?.category?.name || ""}</p>
        </div>
        <div className="page-actions">
          <Button
            variant="ghost"
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/products")}
          >
            Back
          </Button>
        </div>
      </div>

      <div className="product-view-grid flipkart-view">
        <Card className="image-panel">
          <div className="image-panel-inner">
            <div className="thumb-column">
              {images.map((img, idx) => (
                <button
                  key={img.public_id || idx}
                  type="button"
                  className={`thumb-vertical ${idx === currentIndex ? "active" : ""}`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <img src={img.url} alt={img.alt || `thumb-${idx + 1}`} />
                </button>
              ))}
            </div>

            <div className={`main-image ${RATIO_CLASS[activeVariant] || "ratio-1-1"}`}>
              {images.length > 0 ? (
                <>
                  <img src={images[currentIndex]?.url} alt={images[currentIndex]?.alt || "main"} />
                  {product?.variants?.[activeVariant]?.isPrimary === images[currentIndex]?.public_id && (
                    <span className="primary-badge"><BadgeCheck size={14} /> Primary</span>
                  )}
                  <button className="carousel-nav prev" onClick={prev} aria-label="Prev"><ChevronLeft size={18} /></button>
                  <button className="carousel-nav next" onClick={next} aria-label="Next"><ChevronRight size={18} /></button>
                </>
              ) : (
                <div className="empty-carousel small">
                  <ImageIcon size={32} />
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="details-panel">
          <div className="details-top">
            <div className="rating-stock">
              <div className="rating">
                <span className="score">{product?.rating || "4.5"}</span>
                <Star size={14} />
                <span className="count">({product?.reviewsCount || 123})</span>
              </div>
              <div className={`stock ${product?.isActive ? "in-stock" : "out-of-stock"}`}>
                {product?.isActive ? "In stock" : "Out of stock"}
              </div>
            </div>

            <div className="price-block">
              <div className="price-row">
                <div className="price-main">{formatCurrency(product?.price)}</div>
                {product?.discount > 0 && (
                  <div className="strike">{formatCurrency((product?.price * (100 + product?.discount)) / 100)}</div>
                )}
              </div>
              <div className="offers">
                <div className="offer-item">Best Price: This is the best price available</div>
              </div>
            </div>

            <div className="selectors">
              <div className="selector-row">
                <label className="selector-label">Variant</label>
                <div className="variant-buttons">
                  {PRODUCT_VARIANTS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`variant-pill ${activeVariant === v ? "active" : ""}`}
                      onClick={() => setActiveVariant(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="selector-row">
                <label className="selector-label">Size</label>
                <select className="select-input" value={selectedSize || ""} onChange={(e) => setSelectedSize(e.target.value)}>
                  {(getSizeOptions(activeVariant) || []).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="selector-row qty-row">
                <label className="selector-label">Quantity</label>
                <div className="qty-control">
                  <button type="button" className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
                  <div className="qty-value">{quantity}</div>
                  <button type="button" className="qty-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="action-row">
              <Button variant="primary" startIcon={<ShoppingCart size={16} />} onClick={handleAddToCart}>Add to cart</Button>
              <Button variant="success" onClick={handleBuyNow}>Buy now</Button>
              <Button variant="outline" startIcon={<Heart size={16} />}>Wishlist</Button>
            </div>

            <div className="seller-info">
              <div>Sold by <strong>{product?.seller?.name || "Default Seller"}</strong></div>
              <div className="seller-meta">{product?.seller?.rating ? `${product.seller.rating}★` : "Trusted seller"}</div>
            </div>
          </div>

          <div className="details-bottom">
            <h3 className="section-title">Product Details</h3>
            <p className="desc-text">{product?.desc || "No description provided."}</p>

            <h4 className="section-title">Specifications</h4>
            <div className="specs-grid">
              <div className="spec-item"><span className="spec-key">SKU</span><span className="spec-val">{product?.skuId || "-"}</span></div>
              <div className="spec-item"><span className="spec-key">Category</span><span className="spec-val">{product?.category?.name || "-"}</span></div>
              <div className="spec-item"><span className="spec-key">Tags</span><span className="spec-val">{(product?.tags || []).map(t=>t?.name||t).join(', ') || '-'}</span></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProductView;
