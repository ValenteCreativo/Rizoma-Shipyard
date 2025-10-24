import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Redirect to the page they tried to visit or home
      navigate(from, { replace: true });
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <h1>Iniciar Sesión</h1>
          <p>Accede a tu cuenta de Rizoma</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="form-footer">
            <Link to="/forgot-password" className="forgot-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-button primary"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <div className="auth-alternate">
          <p>¿No tienes cuenta?</p>
          <Link to="/register" className="auth-button secondary">
            Crear Cuenta
          </Link>
        </div>

        <div className="auth-footer">
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>

      <div className="auth-visual">
        <div className="auth-visual-content">
          <h2>Conectando Productores con el Mundo</h2>
          <ul className="feature-list">
            <li>
              <span className="feature-icon">✓</span>
              <span>Proveedores verificados en blockchain</span>
            </li>
            <li>
              <span className="feature-icon">✓</span>
              <span>Sistema de cotizaciones simplificado</span>
            </li>
            <li>
              <span className="feature-icon">✓</span>
              <span>Pagos seguros y transparentes</span>
            </li>
            <li>
              <span className="feature-icon">✓</span>
              <span>Envíos a más de 45 países</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
