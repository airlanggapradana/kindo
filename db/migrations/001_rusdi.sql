CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS knowledge_releases (
  id text PRIMARY KEY, bank_hash text NOT NULL, source_hash text NOT NULL,
  embedding_model text NOT NULL, embedding_dimensions integer NOT NULL CHECK (embedding_dimensions = 768),
  active boolean NOT NULL DEFAULT false, published_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS single_active_release ON knowledge_releases ((active)) WHERE active;
CREATE TABLE IF NOT EXISTS knowledge_documents (
  release_id text NOT NULL REFERENCES knowledge_releases(id) ON DELETE CASCADE,
  id text NOT NULL, title text NOT NULL, content text NOT NULL, keywords jsonb NOT NULL,
  action text, PRIMARY KEY (release_id, id)
);
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  release_id text NOT NULL, document_id text NOT NULL, ordinal integer NOT NULL,
  content text NOT NULL, embedding vector(768), PRIMARY KEY (release_id, document_id, ordinal),
  FOREIGN KEY (release_id, document_id) REFERENCES knowledge_documents(release_id, id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS questionnaire_forms (
  release_id text NOT NULL REFERENCES knowledge_releases(id) ON DELETE CASCADE,
  age_months integer NOT NULL, source_file text NOT NULL, source_hash text NOT NULL, source_sheet text NOT NULL,
  PRIMARY KEY (release_id, age_months)
);
CREATE TABLE IF NOT EXISTS questionnaire_questions (
  release_id text NOT NULL, age_months integer NOT NULL, number integer NOT NULL,
  source_text text NOT NULL, app_text text NOT NULL, category text NOT NULL,
  original_category text NOT NULL, source_row integer NOT NULL,
  PRIMARY KEY (release_id, age_months, number),
  FOREIGN KEY (release_id, age_months) REFERENCES questionnaire_forms(release_id, age_months) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS rusdi_feedback (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, request_id uuid NOT NULL,
  uid text NOT NULL, release_id text NOT NULL REFERENCES knowledge_releases(id),
  helpful boolean NOT NULL, reason text CHECK (reason IN ('incorrect','unclear','missing_source','other')),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (request_id, uid)
);
GRANT USAGE ON SCHEMA public TO rusdi_runtime;
GRANT SELECT ON knowledge_releases, knowledge_documents, knowledge_chunks, questionnaire_forms, questionnaire_questions TO rusdi_runtime;
GRANT INSERT ON rusdi_feedback TO rusdi_runtime;
GRANT USAGE ON SEQUENCE rusdi_feedback_id_seq TO rusdi_runtime;
