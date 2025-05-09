import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import StockPage from "./components/StockPage";
import CorrelationHeatmap from "./components/HeatMap";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Stock Analytics
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Stock Page
          </Button>
          <Button color="inherit" component={Link} to="/heatmap">
            Correlation Heatmap
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Routes>
          <Route path="/" element={<StockPage />} />
          <Route path="/heatmap" element={<CorrelationHeatmap />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
};

export default App;
