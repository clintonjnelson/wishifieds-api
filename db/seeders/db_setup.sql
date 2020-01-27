--- This will all be run as "root" or "postgres", I think...
-- This should be run manually on the database in the future, before using by app

-- Put everything in public as don't need multi schemas at this point
SET search_path to public;

-- Setup user
DROP USER IF EXISTS manager;
CREATE USER manager WITH PASSWORD 'password';
ALTER DATABASE wishifieds OWNER TO manager;

-- Set privileges for user
REVOKE CONNECT ON DATABASE wishifieds FROM PUBLIC;
GRANT CONNECT ON DATABASE wishifieds TO manager;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO manager;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO manager;
GRANT ALL PRIVILEGES ON DATABASE wishifieds TO manager;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM manager;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO manager;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO manager;

ALTER SCHEMA public OWNER TO manager;

-- Add extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
