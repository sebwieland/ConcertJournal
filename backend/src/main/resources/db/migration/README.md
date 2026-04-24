# Flyway Migrations

This directory contains database migration scripts for ConcertJournal.

## Naming Convention

Files must follow the pattern: `V{version}__{description}.sql`

- `V` - Version prefix (required)
- `{version}` - Incremental number (1, 2, 3...)
- `__` - Double underscore separator (required)
- `{description}` - Brief description (underscores instead of spaces)
- `.sql` - File extension

## Current Migrations

- `V1__create_users_table.sql` - Creates the users table with authentication data
- `V2__create_band_events_table.sql` - Creates the band_events table with concert entries

## How Flyway Works

1. On application startup, Flyway checks the `flyway_schema_history` table
2. It compares installed versions against migration files in this directory
3. Any new migrations are executed in version order
4. Metadata is updated to track successful migrations

## Adding New Migrations

1. Create a new SQL file with the next version number
2. Write your schema changes
3. Restart the application (Flyway runs automatically)

Example:
```sql
-- V3__add_ticket_price_column.sql
ALTER TABLE band_events ADD COLUMN ticket_price DECIMAL(10,2);
```

## Best Practices

### DO:
- Keep migrations atomic (all-or-nothing)
- Add indexes for frequently queried columns
- Use `NOT NULL` constraints where data is required
- Include `ON DELETE CASCADE` for foreign keys with child records
- Test migrations locally before deploying

### DON'T:
- Modify existing migration files once they've run
- Write migrations that depend on external data
- Use `DROP TABLE` or other destructive operations in production
- Mix DDL (schema) and DML (data) changes in the same migration
- Write migrations that depend on Flyway executing in a specific order beyond version number

## Troubleshooting

### Migration failed on production
Flyway transactions are atomic. If a migration fails, it rolls back completely. Fix the issue in the migration file and redeploy.

### Need to re-run a migration
Don't modify existing files. Create a new migration that fixes the issue:
```sql
-- If V4 had a bug, create V5 to fix it:
-- V5__fix_broken_column_type.sql
ALTER TABLE band_events MODIFY COLUMN rating SMALLINT;
```

### Local development reset
Warning: This destroys all data!
```bash
# For Docker MySQL
docker-compose down -v
docker-compose up

# For H2
rm -rf backend/DB
```

### Schema validation errors
If Hibernate validation fails after adding a migration:
1. Check that entity fields match table columns
2. Check column types match Java types
3. Verify `@Column(name="...")` annotations match actual column names

## Environment-Specific Behavior

| Environment | Database | Behavior |
|-------------|----------|----------|
| Development (local) | H2 | Migrations run on startup |
| Development (Docker) | MySQL | Migrations run on startup |
| Production | MySQL | Migrations run on startup, validated |

## Monitoring

Check the `flyway_schema_history` table to see migration status:
```sql
SELECT installed_rank, version, description, type, script, installed_on, success
FROM flyway_schema_history
ORDER BY installed_rank;
```