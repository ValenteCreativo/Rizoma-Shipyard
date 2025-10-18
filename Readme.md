# 🌱 Rizoma - Sistema de Validación Descentralizada para Agroproductores

![Solana](https://img.shields.io/badge/Solana-blockchain-9945FF?logo=solana)
![Anchor](https://img.shields.io/badge/Anchor-v0.30.1-success)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![License](https://img.shields.io/badge/license-MIT-blue)

> Plataforma blockchain enterprise para conectar compradores internacionales con proveedores agrícolas verificados en México. 9 años de experiencia en comercio exterior respaldados por tecnología descentralizada.

---

## 📋 Tabla de Contenidos

- [Overview](#-overview)
- [Arquitectura](#-arquitectura)
- [Smart Contract](#-smart-contract)
- [Tecnologías](#-tecnologías)
- [Prerequisitos](#-prerequisitos)
- [Instalación](#-instalación)
- [Desarrollo Local](#-desarrollo-local)
- [Deployment](#-deployment)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)

---

## 🎯 Overview

Rizoma es una solución blockchain que resuelve los principales desafíos del comercio agrícola internacional:

### El Problema
- **Verificación de proveedores**: Dificultad para validar autenticidad de productores
- **Intermediarios costosos**: Múltiples capas de comisiones bancarias y comerciales
- **Falta de transparencia**: Imposibilidad de auditar transacciones
- **Complejidad normativa**: Contratos sin validez internacional efectiva
- **Riesgo de incumplimiento**: Sin garantías de calidad o entrega

### La Solución
Rizoma implementa un sistema de **validación descentralizada** que garantiza:

✅ **Identidad verificada** - KYC/KYB on-chain  
✅ **Trazabilidad completa** - Historial inmutable de transacciones  
✅ **Smart contracts** - Ejecución automática de términos acordados  
✅ **Pagos directos** - Stablecoins (USDC/USDT) sin intermediarios  
✅ **Auditoría transparente** - Todos los registros en blockchain público  

---

## 🏗️ Arquitectura
```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│  - Wallet Adapter (Phantom, Solflare)                       │
│  - @coral-xyz/anchor client                                 │
│  - UI/UX enterprise-grade                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ RPC calls
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   SOLANA BLOCKCHAIN                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Program ID: Hac29kvvQ3vMEu3CzsALtciEwKYULtYuKcifeb │  │
│  │              NFFhrE                                  │  │
│  │                                                       │  │
│  │  Instructions:                                       │  │
│  │  └─ store_message(text: String)                     │  │
│  │                                                       │  │
│  │  Accounts:                                           │  │
│  │  └─ Record { user: Pubkey, text: String }          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Network: Localnet (dev) / Devnet (staging) / Mainnet      │
└──────────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contract

### Program Information
- **Program ID**: `Hac29kvvQ3vMEu3CzsALtciEwKYULtYuKcifebNFFhrE`
- **Framework**: Anchor v0.30.1
- **Language**: Rust (rustc 1.78.0)
- **Network**: Localnet (development)

### Source Code
```rust
use anchor_lang::prelude::*;

declare_id!("Hac29kvvQ3vMEu3CzsALtciEwKYULtYuKcifebNFFhrE");

#[program]
pub mod rizoma2 {
    use super::*;
    
    /// Stores a validation record on-chain
    /// 
    /// # Arguments
    /// * `ctx` - Program context with accounts
    /// * `text` - Validation information (max 280 chars)
    pub fn store_message(ctx: Context, text: String) -> Result {
        let record = &mut ctx.accounts.record;
        record.user = *ctx.accounts.user.key;
        record.text = text;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct StoreMessage {
    /// Account to store the record (280 bytes for text)
    #[account(init, payer = user, space = 8 + 32 + 4 + 280)]
    pub record: Account,
    
    /// User signing and paying for the transaction
    #[account(mut)]
    pub user: Signer,
    
    /// Solana system program
    pub system_program: Program,
}

#[account]
pub struct Record {
    /// Public key of the user who created the record
    pub user: Pubkey,
    
    /// Validation text (producer info, certifications, etc.)
    pub text: String,
}
```

### Account Structure

| Field | Type | Size | Description |
|-------|------|------|-------------|
| `discriminator` | `[u8; 8]` | 8 bytes | Anchor account discriminator |
| `user` | `Pubkey` | 32 bytes | Creator's wallet address |
| `text` | `String` | 4 + 280 bytes | Validation information |
| **Total** | | **324 bytes** | |

---

## 🛠️ Tecnologías

### Backend (Smart Contract)
- **Solana** - High-performance blockchain (65k TPS)
- **Anchor Framework** - Rust framework for Solana programs
- **Agave** - Solana validator implementation
- **Rust** - System programming language

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **@solana/wallet-adapter** - Wallet integration
- **@coral-xyz/anchor** - Anchor TypeScript client

### Development Tools
- **solana-test-validator** - Local blockchain for testing
- **Anchor CLI** - Program deployment and management
- **Phantom Wallet** - Browser extension wallet

---

## 📦 Prerequisitos

### Sistema Operativo
- macOS (Intel/Apple Silicon)
- Linux
- Windows (WSL2)

### Software Requerido
```bash
# Rust (1.78.0+)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup install 1.78.0
rustup default 1.78.0

# Solana CLI / Agave
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Node.js (18+) y Yarn
brew install node
npm install -g yarn

# Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --tag v0.30.1 --locked
```

### Verificar Instalación
```bash
rustc --version    # rustc 1.78.0 o superior
solana --version   # solana-cli 2.x (Agave)
anchor --version   # anchor-cli 0.30.1
node --version     # v18+ o superior
yarn --version     # 1.22+ o superior
```

---

## 🚀 Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/rizoma.git
cd rizoma
```

### 2. Instalar Dependencias del Smart Contract
```bash
# En la raíz del proyecto
yarn install
```

### 3. Configurar Rust Toolchain
```bash
# El archivo rust-toolchain.toml ya está configurado
cat rust-toolchain.toml
```

Debería mostrar:
```toml
[toolchain]
channel = "1.78.0"
components = ["rustfmt","clippy"]
profile = "minimal"
```

### 4. Compilar el Programa
```bash
anchor build
```

### 5. Instalar Dependencias del Frontend
```bash
cd rizoma-frontend
yarn install
```

---

## 💻 Desarrollo Local

### Terminal 1: Levantar Validador Local
```bash
# Inicia el validador de Solana en localhost
solana-test-validator
```

El validador correrá en `http://127.0.0.1:8899`

### Terminal 2: Configurar Solana CLI
```bash
# Configurar cluster a localhost
solana config set --url http://127.0.0.1:8899

# Crear/verificar keypair
solana-keygen new

# Airdrop de SOL para testing
solana airdrop 10

# Verificar balance
solana balance
```

### Terminal 3: Desplegar el Programa
```bash
# Desde la raíz del proyecto
anchor deploy
```

Output esperado:
```
Deploying cluster: http://127.0.0.1:8899
Upgrade authority: ~/.config/solana/id.json
Deploying program "rizoma2"...
Program Id: Hac29kvvQ3vMEu3CzsALtciEwKYULtYuKcifebNFFhrE
Deploy success
```

### Terminal 4: Levantar el Frontend
```bash
cd rizoma-frontend
yarn dev
```

El frontend estará disponible en `http://localhost:5173`

---

## 🌐 Deployment

### Devnet
```bash
# Configurar a devnet
solana config set --url https://api.devnet.solana.com

# Airdrop (puede fallar por límites)
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet
```

### Mainnet (Producción)
```bash
# Configurar a mainnet
solana config set --url https://api.mainnet-beta.solana.com

# IMPORTANTE: Asegúrate de tener SOL real
solana balance

# Deploy (ESTO CUESTA SOL REAL)
anchor deploy --provider.cluster mainnet
```

---

## 📁 Estructura del Proyecto
```
rizoma/
├── programs/
│   └── rizoma2/
│       ├── src/
│       │   └── lib.rs              # Smart contract source
│       └── Cargo.toml
├── target/
│   ├── deploy/
│   │   └── rizoma2.so              # Compiled program
│   └── idl/
│       └── rizoma2.json            # Interface Definition Language
├── tests/
│   └── rizoma2.ts                  # Anchor tests
├── rizoma-frontend/
│   ├── src/
│   │   ├── App.jsx                 # Main React component
│   │   ├── App.css                 # Styles
│   │   ├── idl.json                # Copied from target/idl
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── Anchor.toml                     # Anchor configuration
├── Cargo.toml                      # Rust workspace
├── package.json
└── rust-toolchain.toml             # Rust version pinning
```

---

## 🐛 Troubleshooting

### Error: `rustc 1.75.0-dev` required but have 1.78.0

**Causa**: Solana tiene Rust empaquetado que sobreescribe la versión del sistema.

**Solución**: Instalar Agave (reemplazo oficial de Solana CLI)
```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
source ~/.zprofile
```

### Error: `source_file()` method not found in `proc_macro2::Span`

**Causa**: Bug de compatibilidad en Anchor 0.30.1 con generación de IDL.

**Solución**: Generar IDL manualmente
```bash
# Compilar sin IDL
anchor build --no-idl

# Crear IDL manualmente (ver target/idl/rizoma2.json en repo)
```

### Error: Wallet no conecta en localhost

**Causa**: Phantom wallet no detecta red local automáticamente.

**Solución**: 

1. Abrir Phantom
2. Settings → Developer Settings
3. Agregar red custom: `http://127.0.0.1:8899`
4. Hacer airdrop desde CLI:
```bash
   solana airdrop 10 
```

### Error: `cargo update` no resuelve dependencias

**Causa**: Conflictos entre versiones de dependencias transitivas.

**Solución**: 
```bash
rm Cargo.lock
cargo clean
anchor build
```

### Frontend no encuentra el IDL

**Causa**: El archivo `idl.json` no está sincronizado.

**Solución**:
```bash
cp target/idl/rizoma2.json rizoma-frontend/src/idl.json
```

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Smart contract básico de validación
- [x] Deployment en localnet
- [x] Frontend con wallet integration
- [x] Demo funcional

### Phase 2: Core Features (Q1 2025)
- [ ] KYC/KYB on-chain
- [ ] Sistema de reputación
- [ ] Marketplace de productores
- [ ] Integración con oráculos de precios

### Phase 3: Enterprise (Q2 2025)
- [ ] Smart contracts de escrow
- [ ] Pagos con USDC/USDT
- [ ] Multi-signature wallets
- [ ] API para integraciones

### Phase 4: Scale (Q3 2025)
- [ ] Mobile app (React Native)
- [ ] Programa de referidos
- [ ] DAO governance
- [ ] Mainnet launch

---

## 👥 Equipo

**Rizoma Team**  
9 años de experiencia en comercio exterior  
Especialistas en logística agrícola internacional

---

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles

---

## 🔗 Links

- **Explorer (Localnet)**: `http://localhost:8899`
- **Program ID**: `Hac29kvvQ3vMEu3CzsALtciEwKYULtYuKcifebNFFhrE`
- **Anchor Docs**: https://docs.anchor-lang.com
- **Solana Docs**: https://docs.solana.com

---

## 💬 Soporte

¿Problemas durante el setup? Abre un issue en GitHub o contacta al equipo.

---

**Built with ❤️ on Solana**