import { useState, useEffect } from "react";
import { Typography, Select, MenuItem, Box } from "@mui/material";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = "http://20.244.56.144/evaluation-service";
const ACCESS_TOKEN = import.meta.env.REACT_APP_ACCESS_TOKEN || ""; 

interface Stock {
  [key: string]: string;
}

interface PriceData {
  price: number;
  lastUpdatedAt: string;
}

const StockPage: React.FC = () => {
  const [stocks, setStocks] = useState<Stock>({});
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [minutes, setMinutes] = useState<number>(10);
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    axios
      .get<{ stocks: Stock }>(`${API_BASE_URL}/stocks`, {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      })
      .then((response) => {
        if (
          !response.data.stocks ||
          Object.keys(response.data.stocks).length === 0
        ) {
          console.warn("No stocks returned from API");
          setIsLoading(false);
          return;
        }
        setStocks(response.data.stocks);
        setSelectedStock(Object.values(response.data.stocks)[0] || "");
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stocks:", error);
        alert("Failed to fetch stock list. Check console for details.");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedStock) return;
    setPriceLoading(true);
    axios
      .get<PriceData[]>(
        `${API_BASE_URL}/stocks/${selectedStock}?minutes=${minutes}`,
        {
          headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        }
      )
      .then((response) => {
        setPriceData(response.data);
        const avg = response.data.length
          ? response.data.reduce((sum, item) => sum + item.price, 0) /
            response.data.length
          : 0;
        setAverage(avg);
        setPriceLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stock prices:", error);
        setPriceLoading(false);
      });
  }, [selectedStock, minutes]);

  useEffect(() => {
    console.log("Stocks:", stocks);
    console.log("Price Data:", priceData);
  }, [stocks, priceData]);

  const chartData = {
    labels: priceData.map((item) =>
      new Date(item.lastUpdatedAt).toLocaleTimeString()
    ),
    datasets: [
      {
        label: "Stock Price",
        data: priceData.map((item) => item.price),
        borderColor: "blue",
        fill: false,
      },
      {
        label: "Average",
        data: priceData.map(() => average),
        borderColor: "red",
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };

  return (
    <Box p={3}>
      <Typography variant="h5">Stock Price Chart</Typography>
      {isLoading ? (
        <Typography>Loading stocks...</Typography>
      ) : Object.keys(stocks).length === 0 ? (
        <Typography>No stocks available.</Typography>
      ) : (
        <>
          <Select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value as string)}
            sx={{ m: 1, minWidth: 200 }}
          >
            {Object.entries(stocks).map(([name, ticker]) => (
              <MenuItem key={ticker} value={ticker}>
                {name}
              </MenuItem>
            ))}
          </Select>
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
          {priceLoading ? (
            <Typography>Loading price data...</Typography>
          ) : priceData.length === 0 ? (
            <Typography>No price data available.</Typography>
          ) : (
            <Box sx={{ maxWidth: "100%", overflowX: "auto" }}>
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `Price: $${(context.raw as number).toFixed(2)}`,
                      },
                    },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default StockPage;
