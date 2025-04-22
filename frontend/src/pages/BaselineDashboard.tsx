import useBaselineDashboardData from '../hooks/useBaselineDashboardData';
import DashboardView from './Dashboard';

const BaselineDashboard = () => {
  const { ledgerData, transactionsData, metricsData } = useBaselineDashboardData();

  return (
    <DashboardView
      ledgerData={ledgerData}
      transactionsData={transactionsData}
      metricsData={metricsData}
    />
  );
};

export default BaselineDashboard;
