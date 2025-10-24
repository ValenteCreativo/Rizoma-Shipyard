import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "../lib/supabase";
import "../styles/ProviderProfile.css";

export default function ProviderProfile() {
  const { providerId } = useParams();
  const wallet = useWallet();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    productInterest: "",
  });

  useEffect(() => {
    loadProviderData();
  }, [providerId]);

  const loadProviderData = async () => {
    try {
      setLoading(true);

      // Load provider
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (providerError) throw providerError;
      setProvider(providerData);

      // Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('provider_id', providerId)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      setProducts(productsData || []);

      // Load reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      setReviews(reviewsData || []);

      // Mock photos for now - in production these would come from a photos table
      setPhotos([
        { id: 1, url: "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800", caption: "Nuestros campos de aguacate" },
        { id: 2, url: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800", caption: "Cosecha de temporada" },
        { id: 3, url: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800", caption: "Proceso de selección" },
        { id: 4, url: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800", caption: "Empaque y distribución" },
      ]);

    } catch (error) {
      console.error('Error loading provider:', error);
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    // In production, this would send an email or create a message record
    alert('Mensaje enviado! El proveedor se pondrá en contacto contigo pronto.');
    setShowContactModal(false);
    setContactForm({ name: "", email: "", company: "", message: "", productInterest: "" });
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  if (loading) {
    return (
      <div className="provider-profile-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando información del proveedor...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="provider-profile-container">
        <div className="empty-state">
          <h2>Proveedor no encontrado</h2>
          <Link to="/marketplace" className="back-link">← Volver al Marketplace</Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + parseFloat(r.rating), 0) / reviews.length).toFixed(1)
    : provider.reputation_score?.toFixed(1) || '0.0';

  return (
    <div className="provider-profile-container">
      {/* Cover Image */}
      <div className="profile-cover">
        <img
          src={provider.cover_image_url || "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1600"}
          alt="Cover"
          className="cover-image"
        />
        <div className="cover-overlay"></div>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar-section">
            {provider.logo_url ? (
              <img src={provider.logo_url} alt={provider.company_name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {provider.company_name.charAt(0)}
              </div>
            )}

            <div className="profile-info">
              <div className="profile-title-row">
                <h1>{provider.company_name}</h1>
                {provider.verification_status === 'verified' && (
                  <div className="verified-badge-large">
                    <span className="verified-icon">✓</span>
                    Verificado en Blockchain
                  </div>
                )}
              </div>

              <div className="profile-meta">
                <span className="meta-item">
                  📍 {provider.city}, {provider.state}
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-item">
                  ⭐ {averageRating} ({reviews.length} reseñas)
                </span>
                <span className="meta-separator">•</span>
                <span className="meta-item">
                  📦 {provider.total_transactions || 0} transacciones
                </span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="contact-btn primary" onClick={() => setShowContactModal(true)}>
              📧 Contactar Proveedor
            </button>
            <button className="contact-btn secondary">
              🔖 Guardar
            </button>
            <button className="contact-btn secondary">
              📤 Compartir
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="quick-stats">
        <div className="stat-box">
          <div className="stat-icon">🌱</div>
          <div className="stat-content">
            <div className="stat-number">{products.length}</div>
            <div className="stat-label">Productos</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">{averageRating}</div>
            <div className="stat-label">Calificación</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">100%</div>
            <div className="stat-label">Verificación</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-number">{new Date().getFullYear() - new Date(provider.created_at).getFullYear() || '<1'}</div>
            <div className="stat-label">Años en plataforma</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          Acerca de
        </button>
        <button
          className={`profile-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Productos ({products.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Galería ({photos.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reseñas ({reviews.length})
        </button>
        <button
          className={`profile-tab ${activeTab === 'certifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('certifications')}
        >
          Certificaciones
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        <div className="content-main">
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="about-section">
              <div className="section-card">
                <h2>Nuestra Historia</h2>
                <p className="description">{provider.description}</p>

                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-icon">🏢</span>
                    <div>
                      <div className="info-label">Razón Social</div>
                      <div className="info-value">{provider.legal_name}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-icon">📍</span>
                    <div>
                      <div className="info-label">Ubicación</div>
                      <div className="info-value">{provider.address || `${provider.city}, ${provider.state}, ${provider.country}`}</div>
                    </div>
                  </div>

                  <div className="info-item">
                    <span className="info-icon">📧</span>
                    <div>
                      <div className="info-label">Email</div>
                      <div className="info-value">{provider.email}</div>
                    </div>
                  </div>

                  {provider.phone && (
                    <div className="info-item">
                      <span className="info-icon">📞</span>
                      <div>
                        <div className="info-label">Teléfono</div>
                        <div className="info-value">{provider.phone}</div>
                      </div>
                    </div>
                  )}

                  {provider.website && (
                    <div className="info-item">
                      <span className="info-icon">🌐</span>
                      <div>
                        <div className="info-label">Sitio Web</div>
                        <div className="info-value">
                          <a href={provider.website} target="_blank" rel="noopener noreferrer">
                            {provider.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline/Milestones */}
              <div className="section-card">
                <h2>📅 Hitos y Logros</h2>
                <div className="timeline">
                  <div className="timeline-item">
                    <div className="timeline-date">2024</div>
                    <div className="timeline-content">
                      <h4>Verificación Blockchain Completada</h4>
                      <p>Nos convertimos en uno de los primeros productores verificados en la plataforma Rizoma</p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-date">2023</div>
                    <div className="timeline-content">
                      <h4>Certificación Orgánica USDA</h4>
                      <p>Obtuvimos la certificación orgánica para todos nuestros cultivos principales</p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-date">2020</div>
                    <div className="timeline-content">
                      <h4>Expansión de Operaciones</h4>
                      <p>Duplicamos nuestra capacidad de producción y exportación</p>
                    </div>
                  </div>

                  <div className="timeline-item">
                    <div className="timeline-date">2015</div>
                    <div className="timeline-content">
                      <h4>Fundación de la Empresa</h4>
                      <p>Comenzamos nuestra misión de conectar productos mexicanos con el mundo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="products-section">
              {products.length === 0 ? (
                <div className="empty-section">
                  <p>Este proveedor aún no ha agregado productos</p>
                </div>
              ) : (
                <div className="products-showcase">
                  {products.map(product => (
                    <div key={product.id} className="product-showcase-card">
                      <div className="product-image-placeholder">
                        <span className="product-category-badge">{product.category}</span>
                        🌱
                      </div>

                      <div className="product-showcase-content">
                        <h3>{product.name}</h3>
                        <p className="product-description">{product.description}</p>

                        <div className="product-details-grid">
                          <div className="detail">
                            <span className="detail-label">Precio</span>
                            <span className="detail-value price">${product.price_per_unit} USD/{product.unit}</span>
                          </div>

                          <div className="detail">
                            <span className="detail-label">Disponible</span>
                            <span className="detail-value">{product.available_quantity || 0} {product.unit}</span>
                          </div>

                          {product.minimum_order && (
                            <div className="detail">
                              <span className="detail-label">Pedido mínimo</span>
                              <span className="detail-value">{product.minimum_order} {product.unit}</span>
                            </div>
                          )}

                          {product.harvest_season && (
                            <div className="detail">
                              <span className="detail-label">Temporada</span>
                              <span className="detail-value">{product.harvest_season}</span>
                            </div>
                          )}
                        </div>

                        {product.certifications && product.certifications.length > 0 && (
                          <div className="product-certifications">
                            {product.certifications.map((cert, i) => (
                              <span key={i} className="certification-badge">{cert}</span>
                            ))}
                          </div>
                        )}

                        <button className="inquire-btn" onClick={() => {
                          setContactForm({ ...contactForm, productInterest: product.name });
                          setShowContactModal(true);
                        }}>
                          Solicitar Cotización
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="gallery-section">
              <div className="gallery-grid">
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    className="gallery-item"
                    onClick={() => openPhotoModal(photo)}
                  >
                    <img src={photo.url} alt={photo.caption} />
                    <div className="gallery-overlay">
                      <p>{photo.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="reviews-section">
              <div className="reviews-summary">
                <div className="rating-overview">
                  <div className="rating-number">{averageRating}</div>
                  <div className="rating-stars">
                    {'⭐'.repeat(Math.round(parseFloat(averageRating)))}
                  </div>
                  <div className="rating-count">Basado en {reviews.length} reseñas</div>
                </div>

                <div className="rating-distribution">
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length * 100).toFixed(0) : 0;
                    return (
                      <div key={stars} className="rating-bar">
                        <span className="stars-label">{stars} ⭐</span>
                        <div className="bar-container">
                          <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="bar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="reviews-list-full">
                {reviews.length === 0 ? (
                  <div className="empty-section">
                    <p>Este proveedor aún no tiene reseñas</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="review-card-full">
                      <div className="review-header">
                        <div className="review-author">
                          <div className="author-avatar">
                            {review.buyer_wallet.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="author-name">
                              {review.buyer_wallet.slice(0, 8)}...{review.buyer_wallet.slice(-4)}
                            </div>
                            <div className="review-date">
                              {new Date(review.created_at).toLocaleDateString('es-MX', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="review-rating-stars">
                          {'⭐'.repeat(Math.round(review.rating))}
                        </div>
                      </div>

                      {review.review_text && (
                        <p className="review-text">{review.review_text}</p>
                      )}

                      {review.is_verified && (
                        <div className="verified-purchase">✓ Compra verificada</div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Certifications Tab */}
          {activeTab === 'certifications' && (
            <div className="certifications-section">
              <div className="section-card">
                <h2>🏆 Certificaciones y Reconocimientos</h2>

                <div className="certifications-grid">
                  <div className="certification-card">
                    <div className="cert-icon">✓</div>
                    <h4>Verificación Blockchain</h4>
                    <p>Documentación verificada en Solana blockchain</p>
                    {provider.blockchain_hash && (
                      <div className="blockchain-proof">
                        <small>Hash: {provider.blockchain_hash.slice(0, 16)}...</small>
                        <a
                          href={`https://explorer.solana.com/tx/${provider.blockchain_hash}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Ver en Explorer →
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Extract certifications from products */}
                  {Array.from(new Set(products.flatMap(p => p.certifications || []))).map((cert, i) => (
                    <div key={i} className="certification-card">
                      <div className="cert-icon">🌟</div>
                      <h4>{cert}</h4>
                      <p>Certificación validada</p>
                    </div>
                  ))}

                  <div className="certification-card">
                    <div className="cert-icon">🔐</div>
                    <h4>KYC/KYB Completo</h4>
                    <p>Identidad y documentación empresarial verificada</p>
                  </div>

                  <div className="certification-card">
                    <div className="cert-icon">🇲🇽</div>
                    <h4>Productor Mexicano Certificado</h4>
                    <p>Origen verificado</p>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <h2>📊 Transparencia y Verificación</h2>
                <div className="transparency-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Documentos verificados</span>
                    <span className="metric-value">✓ Completo</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Estado de verificación</span>
                    <span className="metric-value verified">Verificado</span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Última actualización</span>
                    <span className="metric-value">
                      {new Date(provider.updated_at).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="content-sidebar">
          <div className="sidebar-card">
            <h3>🤝 ¿Por qué elegirnos?</h3>
            <ul className="benefits-list">
              <li>✓ Verificación blockchain completa</li>
              <li>✓ Certificaciones internacionales</li>
              <li>✓ Trazabilidad total</li>
              <li>✓ Calidad garantizada</li>
              <li>✓ Entrega confiable</li>
              <li>✓ Soporte dedicado</li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h3>📞 Contacto Directo</h3>
            <button className="sidebar-cta" onClick={() => setShowContactModal(true)}>
              Enviar Mensaje
            </button>
            <p className="sidebar-note">
              Respuesta promedio: <strong>24 horas</strong>
            </p>
          </div>

          <div className="sidebar-card trust-signals">
            <h3>🔐 Confianza y Seguridad</h3>
            <div className="trust-item">
              <span className="trust-icon">⛓</span>
              <span>Blockchain Verificado</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">🛡️</span>
              <span>Documentos Validados</span>
            </div>
            <div className="trust-item">
              <span className="trust-icon">⭐</span>
              <span>{averageRating}/5.0 Calificación</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contactar a {provider.company_name}</h2>
              <button className="close-btn" onClick={() => setShowContactModal(false)}>✕</button>
            </div>

            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-group">
                <label>Nombre Completo *</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Empresa</label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Producto de Interés</label>
                <select
                  value={contactForm.productInterest}
                  onChange={(e) => setContactForm({ ...contactForm, productInterest: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mensaje *</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  rows={5}
                  placeholder="Describe tu consulta, cantidad requerida, y cualquier otra información relevante..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowContactModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="submit-btn">
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Modal */}
      {showPhotoModal && selectedPhoto && (
        <div className="photo-modal-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="photo-modal-content">
            <button className="photo-modal-close" onClick={() => setShowPhotoModal(false)}>✕</button>
            <img src={selectedPhoto.url} alt={selectedPhoto.caption} />
            <p className="photo-caption">{selectedPhoto.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
