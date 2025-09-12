import { Outlet, Link, useLocation } from "react-router-dom";
import "../components/Layoutscss.scss";
const Layout = () => {
  return (
    <>
      <header className="main-header">
        <Link to="/" className="header-part part1">
          Home
        </Link>
        <Link to="/Datasensor" className="header-part part2">
          Datasensor
        </Link>
        <Link to="/Actionhistory" className="header-part part3">
          Actionhistory
        </Link>
        <Link to="/profile" className="header-part part4">
          profile
        </Link>
      </header>
      <Outlet></Outlet>
    </>
  );
};

export default Layout;
