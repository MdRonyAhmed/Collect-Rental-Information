# Multi-Platform Real Estate & Rental Data Pipeline

An enterprise-grade, modular Node.js scraping and data ingestion engine designed to extract, clean, and persist rental market listings from multiple distinct real estate platforms simultaneously.

## Architecture & Core Modules

The project utilizes a modular scraper architecture where each target platform has a dedicated extraction engine:
* **Major Platforms:** Facebook Marketplace (`index_fb.js`), Kijiji (`index_kijiji.js`), and Zillow (`index_zillow.js`).
* **Regional Canadian Boards:** Capreit (`index_capreit.js`), Castanet (`index_castanet.js`), UsedVictoria (`index_usedvictoria.js`), RentFaster (`index_rent_faster.js`), and more.
* **Pipeline Utilities:** Includes dedicated automation scripts for data transformation, merging output files (`join_json_files.js`), and deduplication (`remove_duplicate_rows.js`).

## Tech Stack
* **Language:** JavaScript (Node.js)
* **Automation Framework:** Puppeteer, Axios
* **Database & Storage:** PostgreSQL, CSV/JSON data streams

## Database Integration
Extracted property particulars, pricing, and contact information are processed, sanitized, and programmatically synced directly into a relational PostgreSQL database schema.

# Sample Output
![Screenshot from 2022-10-01 19-08-16](https://user-images.githubusercontent.com/58313058/193411020-7b95f5e0-fedb-491b-857c-366c07567b53.png)
