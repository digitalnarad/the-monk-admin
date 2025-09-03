import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  FolderOpen, 
  Tags, 
  TrendingUp, 
  Users,
  Eye,
  Plus
} from 'lucide-react';
import { Card, Button } from '../../components/common';
import { formatCurrency } from '../../utils/helpers';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        totalProducts: 156,
        totalCategories: 12,
        totalTags: 28,
        totalRevenue: 45678.90,
        recentProducts: [
          { id: 1, name: 'Modern Art Canvas', category: 'Wall Art', price: 299.99 },
          { id: 2, name: 'Abstract Painting', category: 'Paintings', price: 459.99 },
          { id: 3, name: 'Minimalist Print', category: 'Prints', price: 149.99 }
        ]
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'blue',
      action: () => navigate('/products')
    },
    {
      title: 'Categories',
      value: stats?.totalCategories || 0,
      icon: FolderOpen,
      color: 'green',
      action: () => navigate('/categories')
    },
    {
      title: 'Tags',
      value: stats?.totalTags || 0,
      icon: Tags,
      color: 'purple',
      action: () => navigate('/tags')
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: TrendingUp,
      color: 'orange',
      action: () => navigate('/reports')
    }
  ];

  if (loading) {
    return (
      <div className="page-loading">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to Monk Lab Admin Panel</p>
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

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className={`stat-card stat-card-${stat.color}`}>
              <div className="stat-card-content">
                <div className="stat-card-header">
                  <div className="stat-card-icon">
                    <IconComponent size={24} />
                  </div>
                  <Button
                    variant="ghost"
                    size="small"
                    startIcon={<Eye size={14} />}
                    onClick={stat.action}
                  />
                </div>
                <div className="stat-card-body">
                  <div className="stat-card-value">{stat.value}</div>
                  <div className="stat-card-title">{stat.title}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-grid">
        <Card 
          title="Recent Products" 
          headerAction={
            <Button
              variant="ghost"
              size="small"
              onClick={() => navigate('/products')}
            >
              View All
            </Button>
          }
          className="recent-products-card"
        >
          <div className="recent-products-list">
            {stats?.recentProducts?.map((product) => (
              <div key={product.id} className="recent-product-item">
                <div className="recent-product-info">
                  <div className="recent-product-name">{product.name}</div>
                  <div className="recent-product-category">{product.category}</div>
                </div>
                <div className="recent-product-price">
                  {formatCurrency(product.price)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card 
          title="Quick Actions" 
          className="quick-actions-card"
        >
          <div className="quick-actions-grid">
            <Button
              variant="outline"
              fullWidth
              startIcon={<Package size={18} />}
              onClick={() => navigate('/products/add')}
            >
              Add Product
            </Button>
            <Button
              variant="outline"
              fullWidth
              startIcon={<FolderOpen size={18} />}
              onClick={() => navigate('/categories/add')}
            >
              Add Category
            </Button>
            <Button
              variant="outline"
              fullWidth
              startIcon={<Tags size={18} />}
              onClick={() => navigate('/tags/add')}
            >
              Add Tag
            </Button>
            <Button
              variant="outline"
              fullWidth
              startIcon={<Users size={18} />}
              onClick={() => navigate('/users')}
            >
              Manage Users
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
