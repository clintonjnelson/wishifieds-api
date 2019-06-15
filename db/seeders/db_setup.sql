-- !!!!! IMPORTANT ---- EVERYTHING IN THIS SCRIPT MUST BE REPEATABLE !!!!!

-- SET search_path to wishifieds,public;

-- CREATE USER genie WITH PASSWORD 'password';

-- Add extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Setup user
-- ALTER DATABASE wishifieds OWNER TO postgres;

