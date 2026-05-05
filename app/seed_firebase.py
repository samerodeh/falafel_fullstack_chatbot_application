import json
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("firebase_security_key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ---------- Seed menu_items ----------
print("Seeding menu_items...")
with open("menu.json", "r", encoding="utf-8") as f:
    items = json.load(f)

for item in items:
    db.collection("menu_items").document(item["id"]).set(item)
    print(f"  ✓ {item['name_en']}")

print(f"\nUploaded {len(items)} menu items.")

# ---------- Seed faq ----------
print("\nSeeding faq...")
with open("faq.json", "r", encoding="utf-8") as f:
    faq_data = json.load(f)

db.collection("restaurant_info").document("main").set({
    "restaurant_name": faq_data["restaurant_name"],
    "tagline": faq_data["tagline"],
    "contact": faq_data["contact"]
})
print("  ✓ Restaurant info")

for faq in faq_data["faqs"]:
    db.collection("faqs").document(faq["id"]).set(faq)
    print(f"  ✓ {faq['question'][:50]}...")

print(f"\nUploaded {len(faq_data['faqs'])} FAQ entries.")
print("\nAll done! Firestore is fully populated.")