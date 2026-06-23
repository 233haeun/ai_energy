import React, { useState } from 'react';
import FactorySafetyPopup from './factory_safety_popup';

// 가상 물가 예측 인터페이스
interface PricePrediction {
  month: string;
  avgPrice: number;
  peakPrice: number;
  surplusPrice: number;
  fxRate: number;
  oilPrice: number;
  sentiment: number;
  confidence: number;
  recommendation: string;
}

export default function FactoryDashboard() {
  // 모달 오픈 상태 관리
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState<boolean>(false);
  
  // VPP 설정 제어 상태 관리
  const [autoTrading, setAutoTrading] = useState<boolean>(true);
  const [smartFleetRouting, setSmartFleetRouting] = useState<boolean>(true);
  const [essTargetSoc, setEssTargetSoc] = useState<number>(90);
  const [essSoc, setEssSoc] = useState<number>(48.2);

  // 시뮬레이터 날씨 상태
  const [currentWeather, setCurrentWeather] = useState<'NORMAL' | 'HEAVY_RAIN'>('NORMAL');

  // AI 3개월 물가 예측 데이터셋
  const mockPredictions: PricePrediction[] = [
    {
      month: '7월 (1개월 후)',
      avgPrice: 154.20,
      peakPrice: 224.50,
      surplusPrice: 62.00,
      fxRate: 1375.00,
      oilPrice: 82.20,
      sentiment: 0.10,
      confidence: 0.90,
      recommendation: '호남 지사 ESS의 가용 충전 용량의 60%를 낮 시간 덤핑 전력으로 확보하십시오.',
    },
    {
      month: '8월 (2개월 후)',
      avgPrice: 168.50,
      peakPrice: 248.00,
      surplusPrice: 59.00,
      fxRate: 1400.00,
      oilPrice: 86.40,
      sentiment: -0.15,
      confidence: 0.85,
      recommendation: '원자재 유가 인상 영향 본격화. 야간 방전 V2G 계약률을 20% 상향 권고합니다.',
    },
    {
      month: '9월 (3개월 후)',
      avgPrice: 188.00,
      peakPrice: 278.40,
      surplusPrice: 56.00,
      fxRate: 1425.00,
      oilPrice: 90.60,
      sentiment: -0.40,
      confidence: 0.80,
      recommendation: '피크 가격 20% 폭등 구간 진입. 주차된 통근버스와 대용량 ESS 충전 스케줄을 낮 시간으로 전량 이전하십시오.',
    }
  ];

  // 기상 상태 전환 시뮬레이터 (경고창 수동 팝업 트리거)
  const triggerStormScenario = () => {
    setCurrentWeather('HEAVY_RAIN');
    setIsSafetyModalOpen(true);
  };

  const resetScenario = () => {
    setCurrentWeather('NORMAL');
    setIsSafetyModalOpen(false);
  };

  // API Mock 콜백 핸들러
  const handleApproveLimit = async (logId: number, limit: number) => {
    console.log(`API Call: PATCH /api/safety-guard/${logId} | Limit Capped at ${limit}%`);
    return new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 800));
  };

  const handleSendSOP = async (logId: number) => {
    console.log(`API Call: POST /api/safety-guard/${logId}/send-sop`);
    return new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 800));
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white p-6 font-sans">
      
      {/* 1. 상단 글로벌 대시보드 헤더 */}
      <header className="flex justify-between items-center border-b border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
            ECO-GRID SENS 관리자 관제 시스템
          </h1>
          <p className="text-xs text-gray-400 mt-1">AI 기반 산업단지 에너지 비용 분석 및 비상 가드 모니터</p>
        </div>
        <div className="flex items-center gap-4">
          {/* 기상 경보 숏컷 인디케이터 */}
          <div 
            onClick={triggerStormScenario}
            className={`cursor-pointer px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all duration-300 ${
              currentWeather === 'HEAVY_RAIN' 
                ? 'bg-red-950/40 border-red-500 text-red-400 animate-pulse'
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-700'
            }`}
          >
            <span>{currentWeather === 'HEAVY_RAIN' ? '⛈️ 침수/경보 긴급 상태' : '☀️ 기상 상황 안정'}</span>
            {currentWeather === 'HEAVY_RAIN' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
          </div>
          {currentWeather === 'HEAVY_RAIN' && (
            <button 
              onClick={resetScenario}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg text-xs font-semibold"
            >
              상태 초기화
            </button>
          )}
        </div>
      </header>

      {/* 2. 대시보드 메인 레이아웃 (Grid 3열 분할) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 왼쪽 & 중앙 2열: 물가 예보 및 VPP 가상 발전소 제어 */}
        <div className="lg:col-span-2 flex flex-direction flex-col gap-6">
          
          {/* A. 3개월 물가 예보 차트 카드 */}
          <section className="bg-[#0f172a]/65 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-blue-400">📊</span>
                  글로벌 원자재 환율 연동 3개월 전기 요금 예측
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">환율, 국제유가 WTI, 중동 뉴스 NLP 감성 모델 결합 분석</p>
              </div>
              <span className="text-xs bg-blue-950/60 border border-blue-800/50 text-blue-400 py-1 px-3 rounded-full font-bold">
                Confidence: 85%
              </span>
            </div>

            {/* 가격 분석 그래프 영역 (디비전 스타일링 바) */}
            <div className="space-y-6">
              {mockPredictions.map((pred, idx) => (
                <div key={idx} className="bg-slate-900/30 border border-slate-800/40 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-blue-300">{pred.month}</span>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>환율: <strong className="text-white">₩{pred.fxRate}</strong></span>
                      <span>유가: <strong className="text-white">${pred.oilPrice}</strong></span>
                      <span>뉴스 센티멘트: 
                        <strong className={pred.sentiment < 0 ? 'text-red-400' : 'text-green-400'}>
                          {' '}{pred.sentiment.toFixed(2)}
                        </strong>
                      </span>
                    </div>
                  </div>
                  
                  {/* 게이지 바 차트 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">피크 타임 최고 단가 예측</span>
                      <span className={idx === 2 ? 'text-red-400 font-bold' : 'text-white'}>
                        {pred.peakPrice.toFixed(1)}원 / kWh {idx === 2 && '(+20.0% 폭등)'}
                      </span>
                    </div>
                    {/* 프로그레스 트랙 */}
                    <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          idx === 2 ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-blue-600 to-blue-400'
                        }`} 
                        style={{ width: `${(pred.peakPrice / 300) * 100}%` }} 
                      />
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 bg-gray-950/40 border border-gray-900 rounded-lg p-2.5 leading-relaxed">
                    💡 <strong className="text-gray-200">AI 최적 포트폴리오 제안:</strong> {pred.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* B. VPP 자동/수동 제어 패널 */}
          <section className="bg-[#0f172a]/65 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 shadow-xl">
            <h2 className="text-base font-bold text-white mb-6 flex items-center gap-2 border-b border-gray-800/40 pb-3">
              <span className="text-blue-400">⚡</span>
              공장 대용량 ESS 충방전 및 VPP 지능형 제어
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 스위치 토글 파트 */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI 스케줄링 옵션</h3>
                
                {/* 토글 1 */}
                <div className="flex justify-between items-center p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl">
                  <div>
                    <div className="text-xs font-bold">VPP AI 실시간 자동 입찰 거래</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">출력제어 발생 시 즉시 초저가 충전을 매칭합니다.</div>
                  </div>
                  <button 
                    onClick={() => setAutoTrading(!autoTrading)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                      autoTrading ? 'bg-blue-500' : 'bg-gray-800'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                      autoTrading ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* 토글 2 */}
                <div className="flex justify-between items-center p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl">
                  <div>
                    <div className="text-xs font-bold">사내 EV 셔틀/업무 차량 자동 분배</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">운행 데이터에 기초하여 충전 한계 마진을 강제 관리합니다.</div>
                  </div>
                  <button 
                    onClick={() => setSmartFleetRouting(!smartFleetRouting)}
                    className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                      smartFleetRouting ? 'bg-blue-500' : 'bg-gray-800'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                      smartFleetRouting ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* ESS 용량 프로그레스 제어 파트 */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">단지 내 대용량 ESS 충전율 상태</h3>
                
                <div className="bg-slate-900/30 border border-slate-800/40 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">현재 충전 레벨</span>
                    <span className="font-bold text-blue-400">{essSoc.toFixed(1)}%</span>
                  </div>
                  {/* 프로그레스 바 트랙 */}
                  <div className="h-5 bg-gray-950 rounded-lg overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                      style={{ width: `${essSoc}%` }}
                    />
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-yellow-400 z-10"
                      style={{ left: `${essTargetSoc}%` }}
                      title={`목표 설정값: ${essTargetSoc}%`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>최소 방전 보호: 20%</span>
                    <span className="text-yellow-400 font-bold">목표 충전선: {essTargetSoc}%</span>
                  </div>
                  {/* 수동 조작 컨트롤 버튼 */}
                  <div className="flex gap-2 pt-1.5">
                    <button onClick={() => setEssTargetSoc(80)} className={`flex-1 text-[10px] py-1 rounded border ${essTargetSoc === 80 ? 'border-yellow-500 text-yellow-500 bg-yellow-950/20' : 'border-gray-800 text-gray-400 bg-transparent'}`}>80% 목표</button>
                    <button onClick={() => setEssTargetSoc(90)} className={`flex-1 text-[10px] py-1 rounded border ${essTargetSoc === 90 ? 'border-yellow-500 text-yellow-500 bg-yellow-950/20' : 'border-gray-800 text-gray-400 bg-transparent'}`}>90% 목표</button>
                    <button onClick={() => setEssTargetSoc(100)} className={`flex-1 text-[10px] py-1 rounded border ${essTargetSoc === 100 ? 'border-yellow-500 text-yellow-500 bg-yellow-950/20' : 'border-gray-800 text-gray-400 bg-transparent'}`}>100% 가득</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* 오른쪽 3번째 열: 세이프티 가드 상태 및 침수 재해 긴급 경보 요약 */}
        <div className="flex flex-col gap-6">
          
          <section className="bg-[#0f172a]/65 backdrop-blur-md border border-gray-800/80 rounded-2xl p-6 shadow-xl flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2 border-b border-gray-800/40 pb-3">
                <span className="text-red-400">🛡️</span>
                세이프티 가드 실시간 보안 리포트
              </h2>

              <div className="space-y-4">
                {/* 현재 종합 등급 서머리 */}
                <div className="flex items-center gap-4 bg-slate-900/30 border border-slate-800/40 rounded-xl p-4">
                  <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-4 font-bold ${
                    currentWeather === 'HEAVY_RAIN'
                      ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] text-red-500'
                      : 'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] text-green-500'
                  }`}>
                    <span className="text-lg leading-none font-extrabold">{currentWeather === 'HEAVY_RAIN' ? '58' : '98'}</span>
                    <span className="text-[8px] mt-0.5">{currentWeather === 'HEAVY_RAIN' ? '등급 C' : '등급 A'}</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">종합 전력 안전성 지수</h4>
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">
                      {currentWeather === 'HEAVY_RAIN' 
                        ? '침수 센서 비상 상태 감지. 급격한 고전압 충방전의 화재 및 위험 요소 조정을 요함.' 
                        : '기상청 기상 정보 및 설비 누전 전위차 모두 정상 가동 범위입니다.'}
                    </p>
                  </div>
                </div>

                {/* 경보 세부 내역 */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-gray-900 py-2">
                    <span className="text-gray-400">• 배터리 팩 내부 온도</span>
                    <span className={currentWeather === 'HEAVY_RAIN' ? 'text-yellow-400' : 'text-gray-200'}>
                      {currentWeather === 'HEAVY_RAIN' ? '34.2 °C' : '26.5 °C'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-900 py-2">
                    <span className="text-gray-400">• 충방전 정격 가중치</span>
                    <span className={currentWeather === 'HEAVY_RAIN' ? 'text-red-400 font-bold' : 'text-gray-200'}>
                      {currentWeather === 'HEAVY_RAIN' ? '40% 제한 가동' : '100% 개방'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">• 침수 감지 센서 3호</span>
                    <span className={currentWeather === 'HEAVY_RAIN' ? 'text-red-500 font-bold' : 'text-green-500'}>
                      {currentWeather === 'HEAVY_RAIN' ? '수위 상승 감지' : '비감지 (정상)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 재해 경보용 배너 & 모달 수동 팝업 버튼 */}
            <div className="mt-6 space-y-3">
              {currentWeather === 'HEAVY_RAIN' ? (
                <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-400 leading-normal animate-pulse">
                  <span>⚠️</span>
                  <div>
                    <strong>폭우 침수 시 사고 리스크 40% 증가</strong>
                    <p className="text-[10px] text-gray-500 mt-0.5">V2G 방전 전류 하향 조정을 위한 긴급 조치 팝업을 여십시오.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-950/10 border border-green-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-green-400 leading-normal">
                  <span>✓</span>
                  <div>
                    <strong>기상 이변 리스크 감쇄 안정</strong>
                    <p className="text-[10px] text-gray-500 mt-0.5">현재 안전 상태 모니터 수칙이 통제 하에 정상 작동 중입니다.</p>
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsSafetyModalOpen(true)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs border transition-colors ${
                  currentWeather === 'HEAVY_RAIN'
                    ? 'bg-red-600 hover:bg-red-500 text-white border-transparent'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700'
                }`}
              >
                {currentWeather === 'HEAVY_RAIN' ? '🚨 긴급 안전 조치 팝업 열기' : '안전 감시 보고 모달 열기'}
              </button>
            </div>
          </section>

        </div>

      </div>

      {/* 3. 리액트 세이프티 경고 팝업 컴포넌트 마운트 및 연동 */}
      <FactorySafetyPopup 
        isOpen={isSafetyModalOpen}
        alertData={{
          logId: 1042,
          alertLevel: currentWeather === 'HEAVY_RAIN' ? 'CRITICAL' : 'WARNING',
          riskFactor: currentWeather === 'HEAVY_RAIN' ? 'HEAVY_RAIN_FLOODING' : 'NORMAL_MONITORING',
          weatherCondition: currentWeather === 'HEAVY_RAIN' ? '폭우' : '맑음',
          riskProbabilityPercent: currentWeather === 'HEAVY_RAIN' ? 40 : 0,
          description: '과거 데이터 기계학습 대조 결과 폭우 침수 구간 방전은 감전 우려가 매우 큽니다.',
          recommendedV2gDischargeLimit: 40,
          factoryName: '호남 에너지 밸리 1공장'
        }}
        onApproveLimit={handleApproveLimit}
        onSendSOP={handleSendSOP}
        onClose={() => setIsSafetyModalOpen(false)}
      />

    </div>
  );
}
