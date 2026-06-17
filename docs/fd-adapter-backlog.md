# FD Adapter Backlog

Last updated: 2026-06-17

This backlog tracks the RBI-bank FD adapter expansion work. A bank moves from `NEEDS_ADAPTER` to `ACTIVE` only after the official source URL is verified, parser output is clean retail/domestic FD data, a fixture-backed test exists, a targeted scrape reports `SUCCESS`, and the frontend static bundle can be refreshed.

## Completed In Batch 1

| Bank ID | Bank | Official source | Parser path | Targeted scrape |
| --- | --- | --- | --- | --- |
| `rbl` | RBL Bank | [RBL interest rates](https://www.rbl.bank.in/interest-rates) | Generic HTML table parser with three-row header and non-retail table guards | `SUCCESS`, 10 rows |
| `esaf_sfb` | ESAF Small Finance Bank | [ESAF interest rates](https://www.esaf.bank.in/interest-rates/) | Generic HTML table parser with senior/foreign-currency filtering | `SUCCESS`, 11 rows |

Frontend bundle impact:

- `public/data/fd-rates/latest/fd_rates.json` now has 884 base rows across 20 banks.
- RBL contributes 10 rows.
- ESAF SFB contributes 11 rows.
- `fd_rates_final.json` remains the optional normalized subset; consumers merge it with the base parser output.

## Batch 1 Remaining

These banks were probed against their current registry URLs by temporarily enabling the generic parser. They remain `NEEDS_ADAPTER` until the official source and parser path are proven.

### Official Page Fetched, No Rows Found

Likely next action: inspect page structure, discover deeper FD/PDF/JSON URLs, or add a focused parser if rates are rendered outside simple HTML tables.

| Bank ID | Current URL |
| --- | --- |
| `csb` | `https://www.csb.co.in/interest-rates` |
| `city_union` | `https://www.cityunionbank.com/rate-of-interest` |
| `dhanlaxmi` | `https://www.dhanbank.com/interest-rates` |
| `jammu_kashmir` | `https://www.jkbank.com/interest-rates` |
| `nainital` | `https://www.nainitalbank.co.in/interest-rates/` |
| `capital_sfb` | `https://www.capitalbank.co.in/interest-rates` |
| `equitas_sfb` | `https://www.equitasbank.com/fixed-deposit` |
| `ujjivan_sfb` | `https://www.ujjivansfb.in/personal-banking/deposits/fixed-deposit-interest-rates` |
| `utkarsh_sfb` | `https://www.utkarsh.bank/interest-rates` |
| `dbs_india` | `https://www.dbs.com/in/treasures/deposits/fixed-deposits` |

### Fetch Or Access Failed

Likely next action: verify canonical official URL in browser, handle redirects, SSL/certificate quirks, bot blocking, or PDF/download endpoints.

| Bank ID | Current URL | Probe status |
| --- | --- | --- |
| `bandhan` | `https://bandhanbank.com/rates-charges` | Read timeout |
| `dcb` | `https://www.dcbbank.com/fixed-deposit-interest-rates` | Fetch failed |
| `idbi` | `https://www.idbibank.in/interest-rates.aspx` | SSL timeout |
| `karnataka` | `https://karnatakabank.com/interest-rates` | HTTP 403 |
| `karur_vysya` | `https://www.kvb.co.in/interest-rates/` | SSL verification failed |
| `south_indian` | `https://www.southindianbank.com/interest-rate` | Fetch failed |
| `tamilnad_mercantile` | `https://www.tmb.in/deposit-interest-rates/` | Fetch failed |
| `au_sfb` | `https://www.aubank.in/interest-rates` | HTTP 403 |
| `jana_sfb` | `https://www.janabank.com/interest-rates` | SSL verification failed |
| `shivalik_sfb` | `https://shivalikbank.com/interest-rates/` | SSL verification failed |
| `suryoday_sfb` | `https://www.suryodaybank.com/fixed-deposit-interest-rates` | Fetch failed |
| `unity_sfb` | `https://theunitybank.com/interest-rates` | SSL alert |
| `hsbc_india` | `https://www.hsbc.co.in/accounts/products/fixed-deposit/` | Fetch failed |
| `standard_chartered_india` | `https://www.sc.com/in/deposits/term-deposit/` | Fetch failed |
| `deutsche_india` | `https://www.deutschebank.co.in/en/content/fixed-deposit.html` | Fetch failed |
| `sbm_india` | `https://www.sbmbank.co.in/interest-rates.php` | Fetch failed |

## Later Batches

Batch 2:

- `coastal_local_area`
- `krishna_bhima_samruddhi_local_area`

Batch 3:

- All regional rural bank entries that remain `NEEDS_ADAPTER`.

## Validation Commands

```bash
cd "/Users/aditya/Documents/scrape fd rates"
source .venv/bin/activate
python -m pip install -e ".[dev]"
python -m fd_rates.cli scrape --banks rbl,esaf_sfb --out /tmp/fd-adapter-check --format json --allow-partial --no-loader --timeout 20 --retries 2 --concurrency 2
python -m pytest

cd "/Users/aditya/Documents/Treasury Test/scrape fd rates"
source .venv/bin/activate
python -m pip install -e ".[dev]"
python -m pytest tests/test_api_service.py

cd "/Users/aditya/Documents/ERP Investments Section/Treasury ERP Investments"
npm run build
```

Run the frontend build only from the Vite app directory. The scraper repository does not have a `package.json`.
