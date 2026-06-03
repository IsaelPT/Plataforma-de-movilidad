-- 001_initial_schema.sql
-- Ride-Service: PostgreSQL + PostGIS Schema
-- This runs automatically on first PostGIS container start

CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- DRIVERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'disponible'
        CHECK (status IN ('disponible', 'ocupado', 'offline')),
    is_active BOOLEAN DEFAULT true,
    current_location GEOGRAPHY(Point, 4326),
    last_location_update TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_drivers_location
    ON drivers USING GIST (current_location);

CREATE INDEX IF NOT EXISTS idx_drivers_status
    ON drivers (status)
    WHERE status = 'disponible';

-- ============================================================================
-- RIDES (viajes)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL,
    driver_id UUID REFERENCES drivers(id),
    origin GEOGRAPHY(Point, 4326) NOT NULL,
    origin_address TEXT,
    destination GEOGRAPHY(Point, 4326) NOT NULL,
    destination_address TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'solicitado'
        CHECK (status IN (
            'solicitado',
            'en_camino',
            'llego',
            'iniciado',
            'finalizado',
            'cancelado_cliente',
            'cancelado_conductor'
        )),
    estimated_distance_km DECIMAL(10,2),
    estimated_duration_min DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    route_polyline JSONB,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rides_status ON rides (status);
CREATE INDEX IF NOT EXISTS idx_rides_passenger ON rides (passenger_id);

-- ============================================================================
-- SCHEDULED RIDES (reservas programadas - HU10)
-- ============================================================================
CREATE TABLE IF NOT EXISTS scheduled_rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL,
    origin_lon DECIMAL(10,7) NOT NULL,
    origin_lat DECIMAL(10,7) NOT NULL,
    destination_lon DECIMAL(10,7) NOT NULL,
    destination_lat DECIMAL(10,7) NOT NULL,
    origin_address TEXT,
    destination_address TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    search_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'programado'
        CHECK (status IN ('programado', 'buscando', 'completado', 'cancelado')),
    ride_id UUID REFERENCES rides(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT min_advance CHECK (scheduled_at > NOW() + INTERVAL '1 hour')
);

CREATE INDEX IF NOT EXISTS idx_scheduled_rides_search
    ON scheduled_rides (status, search_at);

-- ============================================================================
-- DRIVER OFFERS (ofertas a conductores - HU09)
-- ============================================================================
CREATE TABLE IF NOT EXISTS driver_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (status IN ('pendiente', 'aceptada', 'rechazada', 'expirada')),
    offered_at TIMESTAMPTZ DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_driver_offers_ride ON driver_offers (ride_id);
CREATE INDEX IF NOT EXISTS idx_driver_offers_driver ON driver_offers (driver_id);

-- ============================================================================
-- CANCELLATIONS (cancelaciones - HU12, HU14)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cancellations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id),
    cancelled_by VARCHAR(20) NOT NULL
        CHECK (cancelled_by IN ('cliente', 'conductor')),
    reason_code VARCHAR(50),
    notes TEXT,
    cancelled_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cancellations_ride ON cancellations (ride_id);

-- ============================================================================
-- CANCELLATION REASONS (motivos predefinidos - HU14)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cancellation_reasons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(200) NOT NULL,
    for_driver BOOLEAN DEFAULT true,
    for_passenger BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true
);

-- ============================================================================
-- TRUSTED CONTACTS (contactos de confianza - HU18)
-- ============================================================================
CREATE TABLE IF NOT EXISTS trusted_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    passenger_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_phone CHECK (phone ~ '^\+?[1-9]\d{1,14}$')
);

CREATE INDEX IF NOT EXISTS idx_trusted_contacts_passenger ON trusted_contacts (passenger_id);

-- ============================================================================
-- SOS ALERTS (botón de pánico - HU19)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sos_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id),
    passenger_id UUID NOT NULL,
    driver_id UUID REFERENCES drivers(id),
    location_lon DECIMAL(10,7) NOT NULL,
    location_lat DECIMAL(10,7) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'activa'
        CHECK (status IN ('activa', 'atendida', 'resuelta')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON sos_alerts (status);

-- ============================================================================
-- SEED DATA: default cancellation reasons
-- ============================================================================
INSERT INTO cancellation_reasons (code, label, for_driver, for_passenger)
VALUES
    ('CLIENTE_CAMBIO_PLANES', 'Cambio de planes', false, true),
    ('CLIENTE_TIEMPO_ESPERA', 'Tiempo de espera muy largo', false, true),
    ('CLIENTE_OTRO', 'Otro motivo', false, true),
    ('CONDUCTOR_TRAFICO', 'Tráfico intenso', true, false),
    ('CONDUCTOR_VEHICULO', 'Problemas con el vehículo', true, false),
    ('CONDUCTOR_EMERGENCIA', 'Emergencia personal', true, false),
    ('CONDUCTOR_UBICACION', 'Ubicación del cliente muy lejana', true, false),
    ('CONDUCTOR_OTRO', 'Otro motivo', true, false)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- FUNCTION: find nearby available drivers (PostGIS spatial query)
-- ============================================================================
CREATE OR REPLACE FUNCTION find_nearby_drivers(
    ref_lat DECIMAL,
    ref_lon DECIMAL,
    radius_meters DECIMAL
)
RETURNS TABLE(
    driver_id UUID,
    user_id UUID,
    distance_meters DECIMAL
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        d.id,
        d.user_id,
        ST_Distance(
            d.current_location,
            ST_SetSRID(ST_MakePoint(ref_lon, ref_lat), 4326)::GEOGRAPHY
        ) AS distance_meters
    FROM drivers d
    WHERE d.status = 'disponible'
      AND d.is_active = true
      AND ST_DWithin(
          d.current_location,
          ST_SetSRID(ST_MakePoint(ref_lon, ref_lat), 4326)::GEOGRAPHY,
          radius_meters
      )
    ORDER BY distance_meters ASC;
$$;
