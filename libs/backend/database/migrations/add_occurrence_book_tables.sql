-- Occurrence Book System Migration
-- Created: 2026-01-13
-- Description: Creates tables for tracking incidents involving drivers, passengers, and vehicles

-- Create enums for occurrence categorization
CREATE TYPE occurrence_category AS ENUM (
  'CRIME',
  'TRAFFIC_OFFENSE',
  'SAFETY_VIOLATION',
  'POLICY_VIOLATION',
  'HARASSMENT',
  'FRAUD',
  'PROPERTY_DAMAGE',
  'MEDICAL_EMERGENCY',
  'DISPUTE',
  'SUSPICIOUS_ACTIVITY',
  'VEHICLE_ISSUE',
  'ENVIRONMENTAL'
);

CREATE TYPE occurrence_severity AS ENUM (
  'CRITICAL',  -- SEV-1: Immediate threat to life/safety
  'HIGH',      -- SEV-2: Significant impact, serious violations
  'MEDIUM',    -- SEV-3: Moderate impact, policy violations
  'LOW'        -- SEV-4: Minor incidents, informational
);

CREATE TYPE occurrence_status AS ENUM (
  'OPEN',
  'UNDER_INVESTIGATION',
  'RESOLVED',
  'DISPUTED'
);

CREATE TYPE objection_status AS ENUM (
  'PENDING',
  'UNDER_REVIEW',
  'ACCEPTED',
  'REJECTED'
);

-- Main occurrence records table
CREATE TABLE occurrences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ob_number VARCHAR(50) UNIQUE NOT NULL, -- e.g., "OB-2026-001234"
  
  -- Categorization
  category occurrence_category NOT NULL,
  severity occurrence_severity NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Involved parties (at least one required)
  driver_id UUID REFERENCES driver_profiles(id),
  passenger_id UUID REFERENCES users(id),
  vehicle_id UUID REFERENCES vehicles(id),
  ride_id UUID REFERENCES rides(id),
  
  -- TIME, DATE, and PLACE (Critical Fields)
  occurrence_date DATE NOT NULL, -- Date when incident occurred
  occurrence_time TIME NOT NULL, -- Time when incident occurred
  occurred_at TIMESTAMP NOT NULL, -- Combined timestamp for queries
  
  -- Location Details
  location_lat DECIMAL(10, 8), -- Latitude
  location_lng DECIMAL(11, 8), -- Longitude
  location_address TEXT, -- Full address
  location_place_name VARCHAR(255), -- Landmark/place name
  location_city VARCHAR(100),
  location_country VARCHAR(100) DEFAULT 'Kenya',
  location_details JSONB, -- Additional location metadata
  
  -- Source of occurrence
  source VARCHAR(50) NOT NULL, -- 'SOS', 'RATING', 'COMMENT', 'MANUAL', 'AUTO'
  source_reference_id UUID, -- ID of rating, comment, etc.
  
  -- Registrar information
  registered_by UUID REFERENCES users(id) NOT NULL,
  registered_at TIMESTAMP DEFAULT NOW(),
  
  -- Status
  status occurrence_status DEFAULT 'OPEN',
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,
  
  -- Metadata
  tags TEXT[], -- Additional searchable tags
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT at_least_one_party CHECK (
    driver_id IS NOT NULL OR 
    passenger_id IS NOT NULL OR 
    vehicle_id IS NOT NULL
  )
);

-- Media attachments table
CREATE TABLE occurrence_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  occurrence_id UUID REFERENCES occurrences(id) ON DELETE CASCADE,
  
  media_type VARCHAR(20) NOT NULL, -- 'PHOTO', 'VIDEO', 'AUDIO', 'DOCUMENT'
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  mime_type VARCHAR(100),
  duration INTEGER, -- For audio/video in seconds
  
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  
  description TEXT,
  metadata JSONB -- Additional file metadata
);

-- Objections/Disputes table
CREATE TABLE occurrence_objections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  occurrence_id UUID REFERENCES occurrences(id) ON DELETE CASCADE,
  
  objector_id UUID REFERENCES users(id) NOT NULL,
  objection_text TEXT NOT NULL,
  supporting_evidence JSONB, -- Array of media URLs, documents
  
  status objection_status DEFAULT 'PENDING',
  
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  outcome VARCHAR(50), -- 'UPHELD', 'DISMISSED', 'MODIFIED'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit trail for all changes
CREATE TABLE occurrence_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  occurrence_id UUID REFERENCES occurrences(id) ON DELETE CASCADE,
  
  action VARCHAR(50) NOT NULL, -- 'CREATED', 'UPDATED', 'RESOLVED', 'DISPUTED', 'OBJECTION_FILED'
  actor_id UUID REFERENCES users(id),
  changes JSONB, -- Before/after values
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_occurrences_driver ON occurrences(driver_id);
CREATE INDEX idx_occurrences_passenger ON occurrences(passenger_id);
CREATE INDEX idx_occurrences_vehicle ON occurrences(vehicle_id);
CREATE INDEX idx_occurrences_ride ON occurrences(ride_id);
CREATE INDEX idx_occurrences_category ON occurrences(category);
CREATE INDEX idx_occurrences_severity ON occurrences(severity);
CREATE INDEX idx_occurrences_status ON occurrences(status);
CREATE INDEX idx_occurrences_occurred_at ON occurrences(occurred_at DESC);
CREATE INDEX idx_occurrences_date ON occurrences(occurrence_date DESC);
CREATE INDEX idx_occurrences_location_city ON occurrences(location_city);
CREATE INDEX idx_occurrences_ob_number ON occurrences(ob_number);
CREATE INDEX idx_occurrences_location_coords ON occurrences(location_lat, location_lng);
CREATE INDEX idx_occurrences_source ON occurrences(source);

-- Indexes for media
CREATE INDEX idx_occurrence_media_occurrence ON occurrence_media(occurrence_id);
CREATE INDEX idx_occurrence_media_type ON occurrence_media(media_type);

-- Indexes for objections
CREATE INDEX idx_occurrence_objections_occurrence ON occurrence_objections(occurrence_id);
CREATE INDEX idx_occurrence_objections_objector ON occurrence_objections(objector_id);
CREATE INDEX idx_occurrence_objections_status ON occurrence_objections(status);

-- Indexes for audit log
CREATE INDEX idx_occurrence_audit_occurrence ON occurrence_audit_log(occurrence_id);
CREATE INDEX idx_occurrence_audit_actor ON occurrence_audit_log(actor_id);
CREATE INDEX idx_occurrence_audit_created ON occurrence_audit_log(created_at DESC);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_occurrence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for occurrences table
CREATE TRIGGER trigger_update_occurrence_timestamp
  BEFORE UPDATE ON occurrences
  FOR EACH ROW
  EXECUTE FUNCTION update_occurrence_updated_at();

-- Trigger for objections table
CREATE TRIGGER trigger_update_objection_timestamp
  BEFORE UPDATE ON occurrence_objections
  FOR EACH ROW
  EXECUTE FUNCTION update_occurrence_updated_at();

-- Function to generate OB numbers
CREATE OR REPLACE FUNCTION generate_ob_number()
RETURNS TEXT AS $$
DECLARE
  current_year INTEGER;
  next_sequence INTEGER;
  ob_num TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE);
  
  -- Get the next sequence number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(ob_number FROM 9) AS INTEGER)
  ), 0) + 1
  INTO next_sequence
  FROM occurrences
  WHERE ob_number LIKE 'OB-' || current_year || '-%';
  
  -- Format: OB-YYYY-NNNNNN
  ob_num := 'OB-' || current_year || '-' || LPAD(next_sequence::TEXT, 6, '0');
  
  RETURN ob_num;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE occurrences IS 'Permanent record of all incidents involving drivers, passengers, and vehicles';
COMMENT ON COLUMN occurrences.ob_number IS 'Unique occurrence book number in format OB-YYYY-NNNNNN';
COMMENT ON COLUMN occurrences.occurrence_date IS 'Date when the incident occurred';
COMMENT ON COLUMN occurrences.occurrence_time IS 'Time when the incident occurred';
COMMENT ON COLUMN occurrences.location_place_name IS 'Landmark or place name for easy identification';
COMMENT ON TABLE occurrence_media IS 'Media evidence attached to occurrences (photos, videos, audio)';
COMMENT ON TABLE occurrence_objections IS 'User disputes/objections to occurrence records';
COMMENT ON TABLE occurrence_audit_log IS 'Complete audit trail of all changes to occurrences';
