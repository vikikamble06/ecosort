import sqlite3
import os
import json
import hashlib
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ecosort.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def hash_password(password: str, salt: str = "ecosort_secure_salt_2026") -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 200000).hex()

def verify_password(password: str, password_hash: str, salt: str = "ecosort_secure_salt_2026") -> bool:
    return hash_password(password, salt) == password_hash

def init_db(force_reset: bool = False):
    conn = get_db_connection()
    cursor = conn.cursor()

    if force_reset:
        cursor.executescript("""
            DROP TABLE IF EXISTS audit_logs;
            DROP TABLE IF EXISTS user_goals;
            DROP TABLE IF EXISTS user_badges;
            DROP TABLE IF EXISTS points_ledger;
            DROP TABLE IF EXISTS pickup_bookings;
            DROP TABLE IF EXISTS facilities;
            DROP TABLE IF EXISTS classifications;
            DROP TABLE IF EXISTS waste_items;
            DROP TABLE IF EXISTS waste_categories;
            DROP TABLE IF EXISTS users;
        """)

    # 1. Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'citizen',
        address TEXT,
        phone TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 2. Waste categories table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS waste_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        icon TEXT NOT NULL,
        color TEXT NOT NULL,
        bg_color TEXT NOT NULL,
        bin_name TEXT NOT NULL,
        bin_color TEXT NOT NULL,
        description TEXT NOT NULL,
        disposal_guidance TEXT NOT NULL,
        recyclability TEXT NOT NULL
    );
    """)

    # 3. Waste items knowledge base
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS waste_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        aliases TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        preparation_steps TEXT NOT NULL,
        disposal_method TEXT NOT NULL,
        recyclability_status TEXT NOT NULL,
        warnings TEXT,
        facility_type_needed TEXT,
        source TEXT NOT NULL,
        region TEXT NOT NULL DEFAULT 'Universal / Municipal Standard',
        popular INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES waste_categories (id)
    );
    """)

    # 4. Classifications log
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS classifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        image_url TEXT,
        predicted_item_name TEXT NOT NULL,
        category_id INTEGER NOT NULL,
        confidence REAL,
        model_provider TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'predicted',
        confirmed_category_id INTEGER,
        notes TEXT,
        points_awarded INTEGER DEFAULT 0,
        uncertain INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (category_id) REFERENCES waste_categories (id),
        FOREIGN KEY (confirmed_category_id) REFERENCES waste_categories (id)
    );
    """)

    # 5. Recycling facilities
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS facilities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        facility_type TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        postal_code TEXT,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        phone TEXT,
        operating_hours TEXT NOT NULL,
        supported_materials TEXT NOT NULL,
        verified INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 6. Pickup bookings
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS pickup_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_reference TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        waste_category_id INTEGER NOT NULL,
        estimated_weight_kg REAL NOT NULL,
        pickup_address TEXT NOT NULL,
        preferred_date TEXT NOT NULL,
        time_slot TEXT NOT NULL,
        contact_preference TEXT NOT NULL DEFAULT 'Phone Call',
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'requested',
        cancellation_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (waste_category_id) REFERENCES waste_categories (id)
    );
    """)

    # 7. Points ledger (auditable, duplicate prevention)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS points_ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        event_type TEXT NOT NULL,
        reference_id TEXT,
        points INTEGER NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, event_type, reference_id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
    """)

    # 8. User badges / achievements
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        badge_code TEXT NOT NULL,
        badge_name TEXT NOT NULL,
        badge_description TEXT NOT NULL,
        icon TEXT NOT NULL,
        awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_code),
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
    """)

    # 9. User goals
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        target_items INTEGER NOT NULL,
        current_items INTEGER NOT NULL DEFAULT 0,
        target_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
    """)

    # 10. Audit logs for administration
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_user_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        target_entity TEXT NOT NULL,
        target_id TEXT,
        details TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_user_id) REFERENCES users (id)
    );
    """)

    # Indexes for high performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_waste_items_name ON waste_items(name);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_classifications_user ON classifications(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_bookings_user ON pickup_bookings(user_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_points_user ON points_ledger(user_id);")

    conn.commit()
    conn.close()

def seed_initial_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if data already exists
    cursor.execute("SELECT COUNT(*) FROM users;")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return

    # 1. Seed Users (Citizen and Admin)
    demo_citizen_pwd = hash_password("DemoEco@2026")
    demo_admin_pwd = hash_password("AdminSort@2026")

    cursor.execute("""
        INSERT INTO users (email, password_hash, full_name, role, address, phone)
        VALUES 
        ('demo@ecosort.org', ?, 'Priya Sharma (Demo Citizen)', 'citizen', 'Flat 402, Green Meadows, 5th Main Road, Bengaluru', '+91 98765 43210'),
        ('admin@ecosort.org', ?, 'EcoSort Operations Admin', 'admin', 'EcoSort Municipal Hub, Central Boulevard, Bengaluru', '+91 91234 56789');
    """, (demo_citizen_pwd, demo_admin_pwd))

    # 2. Seed Waste Categories
    categories = [
        ('wet_organic', 'Wet / Organic Waste', 'Apple', '#15803d', '#f0fdf4', 'Green Compost Bin', '#22c55e', 'Biodegradable kitchen and food waste suitable for composting', 'Drain excess moisture. Do not mix with plastic wrappers or liners.', 'Compostable (100% Biodegradable)'),
        ('dry_waste', 'Dry Waste', 'Package', '#0284c7', '#f0f9ff', 'Blue Dry Bin', '#38bdf8', 'Non-biodegradable, clean dry waste and general packaging', 'Ensure items are dry, clean, and free of food residues.', 'Depends on material'),
        ('recyclable_paper', 'Paper & Cardboard', 'Scroll', '#b45309', '#fefce8', 'Blue / Paper Bin', '#f59e0b', 'Clean paper, newspaper, magazines, and corrugated cardboard boxes', 'Flatten boxes. Remove plastic tapes. Keep strictly dry.', 'High Recyclability'),
        ('plastic', 'Recyclable Plastic', 'Layers', '#0d9488', '#f0fdfa', 'Blue Plastic Bin', '#14b8a6', 'Rigid plastics, PET bottles, HDPE containers, clean containers', 'Rinse residues, let dry, crush bottles to save storage space.', 'Recyclable (Check resin code #1-#5)'),
        ('glass', 'Glass Containers', 'Wine', '#0369a1', '#e0f2fe', 'Teal Glass Bin', '#0284c7', 'Intact glass bottles, jars, and beverage containers', 'Rinse clean. Remove lids. Never mix with broken window glass or mirrors.', 'Infinite Recyclability'),
        ('metal', 'Metal & Cans', 'Hammer', '#475569', '#f8fafc', 'Grey Metal Bin', '#64748b', 'Aluminium cans, tin food containers, aerosol cans (empty), foil', 'Rinse food traces. Ensure aerosol cans are completely depressurized.', 'High Recyclability'),
        ('electronic_waste', 'Electronic Waste (E-Waste)', 'Laptop', '#7c3aed', '#faf5ff', 'Dedicated E-Waste Bin / Drop-off', '#8b5cf6', 'Old computers, phones, cables, chargers, printed circuit boards', 'Hand over to authorized recyclers. Never throw into domestic garbage.', 'Specialized Facility Required'),
        ('batteries', 'Batteries & Accumulators', 'BatteryCharging', '#b91c1c', '#fef2f2', 'Red Battery Collection Box', '#ef4444', 'Lithium-ion, alkaline AA/AAA, lead-acid, button cells', 'Tape terminal ends with insulating tape to prevent short-circuit and fire.', 'Hazardous - Designated Depot Only'),
        ('sanitary_waste', 'Sanitary Waste', 'ShieldAlert', '#be185d', '#fdf2f8', 'Red / Labeled Sanitary Bag', '#ec4899', 'Diapers, sanitary pads, medical cotton, used bandages', 'Wrap securely in newspaper or labeled disposable red pouch. Incineration.', 'Non-recyclable / Safe Disposal'),
        ('household_hazardous', 'Household Hazardous Waste', 'AlertTriangle', '#c2410c', '#fff7ed', 'Hazardous Waste Depot', '#f97316', 'Paints, thinners, pesticides, expired medicines, CFL bulbs, chemicals', 'Keep in original sealed containers with labels intact. Never pour down drains.', 'Designated Hazardous Treatment Only'),
        ('residual_waste', 'General Residual / Landfill Waste', 'Trash2', '#52525b', '#fafafa', 'Black Residual Bin', '#71717a', 'Non-recyclable composites, soiled wrappers, multi-laminate sachets', 'Minimize usage. Compress before disposal.', 'Non-recyclable (Sent to Landfill / WTE)')
    ]

    for cat in categories:
        cursor.execute("""
            INSERT INTO waste_categories (code, name, icon, color, bg_color, bin_name, bin_color, description, disposal_guidance, recyclability)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, cat)

    # Fetch category ID mapping
    cursor.execute("SELECT code, id FROM waste_categories;")
    cat_map = {row["code"]: row["id"] for row in cursor.fetchall()}

    # 3. Seed Waste Items Knowledge Base (30+ comprehensive real-world items)
    items = [
        # Wet / Organic
        ('Banana Peel', 'banana skin, fruit peel, organic scrap', cat_map['wet_organic'], 'Remove any non-biodegradable stickers before composting.', 'Compost bin or local municipal green organic waste collection.', '100% Biodegradable & Compostable', None, 'Composting Facility / Home Compost', 'EPA & Municipal Guidelines', 1),
        ('Leftover Cooked Food', 'rice, curry, leftover dinner, food scraps', cat_map['wet_organic'], 'Drain excess gravies and oil. Do not pack in polythene bags.', 'Green wet waste bin or community bio-digester.', 'Compostable / Bio-methanation', 'Excessive oil can slow home composting.', 'Biogas / Organic Waste Converter', 'Municipal Solid Waste Rules', 1),
        ('Coffee Grounds & Filter Paper', 'used coffee, espresso puck, tea leaves', cat_map['wet_organic'], 'Cool down. Brown unbleached paper filters can be composted together.', 'Green compost bin or soil amendment directly around acid-loving plants.', 'Rich in nitrogen for soil', None, 'Home Composting / Green Bin', 'Agronomy Extension Research', 0),
        ('Eggshells', 'egg shells, calcium scrap', cat_map['wet_organic'], 'Rinse briefly and crush with fingers to accelerate breakdown.', 'Add to home compost pile or green kitchen bin.', 'High calcium soil conditioner', None, 'Home Compost / Organic Bin', 'Organic Waste Handbook', 0),
        
        # Recyclable Paper & Cardboard
        ('Cardboard Shipping Box', 'amazon box, parcel box, corrugated cardboard', cat_map['recyclable_paper'], 'Remove plastic packing tape and shipping labels if possible. Flatten completely.', 'Blue dry recyclable bin or paper depot.', 'High Recyclability (up to 7 cycles)', 'Greasy or wet cardboard cannot be recycled.', 'Paper Recycling Mill', 'Recycling Industry Standard', 1),
        ('Newspaper & Magazines', 'daily news, periodicals, gazettes', cat_map['recyclable_paper'], 'Keep dry and bundled with twine or stacked flat.', 'Dry waste collection or scrap dealer (kabadiwala).', 'High Recyclability', 'Soiled papers with food grease must go to residual.', 'Authorized Paper Recycler', 'National Paper Standards', 1),
        ('Soiled Pizza Box with Cheese Stains', 'pizza packaging, greasy box', cat_map['residual_waste'], 'Separate clean box top (recycle) from greasy bottom (residual/compost).', 'Dispose of greasy bottom in residual or compost if untreated.', 'Grease contaminates paper pulp batches.', 'Do not mix with dry clean paper recyclables.', 'Municipal Incineration / Landfill', 'Paper Recycling Quality Control', 1),

        # Plastic
        ('PET Plastic Water Bottle', 'mineral water bottle, clear drink bottle, beverage bottle', cat_map['plastic'], 'Empty contents completely. Rinse lightly, crush bottle, replace screw cap.', 'Blue dry recyclable bin or reverse vending machine (RVM).', 'Highly Recyclable (Resin Code #1 PET)', 'Remove bottle seals if easy to peel.', 'Plastic Mechanical Recycling Plant', 'Association of Plastic Recyclers', 1),
        ('Milk Jug / Detergent Bottle (HDPE)', 'shampoo bottle, milk packet, laundry bottle', cat_map['plastic'], 'Rinse thoroughly with cold water. Dry completely.', 'Blue plastic recycling bin.', 'Highly Recyclable (Resin Code #2 HDPE)', None, 'Municipal Plastic Recycler', 'Recycling Best Practice', 1),
        ('Single-Use Thin Polythene Bag', 'grocery carry bag, plastic shopping bag', cat_map['dry_waste'], 'Clean of food crumbs. Bundle multiple bags inside one bag.', 'Specific supermarket drop-off kiosk. Never put in automated sorting bins.', 'Low mechanical sorting efficiency (clogs conveyor belts)', 'Tangles municipal conveyor belts.', 'Specialized Film Drop-off Facility', 'Plastics Recovery Coalition', 1),
        ('Expanded Polystyrene (Styrofoam Packaging)', 'thermocol, protective foam, foam cup', cat_map['residual_waste'], 'Check for local drop-off. If none exists, break down into residual waste.', 'Residual dry bin unless specialized densifier drop-off exists in city.', 'Difficult to recycle economically', 'Breaks into microplastic beads that harm wildlife.', 'Specialized Foam Aggregator / Landfill', 'Zero Waste Alliance', 0),

        # Glass
        ('Clear Glass Food Jar', 'jam jar, pickle jar, mayonnaise glass', cat_map['glass'], 'Rinse jar to remove food residue. Metal lids should be recycled with metals.', 'Teal glass bin or scrap collector.', '100% Infinitely Recyclable without quality loss', 'Do not shatter.', 'Glass Cullet Furnace', 'Glass Packaging Institute', 1),
        ('Broken Drinking Glass / Window Pane', 'shattered tumbler, mirror shard, Pyrex dish', cat_map['dry_waste'], 'Wrap shards heavily in thick newspaper or cardboard box and clearly label "SHARP GLASS".', 'Dry residual collection with clear safety label.', 'Not recyclable with bottle glass (different melting points)', 'Severe laceration hazard for sanitation workers!', 'Municipal Landfill / Safe Encapsulation', 'Sanitation Worker Safety Standards', 1),

        # Metal
        ('Aluminium Soda Can', 'coke can, beer can, beverage tin', cat_map['metal'], 'Drain liquid. Rinsing saves pest attractants. Crush can to save volume.', 'Blue/Grey metal recycling bin.', '100% Infinitely Recyclable (Saves 95% energy vs raw bauxite)', None, 'Aluminium Smelter / Metal Scrap Dealer', 'Aluminium Association', 1),
        ('Empty Aerosol Deodorant Can', 'spray can, hairspray, air freshener canister', cat_map['metal'], 'Ensure canister is 100% empty by holding spray nozzle until no sound remains.', 'Dry metal recyclables bin. Never puncture or incinerate.', 'Recyclable steel/aluminium', 'Pressurized contents can explode if crushed while loaded.', 'Metal Recycling Center', 'Aerosol Manufacturers Association', 0),
        ('Used Aluminium Foil', 'tin foil, food wrap foil', cat_map['metal'], 'Rinse food oils. Scrunch small foil scraps into a large ball (at least 5cm wide).', 'Metal recycling bin if clean; residual bin if charred/soiled.', 'Recyclable if clean and compacted', 'Loose tiny foil flakes get blown away in sorting plants.', 'Metal Scrap Aggregator', 'Resource Recycling Bureau', 0),

        # E-Waste
        ('Old Smartphone / Tablet', 'mobile phone, android, iphone, cellular device', cat_map['electronic_waste'], 'Perform factory data reset. Remove SIM and memory cards.', 'Authorized e-waste collection center or brand take-back program.', 'Contains precious metals (gold, silver, copper, palladium)', 'Never dispose in municipal bins; contains lithium battery.', 'Certified E-Waste Dismantler (R2 / e-Stewards)', 'E-Waste Management Rules 2022', 1),
        ('Charging Cables & Adapters', 'usb cable, laptop charger, power brick', cat_map['electronic_waste'], 'Bundle neatly with cable tie.', 'E-waste collection drop-off kiosk.', 'Valuable copper wiring & plastics', None, 'E-Waste Aggregator / Cable Recycler', 'National E-Waste Initiative', 1),
        ('Old Laptop Computer', 'notebook, macbook, personal computer', cat_map['electronic_waste'], 'Wipe hard drive. Keep power adapter together.', 'Schedule doorstep collection or authorized depot.', 'Contains valuable and critical raw materials', 'Contains flame retardants and heavy metals.', 'Authorized E-Waste Refurbisher/Recycler', 'Ministry of Environment Guidelines', 0),

        # Batteries
        ('Lithium-Ion Phone / Powerbank Battery', 'li-ion cell, power bank, rechargeable battery', cat_map['batteries'], 'Place insulating electrical tape over both terminal ends.', 'Hazardous battery collection bin at electronics retailer or municipal depot.', 'Critical raw materials (Lithium, Cobalt, Nickel)', 'MAJOR FIRE HAZARD: Can ignite spontaneously if punctured in garbage trucks!', 'Specialized Hydrometallurgical Battery Recycler', 'Battery Waste Management Rules', 1),
        ('Alkaline AA / AAA Batteries', 'dry cell, torch battery, remote battery', cat_map['batteries'], 'Store in a dry, cool container. Tape terminal ends if grouping together.', 'Battery recycling depot or community hazardous drop-off.', 'Zinc and manganese recovery', 'Can leak corrosive potassium hydroxide.', 'Battery Recovery Center', 'Hazardous Materials Directive', 1),

        # Household Hazardous
        ('Used Cooking Oil', 'fryer oil, kitchen grease, rancid oil', cat_map['household_hazardous'], 'Cool down. Strain into an airtight plastic bottle or jar.', 'Drop off at biodiesel conversion hub or hazardous collection kiosk.', 'Recyclable into Biodiesel and soap', 'NEVER POUR DOWN SINK DRAINS - causes fatbergs and sewer blockages!', 'Biodiesel Processing Facility', 'Bio-energy Recovery Guidelines', 1),
        ('CFL / Fluorescent Tube Light', 'tube bulb, energy saver bulb, neon tube', cat_map['household_hazardous'], 'Handle with extreme care. Wrap in original cardboard sleeve or bubble wrap.', 'Hazardous waste collection center or lighting retailer.', 'Glass and metal recoverable', 'CONTAINS TOXIC MERCURY VAPOR! If broken, ventilate room immediately for 15 mins.', 'Mercury Distillation Recycling Facility', 'Hazardous Substances Protocol', 1),
        ('Expired Prescription Medicines', 'tablets, pills, syrup, antibiotics', cat_map['household_hazardous'], 'Keep in blister packs. Scratch out personal prescription details on label.', 'Pharmacy medicine take-back box or municipal hazardous drop-off.', 'High-temperature incineration', 'NEVER FLUSH DOWN TOILET - contaminates groundwater and aquatic ecosystems.', 'Authorized Medical Waste Incinerator', 'FDA / WHO Safe Medication Disposal', 1),
        ('Leftover Oil-Based Paint Can', 'enamel paint, wall primer, wood varnish', cat_map['household_hazardous'], 'Seal lid tightly. If almost empty, leave lid off outside to dry completely into solid block.', 'Household hazardous waste depot.', 'Solvent recovery / hazardous fuel blending', 'Flammable solvents, harmful VOC vapors.', 'Municipal Hazardous Transfer Station', 'Chemical Waste Management Guidelines', 0),

        # Sanitary Waste
        ('Baby Diapers & Sanitary Napkins', 'pads, adult incontinence briefs, wet wipes', cat_map['sanitary_waste'], 'Wrap securely in 4 layers of newspaper and mark with a visible red cross.', 'Designated red sanitary waste bag or non-biodegradable incinerator collection.', 'Non-recyclable / Controlled high-temperature incineration', 'Biohazard for sanitation workers if left unwrapped.', 'Centralized Waste-to-Energy Incinerator', 'Sanitary Waste Handling Standard', 1),
        ('Used Surgical Face Masks', 'N95 mask, 3-ply surgical mask', cat_map['sanitary_waste'], 'Cut ear loops with scissors (protects birds/wildlife). Wrap in paper.', 'Domestic sanitary waste collection.', 'Non-recyclable polypropylene microfibers', 'Potential infectious biological pathogen carrier.', 'Bio-medical Waste Incineration', 'Infection Control Protocol', 0)
    ]

    for item in items:
        # Format: (name, aliases, category_id, preparation_steps, disposal_method, recyclability_status, warnings, facility_type_needed, source, popular)
        cursor.execute("""
            INSERT INTO waste_items (name, aliases, category_id, preparation_steps, disposal_method, recyclability_status, warnings, facility_type_needed, source, region, popular)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Universal / Municipal Standard', ?)
        """, (item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7], item[8], item[9]))

    # 4. Seed Verified Recycling Facilities (Geolocated realistic hubs)
    facilities = [
        ('EcoSort Green Valley Composting Hub', 'Composting & Organic Converter', 'Sector 4, Green Valley Park Rd', 'Bengaluru', '560034', 12.9279, 77.6271, '+91 80 2553 1122', 'Mon-Sat: 07:00 - 18:00', json.dumps(['Wet Organic Waste', 'Garden Clippings', 'Food Scraps', 'Dry Leaves']), 1),
        ('Apex E-Waste & Electronics Recyclers', 'Certified E-Waste Depot', 'Plot 42, Electronic City Phase 1', 'Bengaluru', '560100', 12.8452, 77.6602, '+91 80 4123 9988', 'Mon-Fri: 09:30 - 17:30', json.dumps(['Smartphones', 'Laptops', 'Cables & Adapters', 'Printers', 'Lithium Batteries']), 1),
        ('BluePlanet Circular Polymers & Plastics', 'Rigid & Soft Plastic Recovery', '18 Industrial Suburb, Peenya 2nd Stage', 'Bengaluru', '560058', 13.0312, 77.5185, '+91 80 2839 4400', 'Mon-Sat: 08:00 - 19:00', json.dumps(['PET Bottles', 'HDPE Jugs', 'PP Containers', 'Clean Polythene']), 1),
        ('City Scraps Metal & Cardboard Center', 'Paper & Metal Aggregator', 'Old Madras Road, Indiranagar', 'Bengaluru', '560038', 12.9784, 77.6408, '+91 80 2521 7766', 'All Days: 08:30 - 20:00', json.dumps(['Cardboard Boxes', 'Newspapers', 'Aluminium Cans', 'Tin & Steel', 'Brass']), 1),
        ('CleanEarth Hazardous & Battery Depot', 'Hazardous Waste Facility', 'Ring Road Junction, Outer Ring Rd, Marathahalli', 'Bengaluru', '560037', 12.9569, 77.7011, '+91 80 6711 0022', 'Tue-Sun: 10:00 - 17:00', json.dumps(['Lithium Batteries', 'Car Batteries', 'Fluorescent CFL Bulbs', 'Expired Medicines', 'Paints & Solvents']), 1),
        ('EcoGlass Cullet Recovery Station', 'Glass Recycling Plant', 'Whitefield Export Promotion Zone', 'Bengaluru', '560066', 12.9815, 77.7289, '+91 80 2841 3311', 'Mon-Fri: 09:00 - 17:00', json.dumps(['Clear Glass Bottles', 'Amber Beer Bottles', 'Green Wine Bottles', 'Glass Jars']), 1),
        ('BioEnergy Used Cooking Oil Collection Center', 'Biofuel Conversion Station', 'Koramangala 8th Block, Near Water Tank', 'Bengaluru', '560095', 12.9352, 77.6190, '+91 80 4112 5599', 'Mon-Sat: 09:00 - 18:30', json.dumps(['Used Vegetable Oil', 'Fryer Oil', 'Animal Fats']), 1),
        ('Central Municipal Material Recovery Facility (MRF)', 'Comprehensive Municipal MRF', 'South End Circle, Jayanagar', 'Bengaluru', '560011', 12.9298, 77.5813, '+91 80 2656 8800', 'Mon-Sun: 06:00 - 21:00', json.dumps(['All Dry Recyclables', 'Paper', 'Plastics', 'Metals', 'Glass']), 1)
    ]

    for fac in facilities:
        cursor.execute("""
            INSERT INTO facilities (name, facility_type, address, city, postal_code, latitude, longitude, phone, operating_hours, supported_materials, verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, fac)

    # 5. Seed Demonstration History & Points for Demo Citizen
    cursor.execute("SELECT id FROM users WHERE email = 'demo@ecosort.org';")
    demo_user_id = cursor.fetchone()[0]

    # Add historical classifications
    sample_classifications = [
        (demo_user_id, '/sample-images/pet_bottle.jpg', 'PET Plastic Water Bottle', cat_map['plastic'], 0.96, 'Curated Vision & Rules Engine', 'confirmed', cat_map['plastic'], 'Crushed bottle and kept cap on.', 10, 0),
        (demo_user_id, '/sample-images/banana_peel.jpg', 'Banana Peel', cat_map['wet_organic'], 0.98, 'Curated Vision & Rules Engine', 'confirmed', cat_map['wet_organic'], 'Added to kitchen compost bucket.', 5, 0),
        (demo_user_id, '/sample-images/cardboard_box.jpg', 'Cardboard Shipping Box', cat_map['recyclable_paper'], 0.94, 'Curated Vision & Rules Engine', 'confirmed', cat_map['recyclable_paper'], 'Flattened and taped off.', 10, 0),
        (demo_user_id, '/sample-images/lithium_battery.jpg', 'Lithium-Ion Phone Battery', cat_map['batteries'], 0.91, 'Curated Vision & Rules Engine', 'confirmed', cat_map['batteries'], 'Taped battery terminals.', 20, 0),
        (demo_user_id, '/sample-images/soda_can.jpg', 'Aluminium Soda Can', cat_map['metal'], 0.97, 'Curated Vision & Rules Engine', 'confirmed', cat_map['metal'], 'Rinsed with water and crushed.', 10, 0)
    ]

    for sc in sample_classifications:
        cursor.execute("""
            INSERT INTO classifications (user_id, image_url, predicted_item_name, category_id, confidence, model_provider, status, confirmed_category_id, notes, points_awarded, uncertain)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sc)
        classif_id = cursor.lastrowid

        # Insert into points ledger
        cursor.execute("""
            INSERT INTO points_ledger (user_id, event_type, reference_id, points, description)
            VALUES (?, 'classification_confirmed', ?, ?, ?)
        """, (demo_user_id, f"classif_{classif_id}", sc[9], f"Sorted and confirmed {sc[2]} ({sc[9]} pts)"))

    # 6. Seed Demo Pickup Bookings
    bookings = [
        ('ECO-2026-8941', demo_user_id, cat_map['electronic_waste'], 4.5, 'Flat 402, Green Meadows, 5th Main Road, Bengaluru', '2026-10-25', '10:00 AM - 12:00 PM', 'Phone Call', 'Old tablet, 2 power banks, bundled cables.', 'confirmed', None),
        ('ECO-2026-7712', demo_user_id, cat_map['recyclable_paper'], 12.0, 'Flat 402, Green Meadows, 5th Main Road, Bengaluru', '2026-10-18', '02:00 PM - 04:00 PM', 'SMS', 'Stacks of old newspapers and shipping cartons.', 'collected', None)
    ]

    for b in bookings:
        cursor.execute("""
            INSERT INTO pickup_bookings (booking_reference, user_id, waste_category_id, estimated_weight_kg, pickup_address, preferred_date, time_slot, contact_preference, notes, status, cancellation_reason)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, b)
        booking_id = cursor.lastrowid
        if b[9] == 'collected':
            cursor.execute("""
                INSERT INTO points_ledger (user_id, event_type, reference_id, points, description)
                VALUES (?, 'pickup_collected', ?, 15, 'Completed doorstep recycling pickup')
            """, (demo_user_id, f"booking_{booking_id}"))

    # 7. Seed Badges & Achievements
    badges = [
        (demo_user_id, 'FIRST_SORT', 'First Step Forward', 'Correctly sorted your very first item on EcoSort', 'Award'),
        (demo_user_id, 'COMPOST_CHAMP', 'Soil Guardian', 'Logged 5 verified wet waste composting items', 'Sprout'),
        (demo_user_id, 'E_CYCLE_HERO', 'E-Waste Protector', 'Prevented toxic heavy metals from contaminating landfills', 'Cpu'),
        (demo_user_id, 'STREAK_7', 'Eco Champion Streak', 'Maintained a 7-day consistent waste segregation streak', 'Flame')
    ]

    for badge in badges:
        cursor.execute("""
            INSERT INTO user_badges (user_id, badge_code, badge_name, badge_description, icon)
            VALUES (?, ?, ?, ?, ?)
        """, badge)

    # 8. Seed Goals
    cursor.execute("""
        INSERT INTO user_goals (user_id, title, target_items, current_items, target_date, status)
        VALUES 
        (?, 'October Zero-Waste Sprint (Sort 20 items)', 20, 14, '2026-10-31', 'active'),
        (?, 'Safely Hand Off 5 E-Waste Items', 5, 2, '2026-11-15', 'active');
    """, (demo_user_id, demo_user_id))

    # 9. Seed Sample Audit Log
    cursor.execute("SELECT id FROM users WHERE email = 'admin@ecosort.org';")
    admin_id = cursor.fetchone()[0]
    cursor.execute("""
        INSERT INTO audit_logs (admin_user_id, action, target_entity, target_id, details, ip_address)
        VALUES 
        (?, 'SYSTEM_INIT', 'SYSTEM', '1', 'Initial database schema and seeded knowledge base initialized', '127.0.0.1'),
        (?, 'FACILITY_VERIFIED', 'facilities', '2', 'Verified operational license for Apex E-Waste Recyclers', '127.0.0.1');
    """, (admin_id, admin_id))

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db(force_reset=True)
    seed_initial_data()
    print("EcoSort database initialized and seeded successfully!")
