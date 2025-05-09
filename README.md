# 📦 Warehouse Management System (WMS) MVP

This project is a Minimum Viable Product (MVP) for a Warehouse Management System (WMS) designed to streamline SKU-MSKU mapping, clean multi-source sales data, and provide AI-driven analytics for business insights.

## 🚀 Project Features

### ✅ Part 1: Data Cleaning and SKU-MSKU Mapping GUI
- GUI-based SKU to MSKU mapping tool
- Supports manual and automatic mapping
- Input: CSV/Excel files from various marketplaces
- Combo SKU handling (e.g., "A+B")
- Format validation and error logging
- Highlights missing SKUs and supports inline editing

### ✅ Part 2: Visual Relational Database
- Integrates with tools like **Baserow**, **Teable.io**, or **NoCodeDB**
- Organizes sales, returns, products, and mappings
- Editable front-end for non-technical users
- Dashboard for metrics like return rates, sales trends

### ✅ Part 3: Web Application Integration
- Drag-and-drop interface for uploading files
- Automated backend data cleaning (using SKUMapper logic)
- Connects with the visual database
- Displays processed data in a user-friendly layout

### ✅ Part 4: AI over Data Layer
- AI-powered interface for querying data via natural language (text-to-SQL)
- Create custom calculated fields (e.g., gross margin, return rate)
- Generate visual charts (bar, pie, line)
- Optional integration with tools like **Vanna.ai**, **Steep**, or **LangChain + Supabase**

---

## 🛠️ Tech Stack

| Layer               | Tools Used                             |
|---------------------|-----------------------------------------|
| **Frontend**        | Tkinter / PyQt / customtkinter GUI      |
| **Backend**         | Python, Pandas, Flask / FastAPI         |
| **Database**        | SQLite / Baserow / Teable.io            |
| **AI/Analytics**    | LangChain, OpenAI API, Vanna.ai         |
| **File Formats**    | CSV, Excel                              |

---

## 📁 Project Structure

wms-mvp/
│
├── part1_sku_mapper/
│ ├── gui.py # Tkinter-based GUI
│ ├── sku_mapper.py # SKUMapper class
│ └── sample_mapping.xlsx # Example mapping file
│
├── part2_visual_db/
│ └── (integration instructions or Baserow schema)
│
├── part3_web_app/
│ ├── app.py # Flask/FastAPI backend
│ └── templates/
│ └── upload.html
│
├── part4_ai_layer/
│ ├── text_to_sql.py # AI layer for querying
│ └── chart_generator.py # Auto-generate visual charts
│
├── requirements.txt
└── README.md

yaml
Copy
Edit

---

## 🧪 Setup & Run

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/wms-mvp.git
cd wms-mvp
2. Install Dependencies
bash
Copy
Edit
pip install -r requirements.txt
3. Launch SKU-MSKU GUI (Part 1)
bash
Copy
Edit
python part1_sku_mapper/gui.py
4. Run Web App (Part 3)
bash
Copy
Edit
cd part3_web_app
python app.py
📊 Example Use Cases
Map incoming SKUs from Amazon, Flipkart, Shopify to master SKUs

Upload messy Excel sheets with returns and sales → clean & unify

Query: “Show top 5 products by return rate in April”

Create a chart of sales trend by marketplace

🤖 AI Features (Part 4)
Text Input: "What is the total sales value by product?"

AI Output: SQL + auto-chart

Backend: Uses OpenAI or Vanna.ai + SQLAlchemy or Supabase

🧩 Contributing
Feel free to fork this repo, raise issues, or suggest features. Contributions are welcome!

📄 License
MIT License – free to use with attribution.

🙌 Acknowledgments
Inspired by tools like Airtable, Vanna.ai, and LangChain








