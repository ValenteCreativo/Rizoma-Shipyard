import { Link } from "react-router-dom";
import { useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useAuth } from "../contexts/AuthContext";
import "./Navbar.css";

const LOGO_URL = "https://red-causal-armadillo-397.mypinata.cloud/ipfs/bafkreigesbrkhbaaqpcww5rwymw7bidryvjeofa7phqcgg5y23nair5yim";

export default function Navbar() {
  const { user, profile, signOut, isProvider, isBuyer } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={LOGO_URL} alt="Rizoma" />
          <span className="logo-text">Rizoma</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/">Inicio</Link>
          <Link to="/marketplace">Marketplace</Link>

          {user && (
            <>
              {isProvider && <Link to="/dashboard">Mi Dashboard</Link>}
              {isBuyer && <Link to="/buyer-dashboard">Mis Cotizaciones</Link>}
            </>
          )}
        </nav>

        <div className="navbar-actions">
          {/* Wallet Connection */}
          <div className="navbar-wallet">
            <WalletMultiButton />
          </div>

          {/* Auth Actions */}
          {user ? (
            <div className="user-menu-container">
              <button
                className="user-menu-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {profile?.company_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">
                  {profile?.company_name || user.email.split('@')[0]}
                </span>
                <svg
                  className={`chevron ${showUserMenu ? 'open' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M3 4.5L6 7.5L9 4.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {showUserMenu && (
                <>
                  <div
                    className="user-menu-overlay"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                      <div className="user-menu-email">{user.email}</div>
                      <div className="user-menu-role">
                        {isProvider && '🌱 Productor'}
                        {isBuyer && '🛒 Comprador'}
                      </div>
                    </div>

                    <div className="user-menu-divider" />

                    <Link
                      to={isProvider ? "/dashboard" : "/buyer-dashboard"}
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>📊</span> Dashboard
                    </Link>

                    {isProvider && (
                      <Link
                        to={`/provider/${profile?.id}`}
                        className="user-menu-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>👤</span> Mi Perfil Público
                      </Link>
                    )}

                    {isBuyer && (
                      <>
                        <Link
                          to="/favorites"
                          className="user-menu-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span>❤️</span> Favoritos
                        </Link>
                        <Link
                          to="/rfqs"
                          className="user-menu-item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span>📝</span> Mis Cotizaciones
                        </Link>
                      </>
                    )}

                    <Link
                      to="/settings"
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>⚙️</span> Configuración
                    </Link>

                    <div className="user-menu-divider" />

                    <button
                      className="user-menu-item signout"
                      onClick={handleSignOut}
                    >
                      <span>🚪</span> Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="auth-btn register">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
