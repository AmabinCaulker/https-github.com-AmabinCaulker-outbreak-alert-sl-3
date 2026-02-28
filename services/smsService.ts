
import { SMSAlertLog, CaseReport } from '../types';

const SMS_LOG_KEY = 'outbreak_sms_logs';

export const getSMSLogs = (): SMSAlertLog[] => {
  const logs = localStorage.getItem(SMS_LOG_KEY);
  return logs ? JSON.parse(logs) : [];
};

export const sendSMSAlert = async (report: CaseReport): Promise<SMSAlertLog | null> => {
  // Simulate network latency for SMS gateway
  await new Promise(resolve => setTimeout(resolve, 800));

  const specificLocation = report.location;
  const districtName = report.district ? `${report.district} District` : 'the district';
  const fullLocDetail = report.district && report.district !== report.location 
    ? `${specificLocation}, ${report.district}` 
    : specificLocation;

  const alertMessage = `CRITICAL ALERT: Potential ${report.disease} outbreak detected at ${fullLocDetail}. Case ID: ${report.id}. All health workers in ${districtName} please initiate Emergency Protocol Stage 1. - Ministry of Health SL`;
  
  const newLog: SMSAlertLog = {
    id: `SMS-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    reportId: report.id,
    message: alertMessage,
    recipients: Math.floor(Math.random() * 45) + 15, // Simulate 15-60 local health workers
    district: report.district || report.location,
    timestamp: new Date().toISOString(),
    status: 'Delivered',
    gateway: Math.random() > 0.5 ? 'Orange SL' : 'Africell SL'
  };

  const logs = getSMSLogs();
  logs.unshift(newLog);
  localStorage.setItem(SMS_LOG_KEY, JSON.stringify(logs.slice(0, 50)));

  console.log(`[SMS GATEWAY] Dispatched to ${newLog.recipients} recipients: ${alertMessage}`);
  return newLog;
};
