# Alembic Migration Template

When creating new migrations with geoalchemy2 (PostGIS) support, always ensure the migration file has the correct imports.

## Required Imports for Migrations with Geography/Geometry Types

```python
"""migration description

Revision ID: xxxxx
Revises: xxxxx
Create Date: xxxx

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2  # IMPORTANT: Required for Geography/Geometry types
```

## PostGIS Extension

Always enable PostGIS extension at the start of the upgrade function:

```python
def upgrade() -> None:
    """Upgrade schema."""
    # Enable PostGIS extension for geography support
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    # ... rest of your migration
```

## After Creating a Migration

After running `alembic revision --autogenerate`:

1. **Check the migration file** for geoalchemy2 usage
2. **Add the import** if it's missing:
   ```python
   import geoalchemy2
   ```
3. **Add PostGIS extension** if using geography/geometry types
4. **Review the generated code** for accuracy

## Common Issues

### Issue: `NameError: name 'geoalchemy2' is not defined`

**Solution:** Add `import geoalchemy2` to the imports section

### Issue: `type "geography" does not exist`

**Solution:** Add `op.execute("CREATE EXTENSION IF NOT EXISTS postgis")` to upgrade function

### Issue: Migration doesn't detect Geography column changes

**Solution:**
- Check that your model uses `from geoalchemy2 import Geography`
- Verify `target_metadata` in `alembic/env.py` includes your models

## Example Migration with Geography

```python
"""add venue location

Revision ID: abc123
Revises: def456
Create Date: 2025-01-20 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import geoalchemy2

revision: str = 'abc123'
down_revision: Union[str, None] = 'def456'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Enable PostGIS extension
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    # Add geography column
    op.add_column('venues',
        sa.Column('geo_point',
            geoalchemy2.types.Geography(
                geometry_type='POINT',
                srid=4326,
                from_text='ST_GeogFromText',
                name='geography'
            ),
            nullable=True
        )
    )

    # Create spatial index
    op.create_index(
        'ix_venues_geo_gist',
        'venues',
        ['geo_point'],
        postgresql_using='gist'
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_venues_geo_gist', table_name='venues', postgresql_using='gist')
    op.drop_column('venues', 'geo_point')
```

## Automating the Import Fix

You can modify `alembic/env.py` to automatically include geoalchemy2 in generated migrations.

In your `script.py.mako` template (or create one), add:

```python
<%!
import re
%>"""${message}

Revision ID: ${up_revision}
Revises: ${down_revision | comma,n}
Create Date: ${create_date}

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}
% if 'geoalchemy2' in context.get('imports', ''):
import geoalchemy2
% endif

# revision identifiers, used by Alembic.
revision: str = ${repr(up_revision)}
down_revision: Union[str, None] = ${repr(down_revision)}
branch_labels: Union[str, Sequence[str], None] = ${repr(branch_labels)}
depends_on: Union[str, Sequence[str], None] = ${repr(depends_on)}
```

## Testing Migrations

Before applying to production:

```bash
# Test upgrade
alembic upgrade head

# Test downgrade
alembic downgrade -1

# Test re-upgrade
alembic upgrade head

# Verify database state
psql -d your_db -c "\d+ venues"  # Check table structure
psql -d your_db -c "\dx"  # Check installed extensions
```
