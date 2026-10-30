"""Convert the cleaned CSV into assets/js/data.js (compact rows, loaded by every page)."""
import json, pandas as pd
COLS = ['city_tier','order_hour','order_month','number_of_items','delivery_distance_km','traffic_level_score',
        'weather_severity_score','delivery_time_minutes','estimated_delivery_time','delayed_delivery_flag',
        'cancellation_flag','refund_flag','promo_code_used','premium_customer_flag','festival_or_weekend_flag',
        'final_amount_paid','customer_rating']
df = pd.read_csv('data/food_delivery_analytics_cleaned.csv')[COLS]
for c in COLS:
    if df[c].dtype == bool: df[c] = df[c].astype(int)
rows = [[None if pd.isna(v) else v for v in r] for r in df.round(2).values.tolist()]
open('assets/js/data.js', 'w').write('window.DATA=' + json.dumps({'cols': COLS, 'rows': rows}, separators=(',', ':')) + ';')
print(f'{len(rows)} rows written')
