import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [step, setStep] = useState(1); // 1: Role selection, 2: Account details
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: formData.fullName,
          company_name: formData.companyName,
          role: role
        }
      );

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Redirect to complete profile based on role
      if (role === 'provider') {
        navigate('/onboarding');
      } else {
        navigate('/complete-buyer-profile');
      }
    } catch (err) {
      setError('Error al crear la cuenta. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <h1>Crear Cuenta</h1>
          <p>
            {step === 1
              ? 'Selecciona el tipo de cuenta'
              : role === 'buyer'
              ? 'Regístrate como Comprador'
              : 'Regístrate como Proveedor'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {step === 1 ? (
          // Step 1: Role Selection
          <div className="role-selection">
            <button
              className="role-card"
              onClick={() => handleRoleSelect('buyer')}
            >
              <div className="role-icon">🛒</div>
              <h3>Soy Comprador</h3>
              <p>Busco proveedores verificados de productos agrícolas mexicanos</p>
              <ul className="role-features">
                <li>Acceso a miles de productos</li>
                <li>Solicitudes de cotización</li>
                <li>Comparación de proveedores</li>
                <li>Envíos internacionales</li>
              </ul>
              <span className="role-cta">Continuar como Comprador →</span>
            </button>

            <button
              className="role-card"
              onClick={() => handleRoleSelect('provider')}
            >
              <div className="role-icon">🌱</div>
              <h3>Soy Productor</h3>
              <p>Quiero vender mis productos agrícolas a compradores internacionales</p>
              <ul className="role-features">
                <li>Verificación blockchain</li>
                <li>Alcance internacional</li>
                <li>Gestión de cotizaciones</li>
                <li>Panel de control completo</li>
              </ul>
              <span className="role-cta">Continuar como Productor →</span>
            </button>
          </div>
        ) : (
          // Step 2: Account Details
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="fullName">Nombre Completo</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Juan Pérez"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyName">
                {role === 'buyer' ? 'Empresa' : 'Nombre del Negocio'}
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                placeholder={role === 'buyer' ? 'Mi Empresa S.A.' : 'Aguacates del Norte'}
                disabled={loading}
              />
            </div>

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
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repite tu contraseña"
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="form-buttons">
              <button
                type="button"
                className="auth-button secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                ← Atrás
              </button>
              <button
                type="submit"
                className="auth-button primary"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div className="auth-alternate">
            <p>¿Ya tienes cuenta?</p>
            <Link to="/login" className="auth-button secondary">
              Iniciar Sesión
            </Link>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/">← Volver al inicio</Link>
        </div>
      </div>

      <div className="auth-visual">
        <div className="auth-visual-content">
          <h2>Únete a la Revolución del Comercio Agrícola</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">2,500+</div>
              <div className="stat-label">Productos Disponibles</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Verificación Blockchain</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">45+</div>
              <div className="stat-label">Países Atendidos</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.7★</div>
              <div className="stat-label">Calificación Promedio</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
