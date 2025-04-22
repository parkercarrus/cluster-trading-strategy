import useCustomBacktestData from '../hooks/useCustomBacktestData';
import BacktestParametersForm from '../components/BacktestForm';
import DashboardView from './Dashboard';

const BacktestPage = () => {
  const {
    runBacktest,
    loading,
    hasRun,
    ledgerData,
    transactionsData,
    metricsData,
  } = useCustomBacktestData();

  return (
    <main style={{ padding: '120px 24px 80px', maxWidth: '100%', margin: '0 auto' }}>
      {!hasRun ? (
        <BacktestParametersForm onSubmit={runBacktest} isLoading={loading} />
      ) : (
        <DashboardView
          ledgerData={ledgerData}
          transactionsData={transactionsData}
          metricsData={metricsData}
        />
      )}
    </main>
  );
};

export default BacktestPage;
