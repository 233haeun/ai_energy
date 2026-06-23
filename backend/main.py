# AI 기반 산업단지형 스마트 에너지 물가 최적화 및 세이프티 가드 플랫폼
# Backend API Service using Python FastAPI

import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="ECO-GRID SENS API Service",
    description="VPP 스마트 전력 중개 및 세이프티 가드 모바일/웹 백엔드 아키텍처 API 초안",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 연동)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

# ----------------------------------------------------
# PYDANTIC DATA SCHEMAS
# ----------------------------------------------------

# 1. 가격 예측 모델 스키마
class PricePredictionResponse(BaseModel):
    target_date: datetime.date = Field(..., description="예측 일자")
    predicted_avg_kwh_price: float = Field(..., description="예측 평균 전력 단가 (원/kWh)")
    predicted_highest_peak_price: float = Field(..., description="수요 피크 시간대 최고 단가")
    predicted_lowest_surplus_price: float = Field(..., description="낮 시간 태양광 과잉 잉여 단가")
    fx_rate_usd_krw: float = Field(..., description="예측 달러 환율")
    oil_price_wti_usd: float = Field(..., description="예측 WTI 유가")
    nlp_news_sentiment: float = Field(..., description="중동/원자재 뉴스 감성 분석 지수 (-1.0 ~ 1.0)")
    prediction_confidence: float = Field(..., description="AI 예측 신뢰도 지수 (0.0 ~ 1.0)")
    ai_recommendation_sop: str = Field(..., description="공장 ESS 및 VPP 포트폴리오 관리 조치 사항")

# 2. 안전 진단 요청/응답 스키마
class SafetyCheckRequest(BaseModel):
    factory_id: int = Field(..., example=1)
    ess_id: int = Field(..., example=104)
    current_weather: str = Field(..., description="기상 정보 (NORMAL | HEAVY_RAIN | HEAT_WAVE | TYPHOON)")
    v2g_active_discharge_kw: float = Field(..., description="현재 전기차 V2G 역송전 및 ESS 방전 용량 합산 (kW)")
    current_ess_temp_celsius: float = Field(..., description="ESS 실시간 온도 (°C)")

class SafetyCheckResponse(BaseModel):
    is_alert_active: bool = Field(..., description="경고 발생 여부")
    alert_level: str = Field(..., description="경보 수준 (INFO | WARNING | CRITICAL)")
    risk_factor: str = Field(..., description="위험 요인 식별 코드")
    risk_probability_increase_percent: int = Field(..., description="과거 대조 사고 위험 상승 백분율")
    recommended_discharge_limit_percent: Optional[int] = Field(None, description="권장 V2G/ESS 방전 상한선 (%)")
    safety_sop_manual: str = Field(..., description="현장 조치 표준 운영 가이드 (SOP)")

# 3. EV 스케줄 생성 요청/응답 스키마
class EVScheduleRequest(BaseModel):
    ev_id: int = Field(..., example=42)
    current_soc: int = Field(..., ge=0, le=100, description="현재 배터리 잔량 (%)")
    target_soc_commute: int = Field(..., ge=10, le=90, description="출퇴근을 위해 보존해야 할 최소 잔량 (%)")
    parked_start_time: str = Field(..., example="09:30", description="사내 주차 개시 예상 시간")
    parked_end_time: str = Field(..., example="18:00", description="퇴근 예상 시간")
    battery_capacity_kwh: float = Field(..., example=77.4, description="배터리 용량 (kWh)")

class ScheduleBlock(BaseModel):
    time_slot: str = Field(..., description="스케줄 시간 구간 (HH:MM - HH:MM)")
    action_type: str = Field(..., description="충방전 행위 (CHARGE_SURPLUS | DISCHARGE_V2G | IDLE)")
    applied_tariff_krw: float = Field(..., description="적용 단가 (원/kWh)")
    estimated_power_kw: float = Field(..., description="예상 충방전 전력 (kW)")

class EVScheduleResponse(BaseModel):
    ev_id: int
    optimization_score: float = Field(..., description="VPP 스케줄 매칭 최적화 점수 (0.0 ~ 100.0)")
    expected_net_saving_krw: int = Field(..., description="VPP 참여로 절약/수익화 예상되는 일일 비용 (원)")
    schedule: List[ScheduleBlock] = Field(..., description="24시간 스케줄 타임라인 블록")

# ----------------------------------------------------
# API ENDPOINTS
# ----------------------------------------------------

# [Endpoint 1] 글로벌 원자재 뉴스 NLP 기반 향후 3개월 물가/전력 가격 예측 API
@app.get(
    "/api/price-predictions", 
    response_model=List[PricePredictionResponse], 
    summary="향후 3개월 물가 및 전력단가 예측 정보를 반환합니다."
)
async def get_price_predictions(
    months: int = Query(3, ge=1, le=12, description="예측 기간 (개월수)")
):
    # 실제 환경: DB(price_predictions) 혹은 실시간 시계열 AI 모델 추론 파이프라인 호출
    # 본 코드: 글로벌 정세 NLP 및 유가/환율 상승을 시뮬레이션하는 AI 가상 모델
    predictions = []
    base_date = datetime.date.today()
    
    # 3개월 미래 물가 인상 시나리오 가상 반영
    for i in range(1, months + 1):
        target_date = base_date + datetime.timedelta(days=30 * i)
        
        # 환율 및 유가 상승에 따라 점진적으로 증가하는 가격 및 AI 리스크 스코어 계산
        fx_rate = 1350.0 + (i * 25.0)
        oil_price = 78.0 + (i * 4.2)
        sentiment = 0.35 - (i * 0.25) # 뉴스 부정 정세 고조 (-0.15, -0.40 등)
        
        predicted_avg = 150.0 + (i * 18.0) # 기본 단가 월평균 점진 상승
        predicted_peak = 220.0 + (i * 24.0) # 피크 가격 폭등 (+20%)
        predicted_surplus = 65.0 - (i * 3.0)  # 출력 제어 잉여 전력량 증가로 초저가 덤핑 가격 하락
        
        confidence = 0.95 - (i * 0.05) # 먼 미래일수록 신뢰도 약 감소
        
        sop = (
            f"3개월 뒤 고환율 및 연료비 인상에 의해 전력 피크 요금이 {100 + (i*8)}% 이상 상승할 것입니다. "
            f"호남/제주 지역의 낮 시간대 출력제어 발생 시(최저 {predicted_surplus:.0f}원) 전력을 가상발전소(VPP)를 통해 최대로 수급하여 "
            f"자체 ESS 및 주차 차량에 가득 충전하고, 저녁 피크 시간대 사용량을 대폭 절감하십시오."
        )
        
        predictions.append(
            PricePredictionResponse(
                target_date=target_date,
                predicted_avg_kwh_price=round(predicted_avg, 2),
                predicted_highest_peak_price=round(predicted_peak, 2),
                predicted_lowest_surplus_price=round(predicted_surplus, 2),
                fx_rate_usd_krw=round(fx_rate, 2),
                oil_price_wti_usd=round(oil_price, 2),
                nlp_news_sentiment=round(sentiment, 2),
                prediction_confidence=round(confidence, 2),
                ai_recommendation_sop=sop
            )
        )
    return predictions


# [Endpoint 2] 침수/과열 재해 위험도 예측 및 V2G 제한 세이프티 가드 통제 API
@app.post(
    "/api/safety-guard/check", 
    response_model=SafetyCheckResponse,
    summary="공장의 기상 상황과 ESS 온도를 기준으로 실시간 V2G/ESS 충방전 위험성을 분석하여 긴급 통제합니다."
)
async def check_safety_guard(request: SafetyCheckRequest):
    # 실제 환경: 과거 재해 이력 매핑 머신러닝 모델 추론 연동
    # 본 코드: 폭우/폭염 시 감전/배터리 폭주 위험 연동 알고리즘 시뮬레이션
    
    is_alert = False
    level = "INFO"
    risk_factor = "NONE"
    prob_increase = 0
    limit_percent = 100
    sop = "모든 설비가 정상 범위 내에 가동 중입니다. 계통 연동 V2G 및 ESS 충방전 성능 100% 개방을 유지하십시오."
    
    # 1. 폭우 또는 태풍 경보 발생 시
    if request.current_weather in ["HEAVY_RAIN", "TYPHOON"]:
        is_alert = True
        level = "CRITICAL"
        risk_factor = "WEATHER_FLOOD_SHOCK_HAZARD"
        prob_increase = 40 # 감전 및 화재 위험률 40% 증가 판단
        limit_percent = 40  # V2G 방전 전류를 정격의 40% 이하로 제어 권고
        
        sop = (
            f"⛈️ [긴급 제어 수칙] {request.factory_id}번 공장 단지 내 긴급 기상 경보({request.current_weather})가 감지되었습니다. "
            f"강우 및 침수 조건에서 과도한 양방향 방전(V2G)은 배터리 팩 내부 전위 차 변동성 증가 및 배터리 온도 상승을 유발하여 화재/감전 사고 발생 확률을 크게 높입니다. "
            f"1) 전기차 주차장 V2G 가동률을 {limit_percent}%로 강제 제한하십시오. "
            f"2) 야외 ESS 외함 주변 배수 펌프 가동을 수동 점검하고, 누전 차단기 동작 상태를 모니터링하십시오."
        )
    
    # 2. 폭염 및 배터리 자체 온도 상승 시
    elif request.current_ess_temp_celsius > 35.0 or request.current_weather == "HEAT_WAVE":
        is_alert = True
        level = "WARNING"
        risk_factor = "ESS_BATTERY_OVERHEATING"
        
        # 온도 비례 위험 확률 상승 수식 모델
        excess_temp = max(0.0, request.current_ess_temp_celsius - 25.0)
        prob_increase = min(100, int(excess_temp * 3))
        limit_percent = 60 # 고온 시 60% 출력 제한 권고
        
        sop = (
            f"🔥 [고온 경고] 공장 ESS 온도({request.current_ess_temp_celsius}°C)가 위험 임계값을 초과했습니다. "
            f"자체 열폭주 방지를 위해 VPP 방전 스케줄을 즉각 감쇄(상한 {limit_percent}%)하고 공조 장치 냉각 성능을 최대로 가동하십시오."
        )
        
    return SafetyCheckResponse(
        is_alert_active=is_alert,
        alert_level=level,
        risk_factor=risk_factor,
        risk_probability_increase_percent=prob_increase,
        recommended_discharge_limit_percent=limit_percent,
        safety_sop_manual=sop
    )


# [Endpoint 3] 개인 EV 생활패턴 분석 기반 최적화 VPP 충방전 스케줄 생성 API
@app.post(
    "/api/ev/schedule", 
    response_model=EVScheduleResponse,
    summary="개인 생활패턴 분석 결과를 기반으로 내일 하루의 24시간 VPP 충방전 스케줄을 자동으로 작성합니다."
)
async def generate_ev_schedule(request: EVScheduleRequest):
    # 실제 환경: 시계열 데이터 모델 학습 (차주 출퇴근 캘린더, 배터리 소모율 분석)
    # 본 코드: 출력제어 요금 할인 매칭 알고리즘
    
    schedule_blocks = []
    
    # 00:00 ~ 08:00 (자택 주거 시간대 - 대기 혹은 일반 완속)
    schedule_blocks.append(
        ScheduleBlock(
            time_slot="00:00 - 08:00",
            action_type="IDLE",
            applied_tariff_krw=220.0,
            estimated_power_kw=0.0
        )
    )
    
    # 08:00 ~ 09:30 (출근 이동 시간대)
    schedule_blocks.append(
        ScheduleBlock(
            time_slot="08:00 - 09:30",
            action_type="IDLE",
            applied_tariff_krw=0.0,
            estimated_power_kw=0.0
        )
    )
    
    # 09:30 ~ 13:30 (회사 주차 및 태양광 과잉생산 유도 충전 구간 - 단가 70% 할인 적용)
    schedule_blocks.append(
        ScheduleBlock(
            time_slot="10:00 - 13:30",
            action_type="CHARGE_SURPLUS",
            applied_tariff_krw=65.0,
            estimated_power_kw=11.0 # 11kW 완속 충전기로 급속 흡수
        )
    )
    
    # 13:30 ~ 18:00 (사내 주차 대기 시간)
    schedule_blocks.append(
        ScheduleBlock(
            time_slot="13:30 - 18:00",
            action_type="IDLE",
            applied_tariff_krw=220.0,
            estimated_power_kw=0.0
        )
    )
    
    # 18:00 ~ 19:30 (퇴근 이동 시간대)
    schedule_blocks.append(
        ScheduleBlock(
            time_slot="18:00 - 19:30",
            action_type="IDLE",
            applied_tariff_krw=0.0,
            estimated_power_kw=0.0
        )
    )
    
    # 19:30 ~ 22:00 (가정 주차 및 수요 피크 연동 V2G 방전 판매 구간 - 단가 240원 매입)
    # 안전 출퇴근 SoC 30% 마진을 지키면서 남는 전력을 V2G로 방전
    usable_v2g_percent = max(0, request.current_soc - request.target_soc_commute - 10)
    v2g_power = 6.0 if usable_v2g_percent > 10 else 0.0 # 배터리 여유에 따른 출력 차등
    
    schedule_blocks.append(
        ScheduleBlock(
            time_slot="20:00 - 22:00",
            action_type="DISCHARGE_V2G" if v2g_power > 0 else "IDLE",
            applied_tariff_krw=240.0,
            estimated_power_kw=-v2g_power # 마이너스 출력은 계통으로 방전을 의미
        )
    )
    
    # 22:00 ~ 24:00 (야간 대기)
    schedule_blocks.append(
        ScheduleBlock(
            time_slot="22:00 - 24:00",
            action_type="IDLE",
            applied_tariff_krw=220.0,
            estimated_power_kw=0.0
        )
    )
    
    # 기대 절감 및 판매 수익 산출
    charged_kwh = 11.0 * 3.5 # 10:00 ~ 13:30 (3.5시간) 충전 = 38.5 kWh
    discharged_kwh = v2g_power * 2.0 # 20:00 ~ 22:00 (2시간) 방전 = 12 kWh (가상)
    
    # 일반 요금(220원) 충전 대비 할인 충전(65원)으로 아낀 비용: 38.5 * 155원 = 5,967원
    # V2G 역판매 수익: 12kWh * 240원 = 2,880원 (순이익)
    expected_savings = int((charged_kwh * 155.0) + (discharged_kwh * 240.0))
    
    return EVScheduleResponse(
        ev_id=request.ev_id,
        optimization_score=92.5 if v2g_power > 0 else 70.0,
        expected_net_saving_krw=expected_savings,
        schedule=schedule_blocks
    )
