import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  LinearProgress,
  useTheme
} from '@mui/material';
import { green, red } from '@mui/material/colors';

interface TradeData {
  purchase_date: string;
  sell_date: string;
  symbol: string;
  start_price: number;
  end_price: number;
  return: number;
  strat_edge: number;
  confidence: number;
}

type Order = 'asc' | 'desc';

const TradeTable: React.FC<{ data: TradeData[] }> = ({ data }) => {
  const theme = useTheme();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof TradeData>('purchase_date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!data || data.length === 0) {
    return <Box sx={{ color: 'white', p: 2 }}>No transaction data available.</Box>;
  }

  const formatPercent = (v: number) => `${(v * 100).toFixed(2)}%`;
  const formatCurrency = (v: number) => `$${v.toFixed(2)}`;
  const returnColor = (v: number) => (v >= 0 ? green[500] : red[500]);

  const handleSort = (field: keyof TradeData) => {
    const isAsc = orderBy === field && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(field);
  };

  const getComparator = (field: keyof TradeData, order: Order) => (a: TradeData, b: TradeData) => {
    const aVal = a[field];
    const bVal = b[field];
    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    return (aVal < bVal ? -1 : 1) * (order === 'asc' ? 1 : -1);
  };

  const sorted = [...data].sort(getComparator(orderBy, order));

  const displayedColumns: { id: keyof TradeData; label: string; align?: 'right' | 'left' }[] = [
    { id: 'symbol', label: 'Symbol' },
    { id: 'purchase_date', label: 'Purchase Date' },
    { id: 'sell_date', label: 'Sell Date' },
    { id: 'start_price', label: 'Start Price', align: 'right' },
    { id: 'end_price', label: 'End Price', align: 'right' },
    { id: 'return', label: 'Return', align: 'right' },
    { id: 'strat_edge', label: 'Edge', align: 'right' },
    { id: 'confidence', label: 'Confidence' }
  ];

  return (
    <Box sx={{ p: 2, backgroundColor: '#121212', borderRadius: 2 }}>
      <TableContainer component={Paper} sx={{
        maxHeight: '80vh',
        backgroundColor: '#1E1E1E',
        '& .MuiTableCell-root': {
          color: '#FFFFFF',
          borderBottom: '1px solid #333',
          whiteSpace: 'nowrap'
        }
      }}>
        <Table stickyHeader>
        <TableHead>
            <TableRow sx={{ backgroundColor: '#161616' }}>
                {displayedColumns.map(({ id, label, align }) => (
                <TableCell
                    key={id}
                    align={align || 'left'}
                    sortDirection={orderBy === id ? order : false}
                    sx={{
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    backgroundColor: '#161616',
                    color: '#FFFFFF',
                    }}
                >
                    <TableSortLabel
                    active={orderBy === id}
                    direction={orderBy === id ? order : 'asc'}
                    onClick={() => handleSort(id)}
                    sx={{
                        color: '#FFFFFF',
                        '&.Mui-active': {
                        color: '#FFFFFF',
                        },
                        '& .MuiTableSortLabel-icon': {
                        color: '#FFFFFF !important',
                        },
                    }}
                    >
                    {label}
                    </TableSortLabel>
                </TableCell>
                ))}
            </TableRow>
            </TableHead>

          <TableBody>
            {sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((row) => (
              <TableRow key={`${row.symbol}-${row.purchase_date}`} hover sx={{ '&:hover': { backgroundColor: '#2A2A2A' } }}>
                {displayedColumns.map(({ id, align }) => {
                  const value = row[id];

                  if (id === 'confidence') {
                    return (
                      <TableCell key={id}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={(value as number) * 100}
                            sx={{
                              width: 80,
                              height: 6,
                              mr: 1,
                              backgroundColor: '#333',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: theme.palette.primary.main,
                              },
                            }}
                          />
                          <Typography variant="body2">{formatPercent(value as number)}</Typography>
                        </Box>
                      </TableCell>
                    );
                  }

                  const isCurrency = id === 'start_price' || id === 'end_price';
                  const isReturnField = id === 'return' || id === 'strat_edge';

                  return (
                    <TableCell
                      key={id}
                      align={align || (typeof value === 'number' ? 'right' : 'left')}
                      sx={isReturnField ? { color: returnColor(value as number) } : {}}
                    >
                      {typeof value === 'number'
                        ? isCurrency
                          ? formatCurrency(value)
                          : isReturnField
                            ? formatPercent(value)
                            : value
                        : id === 'symbol'
                          ? <Typography fontWeight="bold">{value}</Typography>
                          : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          rowsPerPageOptions={[10, 25, 50]}
          count={data.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            color: 'white',
            backgroundColor: '#1E1E1E',
            borderTop: '1px solid #333'
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default TradeTable;
