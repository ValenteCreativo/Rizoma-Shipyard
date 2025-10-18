import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import idl from "./idl.json";
import "./App.css";

const { SystemProgram } = web3;

const LOGO_URL = "https://red-causal-armadillo-397.mypinata.cloud/ipfs/bafkreigesbrkhbaaqpcww5rwymw7bidryvjeofa7phqcgg5y23nair5yim";

export default function App() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [records, setRecords] = useState([]);

  const getProvider = () => new AnchorProvider(connection, wallet, {});
  const getProgram = () => new Program(idl, getProvider());

  const fetchRecords = async () => {
    try {
      const program = getProgram();
      const accounts = await program.account.record.all();
      setRecords(accounts);
    } catch (err) {
      console.error("fetchRecords:", err);
    }
  };

  useEffect(() => {
    if (wallet.connected) {
      fetchRecords();
    }
  }, [wallet.connected]);

  const storeMessage = async () => {
    try {
      if (!wallet.publicKey) {
        setStatus("Por favor conecta tu wallet");
        return;
      }
      if (!message.trim()) {
        setStatus("El mensaje no puede estar vacío");
        return;
      }
      
      setStatus("Procesando transacción...");

      const program = getProgram();
      const recordKeypair = web3.Keypair.generate();

      await program.methods
        .storeMessage(message)
        .accounts({
          record: recordKeypair.publicKey,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([recordKeypair])
        .rpc();

      setStatus("Registro guardado exitosamente en blockchain");
      setMessage("");
      await fetchRecords();
      
      setTimeout(() => setStatus(""), 5000);
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message || "No se pudo completar la transacción"}`);
    }
  };

  return (
    <div className="app-container">
      
      {/* HEADER / NAVBAR */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src={LOGO_URL} alt="Rizoma" />
            <span className="logo-text">Rizoma</span>
          </div>
          <nav className="navbar-links">
            <a href="#problema">Problema</a>
            <a href="#como-funciona">Cómo Funciona</a>
            <a href="#demo">Demo</a>
          </nav>
          <div className="navbar-wallet">
            <WalletMultiButton />
          </div>
        </div>
      </header>

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
            <div className="video-placeholder">
              <div className="video-icon">▶</div>
              <p>Video demostrativo del sistema</p>
            </div>
          </div>

          <a href="#demo" className="cta-button">
            Comenzar ahora
            <span className="button-arrow">→</span>
          </a>
          
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

      {/* DEMO SECTION */}
      <section id="demo" className="login-section">
        <div className="section-header">
          <div className="section-tag centered">Tecnología</div>
          <h2>Prueba el sistema de validación</h2>
          <p className="section-subtitle">
            Demo funcional del registro descentralizado. Conecta tu wallet de Solana 
            para almacenar información verificable en blockchain.
          </p>
        </div>

        {!wallet.connected ? (
          <div className="connect-prompt">
            <div className="connect-icon">🔐</div>
            <h3>Conecta tu wallet</h3>
            <p>Usa Phantom, Solflare o cualquier wallet compatible con Solana</p>
            <div className="wallet-row">
              <WalletMultiButton />
            </div>
          </div>
        ) : (
          <div className="demo-container">
            <div className="demo-header">
              <h3>Registro de validación</h3>
              <div className="wallet-badge">
                <span className="wallet-icon">👤</span>
                <span className="wallet-address">
                  {wallet.publicKey.toBase58().slice(0, 4)}...
                  {wallet.publicKey.toBase58().slice(-4)}
                </span>
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="message-input">Información a registrar</label>
              <textarea
                id="message-input"
                placeholder="Ej: Certificación orgánica del productor Juan Pérez, SAGARPA-2024-001, válido hasta 2025..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
              />
            </div>
            
            <button 
              onClick={storeMessage} 
              className="submit-button"
              disabled={!message.trim()}
            >
              <span className="button-icon">⛓</span>
              Guardar en blockchain
            </button>
            
            {status && (
              <div className={`status ${status.includes("Error") ? "error" : "success"}`}>
                {status}
              </div>
            )}

            {records.length > 0 && (
              <div className="records-list">
                <h3>Registros verificados ({records.length})</h3>
                <div className="records-grid">
                  {records.map((r, index) => (
                    <div key={r.publicKey.toBase58()} className="record-item">
                      <div className="record-header">
                        <span className="record-badge">Registro #{index + 1}</span>
                        <span className="record-date">Verificado ✓</span>
                      </div>
                      <div className="record-user">
                        <span className="label">Wallet:</span>
                        <code>{r.account.user.toBase58().slice(0, 16)}...</code>
                      </div>
                      <div className="record-text">{r.account.text}</div>
                      <div className="record-footer">
                        <a 
                          href={`https://explorer.solana.com/address/${r.publicKey.toBase58()}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="explorer-link"
                        >
                          Ver en explorer →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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