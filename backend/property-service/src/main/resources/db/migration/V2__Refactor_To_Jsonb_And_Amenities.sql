-- 1. Conversão de tipos de dados para suporte a múltiplos idiomas (JSONB)
-- O comando USING garante que o conteúdo atual seja convertido para o formato binário JSON
ALTER TABLE amenities ALTER COLUMN name TYPE JSONB USING name::jsonb;
ALTER TABLE properties ALTER COLUMN description TYPE JSONB USING description::jsonb;

-- 2. Expansão do modelo de dados (Novas colunas)
ALTER TABLE amenities ADD COLUMN IF NOT EXISTS icon VARCHAR(255);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- 3. Criação da tabela de junção para a relação Many-to-Many
-- Isto permite associar múltiplas comodidades a várias propriedades
CREATE TABLE IF NOT EXISTS property_amenities (
                                                  amenity_id  BIGINT NOT NULL,
                                                  property_id BIGINT NOT NULL,
                                                  CONSTRAINT pk_property_amenities PRIMARY KEY (amenity_id, property_id),
    CONSTRAINT fk_proame_on_amenity FOREIGN KEY (amenity_id) REFERENCES amenities (id),
    CONSTRAINT fk_proame_on_property FOREIGN KEY (property_id) REFERENCES properties (id)
    );

-- 4. Ajuste de Constraints
-- Se o nome único no V1 estiver a causar problemas com o formato JSONB, podemos removê-lo
ALTER TABLE amenities DROP CONSTRAINT IF EXISTS uc_amenities_name;