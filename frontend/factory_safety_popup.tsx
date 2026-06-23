import React, { useState } from 'react';

// 컴포넌트 프롭스 인터페이스 정의
interface SafetyAlertData {
  logId: number;
  alertLevel: 'WARNING' | 'CRITICAL';
  riskFactor: string;
  weatherCondition: string;
  riskProbabilityPercent: number;
  description: string;
  recommendedV2gDischargeLimit: number;
  factoryName: string;
}

interface FactorySafetyPopupProps {
  isOpen: boolean;
  alertData: SafetyAlertData;
  onApproveLimit: (logId: number, limit: number) => Promise<boolean>;
  onSendSOP: (logId: number) => Promise<boolean>;
  onClose: () => void;
}

export default function FactorySafetyPopup({
  isOpen,
  alertData,
  onApproveLimit,
  onSendSOP,
  onClose,
}: FactorySafetyPopupProps) {
  const [limitApproved, setLimitApproved] = useState<boolean>(false);
  const [sopSent, setSopSent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  // V2G 방전 제한 승인 처리
  const handleApproveLimit = async () => {
    setIsLoading(true);
    const success = await onApproveLimit(alertData.logId, alertData.recommendedV2gDischargeLimit);
    setIsLoading(false);
    if (success) {
      setLimitApproved(true);
      alert(`[VPP 제어 완료] ${alertData.factoryName}의 V2G 방전 송전 한도가 ${alertData.recommendedV2gDischargeLimit}%로 즉각 하향조정되었습니다.`);
    }
  };

  // 현장 안전 수칙(SOP) 스마트폰 전송 처리
  const handleSendSOP = async () => {
    setIsLoading(true);
    const success = await onSendSOP(alertData.logId);
    setIsLoading(false);
    if (success) {
      setSopSent(true);
      alert(`[안전 알림 전송 완료] 현장 근무자 전원에게 '${alertData.weatherCondition} 대비 ESS 및 전기차 충전소 관리 수칙' 카카오톡/푸시 알림이 발송되었습니다.`);
    }
  };

  // 인라인 스타일 객체 (가독성 높은 프리미엄 테마)
  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 5, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      fontFamily: "'Inter', 'Noto Sans KR', sans-serif",
    },
    modalContainer: {
      width: '540px',
      background: '#0d1326',
      border: `2px solid ${alertData.alertLevel === 'CRITICAL' ? '#ff3c3c' : '#ff9d00'}`,
      borderRadius: '20px',
      padding: '28px',
      boxShadow: `0 0 30px ${alertData.alertLevel === 'CRITICAL' ? 'rgba(255, 60, 60, 0.25)' : 'rgba(255, 157, 0, 0.25)'}`,
      color: '#ffffff',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      paddingBottom: '16px',
      marginBottom: '20px',
    },
    headerTitle: {
      fontSize: '18px',
      fontWeight: 800,
      margin: 0,
      color: alertData.alertLevel === 'CRITICAL' ? '#ff3c3c' : '#ff9d00',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '16px',
    },
    infoBox: {
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '10px',
      padding: '12px',
    },
    infoLabel: {
      fontSize: '11px',
      color: '#94a3b8',
      marginBottom: '4px',
    },
    infoValue: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#ffffff',
    },
    descriptionCard: {
      background: 'rgba(255, 60, 60, 0.04)',
      border: '1px solid rgba(255, 60, 60, 0.15)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '24px',
      lineHeight: '1.5',
      fontSize: '13.5px',
    },
    riskHighlight: {
      color: '#ff3c3c',
      fontWeight: 700,
    },
    actionSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      marginBottom: '24px',
    },
    actionRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.04)',
      borderRadius: '10px',
      padding: '12px 16px',
    },
    actionText: {
      fontSize: '13px',
      color: '#94a3b8',
      flex: 1,
    },
    actionTitle: {
      fontSize: '14px',
      fontWeight: 700,
      color: '#ffffff',
      marginBottom: '3px',
    },
    actionBtn: {
      backgroundColor: '#00d2ff',
      color: '#060913',
      border: 'none',
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '12.5px',
      fontWeight: 700,
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    },
    actionBtnSuccess: {
      backgroundColor: 'rgba(0, 255, 136, 0.1)',
      border: '1px solid #00ff88',
      color: '#00ff88',
      borderRadius: '8px',
      padding: '9px 15px',
      fontSize: '12.5px',
      fontWeight: 700,
    },
    footerButtons: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingTop: '16px',
    },
    closeBtn: {
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.1)',
      color: '#94a3b8',
      borderRadius: '8px',
      padding: '10px 20px',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContainer}>
        {/* 헤더 */}
        <div style={styles.header}>
          <span style={{ fontSize: '24px' }}>🚨</span>
          <h3 style={styles.headerTitle}>
            {alertData.alertLevel === 'CRITICAL' ? 'CRITICAL SAFETY ALERT' : 'SAFETY WARNING'}
          </h3>
        </div>

        {/* 요약 격자 정보 */}
        <div style={styles.infoGrid}>
          <div style={styles.infoBox}>
            <div style={styles.infoLabel}>대상 사업장</div>
            <div style={styles.infoValue}>{alertData.factoryName}</div>
          </div>
          <div style={styles.infoBox}>
            <div style={styles.infoLabel}>기상 위험 원인</div>
            <div style={styles.infoValue}>⛈️ {alertData.weatherCondition} 경보</div>
          </div>
          <div style={styles.infoBox}>
            <div style={styles.infoLabel}>과거 사고 연동 리스크 지수</div>
            <div style={styles.infoValue} style={{ color: '#ff3c3c', fontWeight: 800 }}>
              위험 확률 +{alertData.riskProbabilityPercent}% 상승
            </div>
          </div>
          <div style={styles.infoBox}>
            <div style={styles.infoLabel}>V2G 방전 상한 권고</div>
            <div style={styles.infoValue} style={{ color: '#00d2ff', fontWeight: 800 }}>
              최대 {alertData.recommendedV2gDischargeLimit}% 이하
            </div>
          </div>
        </div>

        {/* 리스크 분석 및 내용 설명 */}
        <div style={styles.descriptionCard}>
          재해 예측 AI 모델이 현재 현장 기상 상태와 V2G 송전 스케줄을 분석했습니다.{" "}
          <span style={styles.riskHighlight}>
            폭우로 인한 침수 우려 상황에서 고압 V2G 방전을 과도하게 유지할 경우, ESS 배터리 과열 및 감전 사고 발생률이 과거 데이터 패턴상 40% 이상 상승
          </span>
          합니다. 사고 방지를 위해 방전 출력 제한 조치를 즉각 승인하십시오.
        </div>

        {/* 세부 대응 액션 아이템 목록 */}
        <div style={styles.actionSection}>
          {/* 대응 1: 방전량 한도 차단 */}
          <div style={styles.actionRow}>
            <div style={styles.actionText}>
              <div style={styles.actionTitle}>V2G 방전량 40% 상한 제한</div>
              공장 내 전기차 주차 타워 V2G 출력 상한선을 긴급 제어합니다.
            </div>
            {limitApproved ? (
              <div style={styles.actionBtnSuccess}>✓ 제어 완료</div>
            ) : (
              <button 
                style={styles.actionBtn} 
                onClick={handleApproveLimit}
                disabled={isLoading}
              >
                {isLoading ? '제어 중...' : '긴급 제어 승인'}
              </button>
            )}
          </div>

          {/* 대응 2: 현장 근로자 대피 및 대처 가이드 */}
          <div style={styles.actionRow}>
            <div style={styles.actionText}>
              <div style={styles.actionTitle}>안전 예방 수칙(SOP) 발송</div>
              사내 근무자 스마트폰으로 폭우 침수 시 행동 요령 메시지를 전송합니다.
            </div>
            {sopSent ? (
              <div style={styles.actionBtnSuccess}>✓ 발송 완료</div>
            ) : (
              <button 
                style={styles.actionBtn} 
                onClick={handleSendSOP}
                disabled={isLoading}
              >
                {isLoading ? '발송 중...' : 'SOP 일괄 발송'}
              </button>
            )}
          </div>
        </div>

        {/* 하단 닫기 */}
        <div style={styles.footerButtons}>
          <button style={styles.closeBtn} onClick={onClose}>
            모니터링 유지 (창 닫기)
          </button>
        </div>
      </div>
    </div>
  );
}
