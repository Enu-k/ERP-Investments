# Kodo North Treasury Accounting Sync Prototype

## Overview
This is a complete frontend prototype for corporate treasury accounting entry management and ERP synchronization. The prototype demonstrates the end-to-end flow from ERP integration to portfolio ledger mapping to transaction accounting sync with Tally or Zoho Books.

## Key Features

### 1. ERP Integration
**Route:** `/erp-integration`

- View connected ERP provider (Tally Prime)
- Company/organization details
- Connection health status
- Last sync timestamp and statistics
- Import and refresh ledger masters from ERP
- View all imported ledgers with confidence scores

**Test:**
- Click "ERP Integration" in left navigation
- Observe connected Tally provider with healthy status
- Click "Refresh Ledgers" to simulate ledger import
- Review ledger table with 14 imported ledgers across different groups

### 2. Portfolio Accounting
**Route:** `/portfolio-accounting`

- View all portfolio holdings with accounting mapping status
- Status indicators: Mapped (green), Partially Mapped (yellow), Unmapped (gray)
- Click any holding to open ledger mapping side sheet
- Map 6 types of ledgers per portfolio:
  - Asset Ledger (required)
  - Bank Ledger (required)
  - Gain/Loss Income Ledger (required)
  - Dividend Ledger (optional)
  - Charges Ledger (optional)
  - Clearing Ledger (optional)
- View suggested ledgers with confidence scores (high/medium/low)
- Save mappings to update portfolio status
- Track last updated timestamp

**Test:**
- Navigate to Portfolio → Accounting tab
- Observe 2 mapped, 1 partially mapped, 2 unmapped holdings
- Click "Franklin Pension Plan - Growth" (unmapped)
- Select ledgers from dropdown suggestions
- Click "Save Mappings" to update status
- Verify status changes from "Unmapped" to "Mapped" or "Partially Mapped"

### 3. Transaction Accounting
**Route:** `/transactions-accounting`

- View all treasury transactions with accounting status
- Statuses: Ready to sync (blue), Synced (green), Unmapped (gray), Failed (red), Duplicate conflict (orange)
- Bulk select multiple "Ready to sync" transactions
- Sync selected transactions together in one action
- View accounting status summary cards
- Individual transaction review and sync

**Test:**
- Navigate to Transactions → Accounting tab
- Observe 2 ready, 2 synced, 2 unmapped, 1 failed, 1 duplicate
- Check boxes for "Ready to sync" transactions only
- Click "Sync X Selected" button
- Watch status change from "Ready to sync" to "Synced"
- Try clicking "Select All Ready" to quickly select eligible transactions

### 4. Transaction Accounting Detail Sheet
**Triggered by:** Clicking any transaction row in Transaction Accounting

Shows complete accounting entry details:
- Voucher type, date, provider
- Full narration
- Debit and credit ledger lines with amounts
- Ledger groups and line-level narrations
- Total debit and credit (balanced)
- Transaction metadata (raised by, date, units, amount)

**Status-specific displays:**
- **Synced:** Green success banner with voucher number, reference, sync timestamp
- **Failed:** Red error banner with specific error message, editable ledgers
- **Duplicate:** Orange warning with duplicate detection details
- **Ready:** Enabled "Sync to TALLY" button
- **Unmapped:** Yellow alert explaining portfolio needs mapping first

**Test:**
- Click any transaction row to open side sheet
- Review synced transaction (txn-1): see voucher JV-2026-001234 with sync details
- Review failed transaction (txn-6): see error about missing ledger
- Review ready transaction (txn-2): click "Sync to TALLY" button to sync
- Review unmapped transaction (txn-4): see alert to map portfolio first
- Review duplicate (txn-7): see duplicate voucher warning

### 5. Accounting Entry Scenarios
The prototype includes realistic accounting entries for:
- **Purchase:** Debit asset ledger, credit bank ledger
- **Redemption with gain/loss:** Debit bank, credit asset, credit/debit gain/loss
- **Dividend (IDCW):** Debit bank, credit dividend income
- **Exit load:** Debit exit load expense, credit bank
- **Switch, MTM, Sweep:** Additional scenarios in data model

## Data Architecture

### Types (`src/app/types/accounting.ts`)
- `AccountingProvider`: ERP connection details
- `Ledger`: Ledger master with confidence scores
- `PortfolioHolding`: Scheme with ledger mappings and status
- `TreasuryTransaction`: Transaction with accounting status
- `AccountingEntry`: Complete voucher with ledger lines
- `LedgerLine`: Individual debit/credit entry

### Mock Data (`src/app/data/mockAccounting.ts`)
- 1 connected Tally provider
- 14 imported ledgers (investments, banks, income, expenses, clearing)
- 5 portfolio holdings with varying mapping statuses
- 8 treasury transactions with different accounting statuses
- 5 complete accounting entries with realistic ledger lines

## User Journeys

### Journey 1: Connect ERP and Import Ledgers
1. Click "ERP Integration" in navigation
2. View connected Tally Prime status
3. Click "Refresh Ledgers" to import
4. Review imported ledgers with confidence scores

### Journey 2: Map Portfolio for Accounting
1. Navigate to Portfolio → Accounting tab
2. See unmapped or partially mapped schemes
3. Click a holding to open mapping sheet
4. Select asset, bank, and gain/loss ledgers (required)
5. Optionally select dividend, charges, clearing ledgers
6. Save mappings
7. Observe status change to "Mapped"
8. Ready for transaction accounting

### Journey 3: Bulk Sync Ready Transactions
1. Navigate to Transactions → Accounting tab
2. Review "Ready to sync" transactions
3. Check boxes to select multiple transactions
4. Click "Sync X Selected"
5. Watch status change to "Synced"
6. Verify sync stats update

### Journey 4: Review Individual Transaction Accounting
1. In Transaction Accounting, click any transaction row
2. Review complete voucher details
3. See debit/credit ledger lines
4. For failed: understand error and edit ledgers
5. For duplicate: review conflict details
6. For ready: sync individual transaction
7. For synced: review voucher number and reference

### Journey 5: Handle Unmapped Transaction
1. Click unmapped transaction (Franklin Pension Plan)
2. See alert: portfolio needs mapping
3. Close sheet and navigate to Portfolio Accounting
4. Map Franklin Pension Plan ledgers
5. Return to Transaction Accounting
6. Transaction now shows "Ready to sync" status

## Technical Implementation

### Component Structure
```
src/app/
├── components/
│   ├── ERPIntegration.tsx          # ERP provider connection and ledgers
│   ├── PortfolioAccounting.tsx     # Portfolio holdings with mapping
│   ├── TransactionsAccounting.tsx  # Transaction list with bulk sync
│   └── TransactionAccountingSheet.tsx # Individual voucher review
├── types/
│   └── accounting.ts               # TypeScript interfaces
└── data/
    └── mockAccounting.ts           # Mock data and helper functions
```

### Design Patterns
- **Left navigation:** Consistent across all screens
- **Table-first layouts:** Portfolio and transaction listings
- **Right-side detail sheets:** Mapping and voucher review
- **Status chips:** Color-coded accounting statuses
- **Dropdown selectors:** Ledger selection with confidence
- **Black primary CTAs:** "Sync" and "Save" actions
- **Responsive stats cards:** Status summary metrics

### Mock API Behavior
All actions use setTimeout to simulate API latency:
- Refresh ledgers: 2 second delay
- Save mappings: Immediate with status update
- Bulk sync: 2 second delay with status updates
- Individual sync: 1.5 second delay

## Testing Checklist

### Desktop Viewport (1400px+)
- [x] ERP Integration screen loads with provider details
- [x] Ledger table displays all 14 ledgers
- [x] Portfolio Accounting shows 5 holdings with correct statuses
- [x] Ledger mapping sheet opens and closes smoothly
- [x] Ledger dropdowns show suggestions with confidence
- [x] Saving mappings updates portfolio status
- [x] Transaction Accounting shows 8 transactions
- [x] Bulk select only enables for "ready" transactions
- [x] "Sync X Selected" button syncs multiple transactions
- [x] Transaction detail sheet shows complete voucher
- [x] Synced transactions show voucher number
- [x] Failed transactions show error message
- [x] Unmapped transactions show portfolio alert

### Narrow Viewport (1024px)
- [x] Tables scroll horizontally without breaking layout
- [x] Side sheets remain at 600-700px width
- [x] Stats cards stack responsively
- [x] CTAs remain visible and clickable
- [x] Navigation sidebar stays functional

### Responsive Behavior
- All tables have horizontal scroll on narrow viewports
- Side sheets overlay with fixed width
- Stats cards use responsive grid (4 cols → 2 cols → 1 col)
- Navigation collapses gracefully

## Routes Summary
- `/erp-integration` - ERP provider connection
- `/portfolio` - Portfolio holdings (original)
- `/portfolio-accounting` - Portfolio ledger mapping
- `/transactions` - Transaction listing (original)
- `/transactions-accounting` - Transaction accounting entries

## Future Enhancements (Out of Scope)
- Real Tally/Zoho Books API integration
- Ledger search and filtering
- Advanced error recovery flows
- Audit trail and sync history
- Multi-company support
- Scheduled auto-sync
- Export to Excel/CSV
- Mobile responsive optimization

## Development Notes
- Built with Vite + React + TypeScript
- Uses Radix UI for dropdowns and tabs
- Lucide React for icons
- Tailwind CSS for styling
- React Router for navigation
- No backend required - fully mocked frontend

## Running Locally
The dev server is already running. Access the prototype at the preview URL provided by Figma Make.

Navigate between screens using:
1. Left sidebar navigation
2. Tabs within Portfolio and Transactions screens
3. Clickable table rows to open detail sheets

Enjoy testing the complete treasury accounting sync flow!
