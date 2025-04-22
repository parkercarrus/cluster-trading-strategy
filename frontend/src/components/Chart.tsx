import { useEffect, useRef } from 'react';
import { createChart, AreaSeries, LineSeries } from 'lightweight-charts';

interface LedgerEntry {
  date: string;
  portfolio_value: number;
  cash: number;
  invested: number;
  num_positions: number;
  SPY: number
}

interface ChartProps {
  data: LedgerEntry[];
  showPortfolioValue: boolean;
  showNumPositions: boolean;
  showInvested: boolean,
  showCash: boolean,
  showSpy: boolean
}

const Chart = ({data, showPortfolioValue, showNumPositions, showCash, showInvested, showSpy}: ChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<any>(null);

  const portfolioSeriesRef = useRef<any>(null);
  const positionsSeriesRef = useRef<any>(null);
  const investedSeriesRef = useRef<any>(null);
  const cashSeriesRef = useRef<any>(null);
  const spySeriesRef = useRef<any>(null);


  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;
  
    if (chartInstance.current) {
      chartInstance.current.remove();
    }
  
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 300,
      layout: {
        textColor: 'white',
        background: { color: '#000000' },
      },
      grid: {
        vertLines: { color: 'transparent' },
        horzLines: { color: 'transparent' },
      },
      rightPriceScale: {
        borderColor: 'rgba(51, 65, 88, 0.8)',
        scaleMargins: {
          top: 0.2,
          bottom: 0.2,
        },
      },
      leftPriceScale: {
        visible: true,
        borderColor: 'rgba(51, 65, 88, 0.8)',
        scaleMargins: {
          top: 0.2,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: 'rgba(51, 65, 88, 0.8)',
        timeVisible: false,
      },
    });
  
    chartInstance.current = chart;
  
    portfolioSeriesRef.current = chart.addSeries(AreaSeries, {
      lineColor: '#4CAF50',
      topColor: 'rgba(76, 175, 80, 0.56)',
      bottomColor: 'rgba(76, 175, 80, 0.04)',
      priceFormat: {
        type: 'custom',
        formatter: (val: number) => Math.round(val).toLocaleString('en-US'),
      },
    });
    portfolioSeriesRef.current.setData(data.map(d => ({
      time: d.date.split('T')[0],
      value: d.portfolio_value,
    })));
  
    positionsSeriesRef.current = chart.addSeries(LineSeries, {
      color: 'rgb(220, 230, 255)',
      priceScaleId: 'left',
      priceFormat: {
        type: 'custom',
        formatter: (val: number) => Math.round(val).toLocaleString('en-US'),
      },
    });
    positionsSeriesRef.current.setData(data.map(d => ({
      time: d.date.split('T')[0],
      value: d.num_positions,
    })));
  
    cashSeriesRef.current = chart.addSeries(LineSeries, {
      color: 'rgb(179, 13, 51)',
      priceScaleId: 'right',
      priceFormat: {
        type: 'custom',
        formatter: (val: number) => Math.round(val).toLocaleString('en-US'),
      },
    });
    cashSeriesRef.current.setData(data.map(d => ({
      time: d.date.split('T')[0],
      value: d.cash,
    })));
  
    investedSeriesRef.current = chart.addSeries(LineSeries, {
      color: 'rgba(182, 5, 185, 0.73)',
      priceScaleId: 'right',
      priceFormat: {
        type: 'custom',
        formatter: (val: number) => Math.round(val).toLocaleString('en-US'),
      },
    });
    investedSeriesRef.current.setData(data.map(d => ({
      time: d.date.split('T')[0],
      value: d.invested,
    })));

    spySeriesRef.current = chart.addSeries(LineSeries, {
      color: 'rgb(255, 255, 255)',
      priceScaleId: 'right',
      priceFormat: {
        type: 'custom',
        formatter: (val: number) => Math.round(val).toLocaleString('en-US'),
      },
    });
    spySeriesRef.current.setData(data.map(d => ({
      time: d.date.split('T')[0],
      value: d.SPY,
    })));
  
    portfolioSeriesRef.current?.applyOptions({ visible: showPortfolioValue });
    positionsSeriesRef.current?.applyOptions({ visible: showNumPositions });
    cashSeriesRef.current?.applyOptions({ visible: showCash });
    investedSeriesRef.current?.applyOptions({ visible: showInvested });
    spySeriesRef.current?.applyOptions({ visible: showSpy });
  
    chart.timeScale().fitContent();
  }, [data, showPortfolioValue, showNumPositions, showCash, showInvested, showSpy]);

  return (
    <div
      style={{
        width: '100%',
        backgroundColor: '#000000',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      
      <h3 style={{
        color: 'white',
        fontSize: '1.25rem',
        fontWeight: 600,
        marginBottom: '32px',
      }}>
        Simulated Portfolio History
      </h3>
      <div
        ref={chartRef}
        style={{
          width: '100%',
          height: '300px',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      />
    </div>
  );
};

export default Chart;
