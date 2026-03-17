import yaml
import sys

with open('docs/openapi.yaml', 'r') as f:
    data = yaml.safe_load(f)

# Remove /tickets paths
paths_to_remove = [p for p in data.get('paths', {}) if p.startswith('/tickets')]
for p in paths_to_remove:
    del data['paths'][p]

# Remove Ticket schemas
if 'components' in data and 'schemas' in data['components']:
    schemas_to_remove = [s for s in data['components']['schemas'] if s.startswith('Ticket')]
    for s in schemas_to_remove:
        del data['components']['schemas'][s]

with open('docs/openapi.yaml', 'w') as f:
    yaml.dump(data, f, sort_keys=False, default_flow_style=False)
    
print("Removed paths:", paths_to_remove)
print("Removed schemas:", schemas_to_remove)
