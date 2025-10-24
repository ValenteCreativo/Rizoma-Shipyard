import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import "../styles/Marketplace.css";

export default function Marketplace() {
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [sortBy, setSortBy] = useState("reputation");

  useEffect(() => {
    fetchProviders();
    fetchCategories();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);

      // Fetch verified providers with their products count
      const { data, error } = await supabase
        .from('providers')
        .select(`
          *,
          products(count)
        `)
        .eq('verification_status', 'verified')
        .eq('is_active', true);

      if (error) throw error;

      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProviders = providers
    .filter(provider => {
      const matchesSearch = provider.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = selectedState === "all" || provider.state === selectedState;
      // Category filtering would need to check provider's products
      return matchesSearch && matchesState;
    })
    .sort((a, b) => {
      if (sortBy === "reputation") {
        return (b.reputation_score || 0) - (a.reputation_score || 0);
      } else if (sortBy === "transactions") {
        return (b.total_transactions || 0) - (a.total_transactions || 0);
      } else if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

  const uniqueStates = [...new Set(providers.map(p => p.state).filter(Boolean))];

  return (
    <div className="marketplace-container">
      {/* Hero Section */}
      <section className="marketplace-hero">
        <div className="hero-content">
          <h1>Marketplace de Agroproductores Verificados</h1>
          <p>
            Conecta directamente con productores certificados en México.
            Cada proveedor está verificado en blockchain.
          </p>

          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar productos, empresas, regiones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="marketplace-stats">
            <div className="stat-card">
              <div className="stat-number">{providers.length}</div>
              <div className="stat-label">Proveedores Verificados</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{categories.length}</div>
              <div className="stat-label">Categorías de Productos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Verificación Blockchain</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filter-group">
            <label>Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Estado</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="reputation">Mayor reputación</option>
              <option value="transactions">Más transacciones</option>
              <option value="newest">Más recientes</option>
            </select>
          </div>
        </div>
      </section>

      {/* Providers Grid */}
      <section className="providers-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando proveedores verificados...</p>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No se encontraron proveedores</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="providers-grid">
            {filteredProviders.map(provider => (
              <Link
                key={provider.id}
                to={`/provider/${provider.id}`}
                className="provider-card"
              >
                <div className="provider-header">
                  {provider.logo_url ? (
                    <img src={provider.logo_url} alt={provider.company_name} className="provider-logo" />
                  ) : (
                    <div className="provider-logo-placeholder">
                      {provider.company_name.charAt(0)}
                    </div>
                  )}
                  <div className="verification-badge">
                    <span className="verified-icon">✓</span>
                    Verificado
                  </div>
                </div>

                <div className="provider-info">
                  <h3>{provider.company_name}</h3>
                  <p className="provider-location">
                    📍 {provider.city}, {provider.state}
                  </p>
                  <p className="provider-description">
                    {provider.description?.substring(0, 120)}
                    {provider.description?.length > 120 ? '...' : ''}
                  </p>
                </div>

                <div className="provider-metrics">
                  <div className="metric">
                    <span className="metric-icon">⭐</span>
                    <span className="metric-value">
                      {provider.reputation_score?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-icon">📦</span>
                    <span className="metric-value">
                      {provider.total_transactions || 0} ventas
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-icon">⛓</span>
                    <span className="metric-label">Blockchain</span>
                  </div>
                </div>

                <div className="provider-footer">
                  <span className="view-profile-btn">
                    Ver perfil →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2>Explora por Categoría</h2>
        <div className="categories-grid">
          {categories.slice(0, 6).map(category => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => setSelectedCategory(category.slug)}
            >
              <div className="category-icon">{category.icon || '🌱'}</div>
              <h4>{category.name}</h4>
              <p>{category.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Eres productor agrícola?</h2>
          <p>
            Únete a la red de proveedores verificados y accede a compradores internacionales
          </p>
          <Link to="/onboarding" className="cta-button">
            Registrarse como Proveedor →
          </Link>
        </div>
      </section>
    </div>
  );
}
