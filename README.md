# 💰 WageFlow - Telegram Payroll Automation Bot

> Blockchain-powered payroll management directly in Telegram

## 🎯 Overview

WageFlow is a production-ready Telegram bot for managing employee payroll with Web3 integration. Built for the blockchain hackathon, it demonstrates:

- ✅ Real ERC-20 token transfers (cUSD/cEUR on Celo)
- ✅ Production-quality TypeScript architecture
- ✅ Secure PIN-protected transactions
- ✅ Sequelize ORM with PostgreSQL
- ✅ Clean separation of concerns
- ✅ Graceful RPC fallback handling

## 🏗️ Architecture

```
src/
├── bot/                    # Telegram bot layer
│   ├── handlers/          # Command & callback handlers
│   ├── middleware/        # Auth, logging, sessions
│   └── utils/             # Formatters & validators
├── config/                # Environment & constants
├── services/
│   ├── blockchain/        # Celo Web3 integration
│   └── database/          # Sequelize models
└── types/                 # TypeScript definitions
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Edit `.env` with your credentials

### 2.1 Configure AI (optional but recommended)
Add Gemini credentials in `.env`:
```bash
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.0-flash
```
If a model is unavailable for your account, WageFlow automatically falls back to supported Gemini Flash models.

### 3. Setup Database
```bash
createdb Wageflow
```

### 4. Run Bot
```bash
npm run dev
```

### AI Troubleshooting
- If you see `429 Too Many Requests` / quota errors, your Gemini project has hit limits. Wait for the retry window or enable billing/increase quota in Google AI Studio.
- If you see `404 model not found`, set `GEMINI_MODEL` in `.env` to a model available to your account.

## 📱 Bot Commands

- `/start` - Welcome & main menu
- `/register` - Register your company
- `/add_employee` - Add new employee
- `/payroll` - Process payroll
- `/history` - View payments
- `/help` - Show all commands

## 🔐 Security

- bcrypt PIN hashing
- Wallet validation
- Session management
- Input sanitization
- Error handling

## 🌐 Tech Stack

- **Bot**: Telegraf (Telegram)
- **Database**: PostgreSQL + Sequelize
- **Blockchain**: Celo (ethers.js)
- **Language**: TypeScript (strict)

## 📊 Database Models

- **Company**: Registration & wallet
- **Employee**: Salary & status
- **Payment**: Transaction history

## 🎯 Hackathon Ready

- Demo-ready interface
- Real blockchain integration
- Production code quality
- Clear documentation
- Security-first approach

---
## I couldn't verify on selfclaw

<!-- **MIT License** | Built for Blockchain Hackathon 2026 -->
