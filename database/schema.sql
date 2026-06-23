-- AI 기반 산업단지형 스마트 에너지 물가 최적화 및 세이프티 가드 플랫폼
-- PostgreSQL Database Schema Definition (DDL)

-- 1. 사용자 테이블 (일반 EV 운전자 및 공장 관리자 공통)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('EV_DRIVER', 'FACTORY_MANAGER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. EV 차량 상세 정보 테이블 (EV 운전자용)
CREATE TABLE ev_details (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    battery_capacity_kwh NUMERIC(5, 2) NOT NULL, -- 예: 77.40 kWh
    min_safety_soc INTEGER NOT NULL DEFAULT 20,   -- 최저 안전 SoC 한계 (%)
    target_soc_commute INTEGER NOT NULL DEFAULT 30, -- 출퇴근용 보존 SoC (%)
    commute_start_time TIME NOT NULL DEFAULT '08:30:00',
    commute_end_time TIME NOT NULL DEFAULT '18:30:00',
    vpp_opt_in BOOLEAN DEFAULT TRUE,             -- VPP 자동 참여 설정 동의 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. EV 실시간 상태 테이블 (시계열 성격 데이터 - InfluxDB 이중화 권장 구조)
CREATE TABLE ev_status (
    id BIGSERIAL PRIMARY KEY,
    ev_id INTEGER NOT NULL REFERENCES ev_details(id) ON DELETE CASCADE,
    current_soc INTEGER NOT NULL CHECK (current_soc BETWEEN 0 AND 100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('CHARGING', 'DISCHARGING_V2G', 'IDLE', 'DRIVING')),
    latitude NUMERIC(9, 6),
    longitude NUMERIC(10, 6),
    grid_connected BOOLEAN DEFAULT FALSE,         -- 현재 충전기 물리 연동 여부
    current_power_kw NUMERIC(6, 2) DEFAULT 0.00,  -- + 충전 중인 전력 / - V2G 방전 중인 전력
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 공장 ESS 설비 실시간 상태 테이블
CREATE TABLE factory_ess (
    id SERIAL PRIMARY KEY,
    manager_id INTEGER NOT NULL REFERENCES users(id),
    factory_name VARCHAR(150) NOT NULL,
    location VARCHAR(255) NOT NULL,
    max_capacity_kwh NUMERIC(7, 2) NOT NULL,     -- 예: 2000.00 kWh (2MWh)
    current_soc NUMERIC(5, 2) NOT NULL CHECK (current_soc BETWEEN 0.00 AND 100.00),
    status VARCHAR(20) NOT NULL CHECK (status IN ('CHARGING', 'DISCHARGING', 'IDLE', 'MAINTENANCE')),
    current_power_kw NUMERIC(6, 2) DEFAULT 0.00,  -- 충방전 kW량
    grid_tariff_krw NUMERIC(6, 2) DEFAULT 0.00,   -- 실시간 구매 전기 단가 (원/kWh)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AI 물가 및 가격 예측 테이블 (원자재/뉴스 분석 예측 정보 포함)
CREATE TABLE price_predictions (
    id SERIAL PRIMARY KEY,
    target_date DATE NOT NULL,                     -- 예측 대상 일자
    predicted_avg_kwh_price NUMERIC(6, 2) NOT NULL, -- 예측된 평균 단가 (원)
    predicted_highest_peak_price NUMERIC(6, 2) NOT NULL, -- 수요 피크 예측 최고 단가
    predicted_lowest_surplus_price NUMERIC(6, 2) NOT NULL, -- 출력제어 잉여 전력 최저 단가
    fx_rate_usd_krw NUMERIC(6, 2),                 -- 당시 연동 환율 (원자재 AI 분석용)
    oil_price_wti_usd NUMERIC(5, 2),               -- 당시 국제유가 WTI (원자재 AI 분석용)
    nlp_news_sentiment NUMERIC(3, 2),             -- 뉴스 데이터 분석 감성 지수 (-1.00 ~ 1.00)
    prediction_confidence NUMERIC(3, 2) CHECK (prediction_confidence BETWEEN 0.00 AND 1.00), -- AI 예측 신뢰도
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. 세이프티 가드 재해 리스크 및 제어 경보 로그 테이블
CREATE TABLE safety_logs (
    id SERIAL PRIMARY KEY,
    factory_ess_id INTEGER REFERENCES factory_ess(id) ON DELETE SET NULL,
    alert_level VARCHAR(20) NOT NULL CHECK (alert_level IN ('INFO', 'WARNING', 'CRITICAL')),
    risk_factor VARCHAR(100) NOT NULL,            -- 예: 'HEAVY_RAIN_FLOODING', 'OVERHEATING'
    description TEXT NOT NULL,                     -- 상세 경보 설명
    weather_condition VARCHAR(100) NOT NULL,       -- 감지 기상 (폭우, 태풍, 폭염 등)
    risk_probability_percent INTEGER NOT NULL CHECK (risk_probability_percent BETWEEN 0 AND 100), -- 사고 유발 확률 증가폭
    recommended_v2g_discharge_limit INTEGER,       -- 권장 V2G 출력 상한제 (%) (예: 40% 제한)
    sop_sent BOOLEAN DEFAULT FALSE,               -- 현장 안전 조치(SOP) 스마트폰 전송 여부
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 데이터베이스 성능 최적화를 위한 인덱스 생성
CREATE INDEX idx_ev_status_ev_id ON ev_status(ev_id);
CREATE INDEX idx_ev_status_updated_at ON ev_status(updated_at DESC);
CREATE INDEX idx_factory_ess_updated_at ON factory_ess(updated_at DESC);
CREATE INDEX idx_price_predictions_date ON price_predictions(target_date);
CREATE INDEX idx_safety_logs_created_at ON safety_logs(created_at DESC);
