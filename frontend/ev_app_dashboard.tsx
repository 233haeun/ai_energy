import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  StatusBar,
  Switch,
  TextInput,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

interface VPPBlock {
  time: string;
  type: 'CHARGE' | 'DISCHARGE_V2G';
  tariff: number;
  expectedRevenue: number;
}

export default function EVAppDashboard() {
  // 메인 탭 관리: 'DASHBOARD' | 'AI_SETTINGS'
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'AI_SETTINGS'>('DASHBOARD');
  
  // 공통 배터리 및 수익 상태
  const [soc, setSoc] = useState<number>(77);
  const [isPluggedIn, setIsPluggedIn] = useState<boolean>(true);
  const [accumulatedProfit, setAccumulatedProfit] = useState<number>(142800);

  // AI 스마트 설정 상태 관리
  const [autoChargeOptIn, setAutoChargeOptIn] = useState<boolean>(true);
  const [v2gOptIn, setV2gOptIn] = useState<boolean>(true);
  const [batteryProtectionOptIn, setBatteryProtectionOptIn] = useState<boolean>(true);
  const [minSafetySoc, setMinSafetySoc] = useState<number>(30); // 슬라이더 대용 수치 제어
  const [commuteStart, setCommuteStart] = useState<string>('08:30');
  const [commuteEnd, setCommuteEnd] = useState<string>('18:30');

  // AI 제안 동의 알림 팝업 모달 관리
  const [showPromoModal, setShowPromoModal] = useState<boolean>(false);

  useEffect(() => {
    // 2.5초 후 AI 스마트 추천 유도 푸시 팝업 트리거
    const timer = setTimeout(() => {
      setShowPromoModal(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const approvePromo = () => {
    setShowPromoModal(false);
    setAutoChargeOptIn(true);
    setAccumulatedProfit(prev => prev + 3000); // 웰컴 포인트 지급 시뮬레이션
    alert('AI 최적화 스케줄 승인 완료! 내일 낮 12시 70% 할인 충전 스케줄이 캘린더에 연동되었습니다.');
  };

  // 내일의 VPP 스케줄 블록 데이터
  const tomorrowVppBlocks: VPPBlock[] = [
    {
      time: '12:00 - 14:00',
      type: 'CHARGE',
      tariff: 65,
      expectedRevenue: 0,
    },
    {
      time: '20:00 - 22:00',
      type: 'DISCHARGE_V2G',
      tariff: 240,
      expectedRevenue: 12500,
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 모바일 상단 커스텀 헤더 */}
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.appTitle}>ECO-GRID SENS</Text>
          <Text style={styles.appSubtitle}>AI EV Smart Energy Partner</Text>
        </View>
        <View style={[styles.connectorBadge, isPluggedIn ? styles.connected : styles.disconnected]}>
          <View style={styles.indicatorDot} />
          <Text style={styles.connectorText}>{isPluggedIn ? 'V2G 커넥터 연결됨' : '커넥터 연결 해제됨'}</Text>
        </View>
      </View>

      {/* 상단 탭 스위치 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'DASHBOARD' && styles.tabActive]}
          onPress={() => setActiveTab('DASHBOARD')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'DASHBOARD' && styles.tabActiveText]}>홈 대시보드</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'AI_SETTINGS' && styles.tabActive]}
          onPress={() => setActiveTab('AI_SETTINGS')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'AI_SETTINGS' && styles.tabActiveText]}>AI 스마트 설정</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'DASHBOARD' ? (
          /* ==================== 1. 홈 대시보드 화면 ==================== */
          <View style={styles.tabContent}>
            
            {/* 배터리 잔량 시각화 카드 */}
            <View style={styles.glassCard}>
              <Text style={styles.cardHeaderTitle}>실시간 배터리 상태</Text>
              
              {/* 원형 프로그레스 바 대용의 세련된 가로 게이지 바 */}
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressPercent}>{soc}%</Text>
                  <Text style={styles.progressCapacity}>59.6 kWh / 77.4 kWh</Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View style={[styles.progressBarFill, { width: `${soc}%` }]} />
                  {/* 최저 안전 보호 제한 표시선 */}
                  <View style={[styles.protectionLine, { left: `${minSafetySoc}%` }]} />
                </View>
                <View style={styles.progressFooter}>
                  <Text style={styles.footerMinSoc}>배터리 최소 제한선: {minSafetySoc}%</Text>
                  <Text style={styles.footerStatus}>완속 충전 중 (11kW)</Text>
                </View>
              </View>
            </View>

            {/* 누적 수익 리포트 */}
            <View style={styles.profitBanner}>
              <View>
                <Text style={styles.profitLabel}>이번 달 누적 에너지 리워드</Text>
                <Text style={styles.profitAmount}>₩{accumulatedProfit.toLocaleString()}</Text>
              </View>
              <View style={styles.profitStats}>
                <Text style={styles.statLabel}>내일 예상 수익</Text>
                <Text style={styles.statValue}>+₩12,500</Text>
              </View>
            </View>

            {/* AI 기반 내일의 스케줄 카드 */}
            <View style={styles.glassCard}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardHeaderTitle}>내일의 최적 충·방전 스케줄</Text>
                <View style={styles.aiBadge}>
                  <Text style={styles.aiBadgeText}>AI 스케줄링</Text>
                </View>
              </View>

              {tomorrowVppBlocks.map((block, idx) => (
                <View key={idx} style={styles.scheduleItem}>
                  <View style={styles.scheduleRow}>
                    <Text style={styles.scheduleTime}>{block.time}</Text>
                    <View style={[
                      styles.typeBadge,
                      block.type === 'CHARGE' ? styles.chargeBadge : styles.dischargeBadge
                    ]}>
                      <Text style={styles.typeBadgeText}>
                        {block.type === 'CHARGE' ? '할인 충전 (태양광)' : '역판매 방전 (V2G)'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.scheduleDetail}>
                    {block.type === 'CHARGE' 
                      ? '태양광 발전 잉여로 낮 시간 요금 단가가 최대로 인하됩니다.' 
                      : '저녁 수요 피크 구간 계통 지원 방전으로 이득을 창출합니다.'}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.tariffLabel}>적용 단가</Text>
                    <Text style={[styles.tariffValue, block.type === 'CHARGE' ? styles.greenColor : styles.orangeColor]}>
                      {block.tariff}원 / kWh
                    </Text>
                  </View>
                </View>
              ))}
            </View>

          </View>
        ) : (
          /* ==================== 2. AI 스마트 설정 화면 ==================== */
          <View style={styles.tabContent}>
            
            {/* 가상발전소(VPP) 연동 핵심 기능 토글 그룹 */}
            <View style={styles.glassCard}>
              <Text style={styles.cardHeaderTitle}>AI 자동 제어 스위치</Text>
              
              {/* 스위치 1 */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelArea}>
                  <Text style={styles.toggleTitle}>잉여 태양광 초저가 충전 연동</Text>
                  <Text style={styles.toggleDesc}>낮 시간 과잉 발전 시 70% 할인 충전을 자동 승인합니다.</Text>
                </View>
                <Switch
                  value={autoChargeOptIn}
                  onValueChange={setAutoChargeOptIn}
                  trackColor={{ false: '#1e293b', true: '#00d2ff' }}
                  thumbColor={autoChargeOptIn ? '#ffffff' : '#94a3b8'}
                />
              </View>

              {/* 스위치 2 */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelArea}>
                  <Text style={styles.toggleTitle}>저녁 피크 V2G 역판매 자동 참여</Text>
                  <Text style={styles.toggleDesc}>배터리 잔량이 충족될 때 한전에 비싸게 방전 판매합니다.</Text>
                </View>
                <Switch
                  value={v2gOptIn}
                  onValueChange={setV2gOptIn}
                  trackColor={{ false: '#1e293b', true: '#ff9d00' }}
                  thumbColor={v2gOptIn ? '#ffffff' : '#94a3b8'}
                />
              </View>

              {/* 스위치 3 */}
              <View style={styles.toggleRow}>
                <View style={styles.toggleLabelArea}>
                  <Text style={styles.toggleTitle}>안전 마진 배터리 세이프 가드</Text>
                  <Text style={styles.toggleDesc}>방전 시 지정해둔 최소 배터리 용량 이하 방전을 자동 차단합니다.</Text>
                </View>
                <Switch
                  value={batteryProtectionOptIn}
                  onValueChange={setBatteryProtectionOptIn}
                  trackColor={{ false: '#1e293b', true: '#00ff88' }}
                  thumbColor={batteryProtectionOptIn ? '#ffffff' : '#94a3b8'}
                />
              </View>
            </View>

            {/* 미려한 최소 배터리 제한 제어용 프로그레스/슬라이더 UI 컴포넌트 */}
            <View style={styles.glassCard}>
              <Text style={styles.cardHeaderTitle}>배터리 보호 하한선 조절 (최저 SoC)</Text>
              <Text style={styles.toggleDesc}>
                V2G로 판매하더라도 최소한 이 배터리 잔량(%)은 보존되어 출퇴근 주행을 보장합니다.
              </Text>
              
              <View style={styles.sliderControlContainer}>
                <View style={styles.sliderTrack}>
                  {/* 진행선 */}
                  <View style={[styles.sliderProgress, { width: `${minSafetySoc}%` }]} />
                  {/* 슬라이더 손잡이 시뮬레이션 */}
                  <View style={[styles.sliderKnob, { left: `${minSafetySoc}%` }]} />
                </View>
                
                {/* 퀵 조정 버튼 */}
                <View style={styles.sliderValueRow}>
                  <TouchableOpacity style={[styles.valBtn, minSafetySoc === 20 && styles.valBtnActive]} onPress={() => setMinSafetySoc(20)}>
                    <Text style={styles.valBtnText}>20%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.valBtn, minSafetySoc === 30 && styles.valBtnActive]} onPress={() => setMinSafetySoc(30)}>
                    <Text style={styles.valBtnText}>30%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.valBtn, minSafetySoc === 40 && styles.valBtnActive]} onPress={() => setMinSafetySoc(40)}>
                    <Text style={styles.valBtnText}>40%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.valBtn, minSafetySoc === 50 && styles.valBtnActive]} onPress={() => setMinSafetySoc(50)}>
                    <Text style={styles.valBtnText}>50%</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 출퇴근 고정 시간대 설정 인풋 */}
            <View style={styles.glassCard}>
              <Text style={styles.cardHeaderTitle}>출퇴근 시간 주기 입력</Text>
              <Text style={styles.toggleDesc}>AI가 차량의 회사 체류 시간을 학습해 매칭 확률을 높입니다.</Text>
              
              <View style={styles.timeInputRow}>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>오전 출근 시간</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={commuteStart}
                    onChangeText={setCommuteStart}
                    placeholder="08:30"
                    placeholderTextColor="#4b5563"
                  />
                </View>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>오후 퇴근 시간</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={commuteEnd}
                    onChangeText={setCommuteEnd}
                    placeholder="18:30"
                    placeholderTextColor="#4b5563"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={() => alert('설정이 안전하게 저장되었습니다.')}>
                <Text style={styles.saveBtnText}>설정 저장 및 AI 스케줄링 갱신</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      </ScrollView>

      {/* AI 실시간 푸시 팝업 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPromoModal}
        onRequestClose={() => setShowPromoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>💡</Text>
            <Text style={styles.modalTitle}>AI 최적화 충전 제안</Text>
            <Text style={styles.modalBody}>
              내일 <Text style={styles.boldText}>오전 10시~오후 2시</Text> 사이 전라/제주 지역의 태양광 과잉 발전으로 출력제어가 예측됩니다.{"\n\n"}
              해당 시간에 차량이 사내 주차장에 주차될 확률이 92%입니다. 충전 단가를 <Text style={styles.greenText}>70% 할인(65원/kWh)</Text> 적용하여 전력을 충전하도록 스케줄에 연동하시겠습니까?
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalDeclineBtn} onPress={() => setShowPromoModal(false)}>
                <Text style={styles.declineText}>보류</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalApproveBtn} onPress={approvePromo}>
                <Text style={styles.approveText}>자동 충전 예약</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060913',
  },
  appHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  appTitle: {
    fontFamily: 'Outfit',
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  appSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  connectorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  connected: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.06)',
  },
  disconnected: {
    borderColor: '#ff3c3c',
    backgroundColor: 'rgba(255, 60, 60, 0.06)',
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ff88',
    marginRight: 6,
  },
  connectorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: 'rgba(30, 41, 73, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.15)',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94a3b8',
  },
  tabActiveText: {
    color: '#00d2ff',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  tabContent: {
    gap: 14,
  },
  glassCard: {
    backgroundColor: 'rgba(20, 29, 56, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.1,
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressPercent: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'Outfit',
  },
  progressCapacity: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00d2ff',
    borderRadius: 5,
  },
  protectionLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#ff3c3c',
    zIndex: 10,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  footerMinSoc: {
    fontSize: 10,
    color: '#ff3c3c',
    fontWeight: '600',
  },
  footerStatus: {
    fontSize: 10,
    color: '#00ff88',
    fontWeight: '600',
  },
  profitBanner: {
    backgroundColor: 'rgba(0, 255, 136, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.15)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profitLabel: {
    fontSize: 11,
    color: '#00ff88',
    fontWeight: '600',
  },
  profitAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
    fontFamily: 'Outfit',
    marginTop: 4,
  },
  profitStats: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00ff88',
    marginTop: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8,
  },
  aiBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 210, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 210, 255, 0.2)',
  },
  aiBadgeText: {
    fontSize: 9,
    color: '#00d2ff',
    fontWeight: '700',
  },
  scheduleItem: {
    backgroundColor: 'rgba(255,255,255,0.015)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  typeBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  chargeBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
  },
  dischargeBadge: {
    backgroundColor: 'rgba(255, 157, 0, 0.08)',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scheduleDetail: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    paddingTop: 6,
    marginTop: 2,
  },
  tariffLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  tariffValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  greenColor: { color: '#00ff88' },
  orangeColor: { color: '#ff9d00' },

  /* Settings Page Details */
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  toggleLabelArea: {
    flex: 1,
    marginRight: 16,
    gap: 3,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  toggleDesc: {
    fontSize: 10.5,
    color: '#94a3b8',
    lineHeight: 14,
  },
  sliderControlContainer: {
    gap: 16,
    marginTop: 8,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    position: 'relative',
  },
  sliderProgress: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 3,
  },
  sliderKnob: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#00ff88',
    marginLeft: -8,
  },
  sliderValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  valBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  valBtnActive: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.05)',
  },
  valBtnText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  timeInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  inputBox: {
    flex: 1,
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  timeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#00d2ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#060913',
    fontWeight: '700',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 5, 10, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0d1326',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 210, 255, 0.2)',
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 12.5,
    color: '#94a3b8',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  greenText: {
    color: '#00ff88',
    fontWeight: 'bold',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalDeclineBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  declineText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  modalApproveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#00d2ff',
    alignItems: 'center',
  },
  approveText: {
    color: '#060913',
    fontSize: 13,
    fontWeight: '700',
  },
});
