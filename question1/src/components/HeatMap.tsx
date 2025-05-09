import { useState, useEffect } from "react";
import { Typography, Select, MenuItem, Box, Tooltip } from "@mui/material";
import axios from "axios";

const API_BASE_URL = "http://20.244.56.144/evaluation-service";
const ACCESS_TOKEN = import.meta.env.REACT_APP_ACCESS_TOKEN || ""; 

interface Stock {
  [key: string]: string;
}

interface PriceData {
  price: number;
  lastUpdatedAt: string;
}

interface Correlation {
  x: string;
  y: string;
  value: number;
}

interface Stats {
  [ticker: string]: { mean: number; stdDev: number };
}

const CorrelationHeatmap: React.FC = () => {
  const [stocks, setStocks] = useState<Stock>({});
  const [minutes, setMinutes] = useState<number>(10);
  const [correlationData, setCorrelationData] = useState<Correlation[]>([]);
  const [stats, setStats] = useState<Stats>({});

  useEffect(() => {
    axios
      .get<{ stocks: Stock }>(`${API_BASE_URL}/stocks`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      })
      .then((response) => {
        setStocks(response.data.stocks);
      })
      .catch((error) => console.error("Error fetching stocks:", error));
  }, []);

  useEffect(() => {
    if (Object.keys(stocks).length === 0) return;

    Promise.all(
      Object.values(stocks).map((ticker) =>
        axios.get<PriceData[]>(
          `${API_BASE_URL}/stocks/${ticker}?minutes=${minutes}`,
          {
            headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
          }
        )
      )
    )
      .then((responses) => {
        const priceData = responses.map((res, i) => ({
          ticker: Object.values(stocks)[i],
          prices: res.data.map((item) => item.price),
        }));

        // Calculate statistics
        const newStats: Stats = {};
        priceData.forEach(({ ticker, prices }) => {
          const mean = prices.reduce((sum, p) => sum + p, 0) / prices.length;
          const stdDev = Math.sqrt(
            prices.reduce((sum, p) => sum + (p - mean) ** 2, 0) /
              (prices.length - 1)
          );
          newStats[ticker] = { mean, stdDev };
        });
        setStats(newStats);

        // Calculate correlations
        const correlations: Correlation[] = [];
        for (let i = 0; i < priceData.length; i++) {
          for (let j = 0; j < priceData.length; j++) {
            const x = priceData[i].prices;
            const y = priceData[j].prices;
            const xMean = x.reduce((sum, p) => sum + p, 0) / x.length;
            const yMean = y.reduce((sum, p) => sum + p, 0) / y.length;
            const cov =
              x.reduce((sum, xi, k) => sum + (xi - xMean) * (y[k] - yMean), 0) /
              (x.length - 1);
            const xStd = Math.sqrt(
              x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0) / (x.length - 1)
            );
            const yStd = Math.sqrt(
              y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0) / (y.length - 1)
            );
            const correlation = xStd * yStd === 0 ? 0 : cov / (xStd * yStd);
            correlations.push({
              x: priceData[i].ticker,
              y: priceData[j].ticker,
              value: correlation,
            });
          }
        }
        setCorrelationData(correlations);
      })
      .catch((error) => console.error("Error fetching stock prices:", error));
  }, [stocks, minutes]);

  const tickerList = Object.values(stocks);
  const gridSize = tickerList.length;

  return (
    <Box p={3}>
      <Typography variant="h5">Correlation Heatmap</Typography>
      <Select
        value={minutes}
        onChange={(e) => setMinutes(Number(e.target.value))}
        sx={{ m: 1 }}
      >
        {[10, 30, 60].map((m) => (
          <MenuItem key={m} value={m}>
            {m} minutes
          </MenuItem>
        ))}
      </Select>
      <Box
        display="grid"
        gridTemplateColumns={`repeat(${gridSize}, 50px)`}
        gap={1}
        sx={{ maxWidth: "100%", overflowX: "auto" }}
      >
        {correlationData.map(({ x, y, value }) => (
          <Tooltip
            key={`${x}-${y}`}
            title={`Correlation: ${value.toFixed(2)}\n${x}: Avg: $${stats[
              x
            ]?.mean.toFixed(2)}, StdDev: $${stats[x]?.stdDev.toFixed(
              2
            )}\n${y}: Avg: $${stats[y]?.mean.toFixed(2)}, StdDev: $${stats[
              y
            ]?.stdDev.toFixed(2)}`}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                backgroundColor: `rgba(${
                  value > 0 ? "0, 255, 0" : "255, 0, 0"
                }, ${Math.abs(value)})`,
                "&:hover": { opacity: 0.8 },
                border: "1px solid #ccc",
              }}
            />
          </Tooltip>
        ))}
      </Box>
      <Box mt={2}>
        <Typography variant="body2">
          Color Legend: Green (Positive), Red (Negative)
        </Typography>
      </Box>
    </Box>
  );
};

export default CorrelationHeatmap;
