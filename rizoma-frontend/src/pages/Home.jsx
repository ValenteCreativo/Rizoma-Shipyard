import { Link } from "react-router-dom";
import "../App.css";

const LOGO_URL = "https://red-causal-armadillo-397.mypinata.cloud/ipfs/bafkreigesbrkhbaaqpcww5rwymw7bidryvjeofa7phqcgg5y23nair5yim";

export default function Home() {
  return (
    <div className="app-container">
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">🏆</span>
            <span>9 años de experiencia en comercio exterior</span>
          </div>

          <h1>
            Sistema de Validación de <span>Agroproductores</span>
          </h1>

          <p className="subtitle">
            Plataforma blockchain para conectar compradores internacionales con
            proveedores agrícolas verificados en México. Transacciones seguras,
            transparentes y sin intermediarios.
          </p>

          <div className="video-container">
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/uJvcBMOyIN0"
              title="Video demostrativo del sistema"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="hero-actions">
            <Link to="/marketplace" className="cta-button">
              Explorar Marketplace
              <span className="button-arrow">→</span>
            </Link>
            <Link to="/onboarding" className="cta-button secondary">
              Registrarse como Proveedor
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">9+</div>
              <div className="stat-label">Años de experiencia</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Verificación blockchain</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">0</div>
              <div className="stat-label">Intermediarios</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEMA/SOLUCIÓN */}
      <section id="problema" className="problem-solution">
        <div className="content-wrapper">
          <div className="problem">
            <div className="section-tag">Desafío</div>
            <h2>Los retos del comercio agrícola internacional</h2>
            <p>
              Los compradores internacionales de agroproductos mexicanos enfrentan
              obstáculos críticos que afectan la confianza y eficiencia de las transacciones:
            </p>
            <ul>
              <li>Verificación de autenticidad y legitimidad del proveedor</li>
              <li>Garantías de calidad y cumplimiento de especificaciones</li>
              <li>Comisiones elevadas por múltiples intermediarios</li>
              <li>Complejidad en normativas de exportación internacional</li>
              <li>Contratos sin validez legal internacional efectiva</li>
            </ul>
          </div>

          <div className="solution">
            <div className="section-tag">Solución</div>
            <h2>Tecnología blockchain para comercio confiable</h2>
            <p>
              Rizoma implementa un sistema de validación descentralizado que garantiza
              transparencia total en cada etapa de la transacción:
            </p>
            <ul>
              <li>Validación criptográfica de identidad y certificaciones</li>
              <li>Trazabilidad completa de productos y documentación</li>
              <li>Smart contracts con ejecución automática</li>
              <li>Pagos directos con stablecoins (USDC, USDT)</li>
              <li>Auditoría inmutable y transparente</li>
            </ul>
            <div className="highlight">
              <strong>Infraestructura enterprise-grade:</strong> Construido sobre Solana
              para transacciones de alta velocidad y bajo costo. Sistema escalable diseñado
              para el comercio exterior global.
            </div>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="how-it-works">
        <div className="section-header">
          <div className="section-tag centered">Proceso</div>
          <h2>Flujo de validación en 4 pasos</h2>
        </div>

        <div className="steps-container">
          <div className="step">
            <div className="step-number">01</div>
            <h3>Registro y verificación</h3>
            <p>
              Creación de perfil con validación KYC/KYB. Los productores suben
              certificaciones y documentación legal que se almacena en blockchain.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Conexión directa</h3>
            <p>
              Búsqueda inteligente de proveedores verificados según producto,
              región y certificaciones. Acceso a historial completo de transacciones.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>Transacción protegida</h3>
            <p>
              Smart contracts ejecutan automáticamente términos acordados.
              Pagos en escrow con liberación condicionada a cumplimiento.
            </p>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <h3>Entrega verificada</h3>
            <p>
              Confirmación de recepción y calidad. Sistema de reputación
              inmutable que valida a proveedores confiables.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-content">
          <div className="footer-brand">
            <img src={LOGO_URL} alt="Rizoma" className="footer-logo" />
            <h4>Rizoma</h4>
            <p>Sistema de validación descentralizada para agroproductores</p>
          </div>

          <div className="footer-info">
            <p className="footer-tagline">
              Infraestructura blockchain enterprise para comercio exterior
            </p>
            <p className="footer-experience">
              🏆 9 años de experiencia en comercio internacional
            </p>
            <p className="footer-tech">
              ⚡ Powered by Solana · Built with Anchor Framework
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 Rizoma. Sistema de validación descentralizada.</p>
          <p>Parte de la super app para comercio exterior mundial.</p>
        </div>
      </footer>
    </div>
  );
}
