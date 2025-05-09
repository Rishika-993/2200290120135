import express, { Request, Response } from "express";
import axios from "axios";

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const VALID_IDS = ["p", "f", "e", "r"];
const API_BASE_URL = "http://20.244.56.144/evaluation-service";
const ACCESS_TOKEN = process.env.REACT_APP_ACCESS_TOKEN || ""; 

let numbers: number[] = [];

app.get("/numbers/:numberid", async (req: Request, res: Response) => {
  const { numberid } = req.params;
  if (!VALID_IDS.includes(numberid)) {
    return res.status(400).json({ error: "Invalid number ID" });
  }

  const windowPrevState = [...numbers];
  const endpoint = {
    p: "primes",
    f: "fibo",
    e: "even",
    r: "rand",
  }[numberid];

  try {
    const response = await axios.get<{ numbers: number[] }>(
      `${API_BASE_URL}/${endpoint}`,
      {
        headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
        timeout: 500,
      }
    );

    const newNumbers = response.data.numbers;
    const uniqueNumbers = [...new Set([...numbers, ...newNumbers])];
    numbers = uniqueNumbers.slice(-WINDOW_SIZE);

    const avg =
      numbers.length > 0
        ? Number(
            (
              numbers.reduce((sum, num) => sum + num, 0) / numbers.length
            ).toFixed(2)
          )
        : 0;

    res.json({
      windowPrevState,
      windowCurrState: numbers,
      numbers: newNumbers,
      avg,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch numbers" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
