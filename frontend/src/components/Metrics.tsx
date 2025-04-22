interface MetricsData {
    net_return: number;
    benchmarked_return: number;
    cagr: number;
    sharpe_ratio: number;
  }
  
  export default function MetricsDashboard({ data }: { data: MetricsData }) {
    const formatPercent = (value: number) => `${value.toFixed(2)}%`;
    const formatRatio = (value: number) => value.toFixed(2);
    const isPositive = (value: number) => value > 0;
  
    const cardStyle: React.CSSProperties = {
      backgroundColor: 'black',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(105, 105, 105, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
    };
  
    const headerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    };
  
    const labelStyle: React.CSSProperties = {
      fontSize: '14px',
      fontWeight: 600,
      color: 'white',
    };
  
    const badgeStyle = (bgColor: string, textColor: string): React.CSSProperties => ({
      fontSize: '12px',
      fontWeight: 800,
      padding: '4px 8px',
      borderRadius: '999px',
      backgroundColor: bgColor,
      color: textColor,
    });
  
    const valueStyle: React.CSSProperties = {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
    };
  
    const descStyle: React.CSSProperties = {
      marginTop: '4px',
      fontSize: '12px',
      color: 'white',
    };
  
    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
    };
  
    const containerStyle: React.CSSProperties = {
      backgroundColor: 'black',
      padding: '32px',
      borderRadius: '16px',
      maxWidth: '1200px',
      margin: '0 auto',
    };
  
    const metrics = [
      {
        label: 'Net Return',
        value: formatPercent(data.net_return),
        delta: isPositive(data.net_return) ? '↑' : '↓',
        badge: isPositive(data.net_return)
          ? badgeStyle('#dcfce7', '#15803d')
          : badgeStyle('#fee2e2', '#b91c1c'),
        desc: 'Overall portfolio performance',
      },
      {
        label: 'Benchmark Return',
        value: formatPercent(data.benchmarked_return),
        delta: isPositive(data.benchmarked_return) ? '↑' : '↓',
        badge: isPositive(data.benchmarked_return)
          ? badgeStyle('#dcfce7', '#15803d')
          : badgeStyle('#fee2e2', '#b91c1c'),
        desc: 'Market comparison',
      },
      {
        label: 'CAGR',
        value: formatPercent(data.cagr),
        delta: isPositive(data.cagr) ? '↑' : '↓',
        badge: isPositive(data.cagr)
          ? badgeStyle('#dcfce7', '#15803d')
          : badgeStyle('#fee2e2', '#b91c1c'),
        desc: 'Compound Annual Growth Rate',
      },
      {
        label: 'Sharpe Ratio',
        value: formatRatio(data.sharpe_ratio),
        delta: data.sharpe_ratio > 1 ? '✓' : '!',
        badge: data.sharpe_ratio > 1
          ? badgeStyle('#dcfce7', '#15803d')
          : badgeStyle('#fef9c3', '#92400e'),
        desc: 'Risk-adjusted return',
      },
    ];
  
    return (
      <div style={containerStyle}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: 'white' }}>
          Performance Dashboard
        </h2>
        <div style={gridStyle}>
          {metrics.map((m) => (
            <div key={m.label} style={cardStyle}>
              <div style={headerStyle}>
                <span style={labelStyle}>{m.label}</span>
                <span style={m.badge}>{m.delta}</span>
              </div>
              <div style={valueStyle}>{m.value}</div>
              <div style={descStyle}>{m.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '24px', textAlign: 'right', fontSize: '12px', color: 'black' }}>
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    );
  }
  