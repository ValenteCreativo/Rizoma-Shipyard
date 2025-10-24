import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

export default function ProviderDashboard() {
  const wallet = useWallet();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    unit: "kg",
    price_per_unit: "",
    minimum_order: "",
    available_quantity: "",
    harvest_season: "",
    origin_region: "",
    certifications: [],
  });

  useEffect(() => {
    if (wallet.connected) {
      loadProviderData();
    } else {
      navigate('/');
    }
  }, [wallet.connected]);

  const loadProviderData = async () => {
    try {
      setLoading(true);

      // Load provider
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('wallet_address', wallet.publicKey.toBase58())
        .single();

      if (providerError) {
        if (providerError.code === 'PGRST116') {
          // Provider not found - redirect to onboarding
          navigate('/onboarding');
          return;
        }
        throw providerError;
      }

      setProvider(providerData);

      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);

      // Load reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setReviews(reviewsData || []);

    } catch (error) {
      console.error('Error loading provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        provider_id: provider.id,
        ...productForm,
        price_per_unit: parseFloat(productForm.price_per_unit),
        minimum_order: parseFloat(productForm.minimum_order),
        available_quantity: parseFloat(productForm.available_quantity),
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      loadProviderData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar producto');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      category: "",
      unit: "kg",
      price_per_unit: "",
      minimum_order: "",
      available_quantity: "",
      harvest_season: "",
      origin_region: "",
      certifications: [],
    });
  };

  const editProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      unit: product.unit,
      price_per_unit: product.price_per_unit.toString(),
      minimum_order: product.minimum_order?.toString() || "",
      available_quantity: product.available_quantity?.toString() || "",
      harvest_season: product.harvest_season || "",
      origin_region: product.origin_region || "",
      certifications: product.certifications || [],
    });
    setShowProductModal(true);
  };

  const deleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      loadProviderData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="provider-info-header">
            {provider.logo_url ? (
              <img src={provider.logo_url} alt={provider.company_name} className="provider-avatar" />
            ) : (
              <div className="provider-avatar-placeholder">
                {provider.company_name.charAt(0)}
              </div>
            )}
            <div>
              <h1>{provider.company_name}</h1>
              <p>{provider.city}, {provider.state}</p>
            </div>
          </div>

          <div className="status-badge" data-status={provider.verification_status}>
            {provider.verification_status === 'verified' && '✓ Verificado'}
            {provider.verification_status === 'pending' && '⏳ En revisión'}
            {provider.verification_status === 'in_review' && '🔍 En proceso'}
            {provider.verification_status === 'rejected' && '✕ Rechazado'}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{provider.reputation_score?.toFixed(1) || '0.0'}</div>
            <div className="stat-label">Calificación</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{provider.total_transactions || 0}</div>
            <div className="stat-label">Transacciones</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <div className="stat-value">{products.length}</div>
            <div className="stat-label">Productos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-value">{reviews.length}</div>
            <div className="stat-label">Reseñas</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Vista General
        </button>
        <button
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Productos
        </button>
        <button
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reseñas
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Configuración
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-card">
              <h3>Información de la Empresa</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Razón Social:</span>
                  <span className="info-value">{provider.legal_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">RFC:</span>
                  <span className="info-value">{provider.tax_id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{provider.email}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Teléfono:</span>
                  <span className="info-value">{provider.phone || 'No especificado'}</span>
                </div>
                <div className="info-item full-width">
                  <span className="info-label">Descripción:</span>
                  <span className="info-value">{provider.description}</span>
                </div>
                {provider.blockchain_hash && (
                  <div className="info-item full-width">
                    <span className="info-label">Blockchain Hash:</span>
                    <span className="info-value blockchain-hash">{provider.blockchain_hash}</span>
                  </div>
                )}
              </div>
            </div>

            {reviews.length > 0 && (
              <div className="info-card">
                <h3>Reseñas Recientes</h3>
                <div className="reviews-list">
                  {reviews.slice(0, 5).map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="review-rating">
                          {'⭐'.repeat(Math.round(review.rating))}
                        </div>
                        <div className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {review.review_text && (
                        <p className="review-text">{review.review_text}</p>
                      )}
                      <div className="review-buyer">
                        {review.buyer_wallet.slice(0, 8)}...{review.buyer_wallet.slice(-4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="products-tab">
            <div className="tab-header">
              <h3>Tus Productos ({products.length})</h3>
              <button
                className="add-product-btn"
                onClick={() => {
                  resetProductForm();
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
              >
                + Agregar Producto
              </button>
            </div>

            {products.length === 0 ? (
              <div className="empty-products">
                <div className="empty-icon">📦</div>
                <p>Aún no has agregado productos</p>
                <button className="cta-button" onClick={() => setShowProductModal(true)}>
                  Agregar tu primer producto
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-header">
                      <h4>{product.name}</h4>
                      <div className="product-actions">
                        <button onClick={() => editProduct(product)}>✏️</button>
                        <button onClick={() => deleteProduct(product.id)}>🗑️</button>
                      </div>
                    </div>
                    <p className="product-description">{product.description}</p>
                    <div className="product-details">
                      <div className="detail-item">
                        <span className="detail-label">Categoría:</span>
                        <span>{product.category}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Precio:</span>
                        <span className="price">${product.price_per_unit} USD/{product.unit}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Disponible:</span>
                        <span>{product.available_quantity || 0} {product.unit}</span>
                      </div>
                      {product.certifications && product.certifications.length > 0 && (
                        <div className="detail-item full">
                          <span className="detail-label">Certificaciones:</span>
                          <div className="certifications">
                            {product.certifications.map((cert, i) => (
                              <span key={i} className="cert-badge">{cert}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="reviews-tab">
            <h3>Todas las Reseñas ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <div className="empty-state">
                <p>Aún no tienes reseñas</p>
              </div>
            ) : (
              <div className="reviews-full-list">
                {reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="review-rating">
                        {'⭐'.repeat(Math.round(review.rating))} {review.rating.toFixed(1)}
                      </div>
                      <div className="review-date">
                        {new Date(review.created_at).toLocaleDateString('es-MX')}
                      </div>
                    </div>
                    {review.review_text && (
                      <p className="review-text">{review.review_text}</p>
                    )}
                    <div className="review-footer">
                      <span className="review-buyer">
                        {review.buyer_wallet.slice(0, 12)}...{review.buyer_wallet.slice(-8)}
                      </span>
                      {review.is_verified && (
                        <span className="verified-review">✓ Verificado</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="info-card">
              <h3>Configuración del Perfil</h3>
              <p>Actualiza tu información de contacto y preferencias (próximamente)</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="close-btn" onClick={() => setShowProductModal(false)}>✕</button>
            </div>

            <form onSubmit={handleProductSubmit} className="product-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Descripción</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Categoría *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Avocado">Aguacate</option>
                    <option value="Coffee">Café</option>
                    <option value="Fruits">Frutas</option>
                    <option value="Vegetables">Vegetales</option>
                    <option value="Grains">Granos</option>
                    <option value="Berries">Berries</option>
                    <option value="Citrus">Cítricos</option>
                    <option value="Spices">Especias</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Unidad *</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                  >
                    <option value="kg">Kilogramo</option>
                    <option value="ton">Tonelada</option>
                    <option value="liter">Litro</option>
                    <option value="unit">Unidad</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Precio por Unidad (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price_per_unit}
                    onChange={(e) => setProductForm({...productForm, price_per_unit: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Pedido Mínimo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.minimum_order}
                    onChange={(e) => setProductForm({...productForm, minimum_order: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Cantidad Disponible</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.available_quantity}
                    onChange={(e) => setProductForm({...productForm, available_quantity: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Temporada de Cosecha</label>
                  <input
                    type="text"
                    value={productForm.harvest_season}
                    onChange={(e) => setProductForm({...productForm, harvest_season: e.target.value})}
                    placeholder="Ej: Todo el año"
                  />
                </div>

                <div className="form-group">
                  <label>Región de Origen</label>
                  <input
                    type="text"
                    value={productForm.origin_region}
                    onChange={(e) => setProductForm({...productForm, origin_region: e.target.value})}
                    placeholder="Ej: Michoacán"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowProductModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
