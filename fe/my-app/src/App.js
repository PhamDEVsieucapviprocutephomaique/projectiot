import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/laytout";
import Profile from "./components/profile";
import Datasensor from "./components/Datasensor";
import Actionhistory from "./components/Actionhistory";
import Home from "./components/Home";
import Chart from "./components/Chart";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout></Layout>}>
          <Route index element={<Home></Home>}></Route>
          <Route path="profile/" element={<Profile></Profile>}></Route>
          <Route path="Datasensor/" element={<Datasensor></Datasensor>}></Route>
          <Route
            path="Actionhistory/"
            element={<Actionhistory></Actionhistory>}
          ></Route>
          <Route path="Chart/" element={<Chart></Chart>}></Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
