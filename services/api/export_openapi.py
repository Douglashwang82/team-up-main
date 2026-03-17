import json
import os
from app.main import app

os.makedirs('../docs', exist_ok=True)
with open('../docs/openapi.json', 'w') as f:
    json.dump(app.openapi(), f)
