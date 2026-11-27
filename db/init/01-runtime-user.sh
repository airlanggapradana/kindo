#!/bin/sh
set -eu
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set=runtime_password="$RUSDI_DB_PASSWORD" <<'SQL'
CREATE ROLE rusdi_runtime LOGIN PASSWORD :'runtime_password';
SQL
