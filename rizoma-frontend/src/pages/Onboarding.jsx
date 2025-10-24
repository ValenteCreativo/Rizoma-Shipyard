import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import idl from "../idl.json";
import "../styles/Onboarding.css";

const { SystemProgram } = web3;

const STEPS = [
  { id: 1, title: "Información de la Empresa", icon: "🏢" },
  { id: 2, title: "Datos de Contacto", icon: "📧" },
  { id: 3, title: "Documentación Legal", icon: "📄" },
  { id: 4, title: "Verificación Blockchain", icon: "⛓" },
];

const DOCUMENT_TYPES = [
  { value: "business_registration", label: "Registro Empresarial", required: true },
  { value: "tax_certificate", label: "Cédula Fiscal (RFC)", required: true },
  { value: "phytosanitary_certificate", label: "Certificado Fitosanitario", required: false },
  { value: "organic_certification", label: "Certificación Orgánica", required: false },
  { value: "quality_certification", label: "Certificación de Calidad", required: false },
  { value: "export_license", label: "Licencia de Exportación", required: false },
  { value: "bank_statement", label: "Estado de Cuenta Bancario", required: true },
  { value: "identity_document", label: "Identificación Oficial", required: true },
];

export default function Onboarding() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Company Info
    companyName: "",
    legalName: "",
    taxId: "",
    description: "",

    // Step 2: Contact
    email: "",
    phone: "",
    country: "Mexico",
    state: "",
    city: "",
    address: "",
    postalCode: "",
    website: "",

    // Step 3: Documents
    documents: [],
  });

  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [currentDocument, setCurrentDocument] = useState({
    type: "",
    file: null,
    name: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError("El archivo no debe superar 10MB");
        return;
      }
      setCurrentDocument({
        ...currentDocument,
        file: file,
        name: file.name,
      });
    }
  };

  const uploadDocument = async () => {
    if (!currentDocument.type || !currentDocument.file) {
      setError("Selecciona un tipo de documento y archivo");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Upload to Supabase Storage
      const fileExt = currentDocument.file.name.split('.').pop();
      const fileName = `${wallet.publicKey.toBase58()}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('provider-documents')
        .upload(fileName, currentDocument.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('provider-documents')
        .getPublicUrl(fileName);

      // Calculate file hash (simplified - in production use proper hashing)
      const fileHash = await calculateFileHash(currentDocument.file);

      const newDoc = {
        type: currentDocument.type,
        name: currentDocument.name,
        url: urlData.publicUrl,
        hash: fileHash,
        uploadedAt: new Date().toISOString(),
      };

      setUploadedDocuments([...uploadedDocuments, newDoc]);
      setCurrentDocument({ type: "", file: null, name: "" });
      setSuccess("Documento subido exitosamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Error al subir documento: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateFileHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const getProvider = () => new AnchorProvider(connection, wallet, {});
  const getProgram = () => new Program(idl, getProvider());

  const registerOnBlockchain = async (providerData) => {
    try {
      const program = getProgram();
      const recordKeypair = web3.Keypair.generate();

      // Create a hash of all document hashes
      const documentHashes = uploadedDocuments.map(doc => doc.hash).join(',');
      const verificationData = JSON.stringify({
        provider: providerData.wallet_address,
        company: providerData.company_name,
        documents: documentHashes,
        timestamp: new Date().toISOString(),
      });

      const tx = await program.methods
        .storeMessage(verificationData)
        .accounts({
          record: recordKeypair.publicKey,
          user: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([recordKeypair])
        .rpc();

      return {
        signature: tx,
        publicKey: recordKeypair.publicKey.toBase58(),
      };
    } catch (err) {
      console.error("Blockchain registration error:", err);
      throw err;
    }
  };

  const submitOnboarding = async () => {
    try {
      setLoading(true);
      setError("");

      if (!wallet.publicKey) {
        setError("Conecta tu wallet primero");
        return;
      }

      // Validate required documents
      const requiredDocs = DOCUMENT_TYPES.filter(dt => dt.required).map(dt => dt.value);
      const uploadedTypes = uploadedDocuments.map(d => d.type);
      const missingDocs = requiredDocs.filter(rd => !uploadedTypes.includes(rd));

      if (missingDocs.length > 0) {
        setError("Faltan documentos requeridos. Por favor sube todos los documentos obligatorios.");
        return;
      }

      // Step 1: Create provider record in Supabase
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .insert([{
          wallet_address: wallet.publicKey.toBase58(),
          company_name: formData.companyName,
          legal_name: formData.legalName,
          tax_id: formData.taxId,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          postal_code: formData.postalCode,
          description: formData.description,
          website: formData.website,
          verification_status: 'pending',
        }])
        .select()
        .single();

      if (providerError) throw providerError;

      // Step 2: Store documents in database
      const documentsToInsert = uploadedDocuments.map(doc => ({
        provider_id: providerData.id,
        document_type: doc.type,
        document_name: doc.name,
        file_url: doc.url,
        file_hash: doc.hash,
        verification_status: 'pending',
      }));

      const { error: docsError } = await supabase
        .from('documents')
        .insert(documentsToInsert);

      if (docsError) throw docsError;

      // Step 3: Register on Solana blockchain
      const blockchainProof = await registerOnBlockchain(providerData);

      // Step 4: Store blockchain verification
      const { error: blockchainError } = await supabase
        .from('blockchain_verifications')
        .insert([{
          provider_id: providerData.id,
          verification_type: 'provider_registration',
          solana_signature: blockchainProof.signature,
          data_hash: uploadedDocuments.map(d => d.hash).join(','),
          status: 'confirmed',
          metadata: {
            document_count: uploadedDocuments.length,
            registration_date: new Date().toISOString(),
          },
        }]);

      if (blockchainError) throw blockchainError;

      // Step 5: Update provider with blockchain hash
      await supabase
        .from('providers')
        .update({ blockchain_hash: blockchainProof.signature })
        .eq('id', providerData.id);

      setSuccess("¡Registro completado exitosamente! Redirigiendo a tu perfil...");

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (err) {
      console.error("Onboarding error:", err);
      setError(`Error en el registro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const removeDocument = (index) => {
    setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
  };

  if (!wallet.connected) {
    return (
      <div className="onboarding-container">
        <div className="connect-wallet-prompt">
          <div className="connect-icon">🔐</div>
          <h2>Conecta tu Wallet</h2>
          <p>Para registrarte como proveedor verificado, necesitas conectar tu wallet de Solana</p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1>Registro de Proveedor</h1>
        <p>Completa el proceso de verificación para unirte al marketplace</p>
      </div>

      {/* Progress Stepper */}
      <div className="stepper">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
          >
            <div className="step-icon">{step.icon}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="onboarding-form">
        {/* Step 1: Company Info */}
        {currentStep === 1 && (
          <div className="form-step">
            <h2>Información de la Empresa</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Nombre Comercial *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Ej: Aguacates del Norte"
                  required
                />
              </div>

              <div className="form-group">
                <label>Razón Social *</label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleInputChange}
                  placeholder="Ej: Aguacates del Norte S.A. de C.V."
                  required
                />
              </div>

              <div className="form-group">
                <label>RFC / Tax ID *</label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  placeholder="RFC-123456789"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Descripción de la Empresa</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe tu empresa, productos principales y experiencia..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Contact */}
        {currentStep === 2 && (
          <div className="form-step">
            <h2>Datos de Contacto</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contacto@empresa.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+52 33 1234 5678"
                />
              </div>

              <div className="form-group">
                <label>Estado *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Michoacán"
                  required
                />
              </div>

              <div className="form-group">
                <label>Ciudad *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Uruapan"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Dirección</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle, número, colonia"
                />
              </div>

              <div className="form-group">
                <label>Código Postal</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="60000"
                />
              </div>

              <div className="form-group">
                <label>Sitio Web</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.empresa.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {currentStep === 3 && (
          <div className="form-step">
            <h2>Documentación Legal</h2>
            <p className="step-description">
              Sube los documentos requeridos. Estos serán verificados y su hash se almacenará en blockchain.
            </p>

            <div className="document-upload-section">
              <div className="upload-form">
                <div className="form-group">
                  <label>Tipo de Documento</label>
                  <select
                    value={currentDocument.type}
                    onChange={(e) => setCurrentDocument({ ...currentDocument, type: e.target.value })}
                  >
                    <option value="">Selecciona un tipo...</option>
                    {DOCUMENT_TYPES.map((dt) => (
                      <option key={dt.value} value={dt.value}>
                        {dt.label} {dt.required ? '*' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Archivo (PDF, max 10MB)</label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                  {currentDocument.name && (
                    <div className="file-selected">📄 {currentDocument.name}</div>
                  )}
                </div>

                <button
                  className="upload-btn"
                  onClick={uploadDocument}
                  disabled={!currentDocument.type || !currentDocument.file || loading}
                >
                  {loading ? 'Subiendo...' : 'Subir Documento'}
                </button>
              </div>

              {uploadedDocuments.length > 0 && (
                <div className="uploaded-documents">
                  <h3>Documentos Subidos ({uploadedDocuments.length})</h3>
                  <div className="documents-list">
                    {uploadedDocuments.map((doc, index) => (
                      <div key={index} className="document-item">
                        <div className="doc-info">
                          <span className="doc-icon">📄</span>
                          <div>
                            <div className="doc-name">{doc.name}</div>
                            <div className="doc-type">
                              {DOCUMENT_TYPES.find(dt => dt.value === doc.type)?.label}
                            </div>
                            <div className="doc-hash">Hash: {doc.hash.slice(0, 16)}...</div>
                          </div>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => removeDocument(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Blockchain Verification */}
        {currentStep === 4 && (
          <div className="form-step">
            <h2>Verificación Blockchain</h2>
            <p className="step-description">
              Revisa tu información y confirma el registro. Crearemos un registro verificable en Solana blockchain.
            </p>

            <div className="summary-card">
              <h3>Resumen del Registro</h3>
              <div className="summary-item">
                <span className="summary-label">Empresa:</span>
                <span className="summary-value">{formData.companyName}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">RFC:</span>
                <span className="summary-value">{formData.taxId}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Email:</span>
                <span className="summary-value">{formData.email}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Ubicación:</span>
                <span className="summary-value">{formData.city}, {formData.state}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Wallet:</span>
                <span className="summary-value wallet-address">
                  {wallet.publicKey.toBase58()}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Documentos:</span>
                <span className="summary-value">{uploadedDocuments.length} archivos</span>
              </div>
            </div>

            <div className="blockchain-info">
              <h4>⛓ Proceso de Verificación Blockchain</h4>
              <ul>
                <li>Se creará un hash de todos tus documentos</li>
                <li>El hash se registrará en Solana blockchain</li>
                <li>Recibirás una prueba criptográfica inmutable</li>
                <li>Los compradores podrán verificar tu autenticidad</li>
                <li>Tus documentos permanecen privados (solo el hash es público)</li>
              </ul>
            </div>

            <button
              className="submit-btn"
              onClick={submitOnboarding}
              disabled={loading}
            >
              {loading ? 'Registrando en Blockchain...' : '🚀 Completar Registro'}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="form-navigation">
          <button
            className="nav-btn"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            ← Anterior
          </button>

          {currentStep < STEPS.length && (
            <button
              className="nav-btn primary"
              onClick={nextStep}
            >
              Siguiente →
            </button>
          )}
        </div>

        {/* Status Messages */}
        {error && <div className="status-message error">{error}</div>}
        {success && <div className="status-message success">{success}</div>}
      </div>
    </div>
  );
}
