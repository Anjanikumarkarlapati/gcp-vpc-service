import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

const NAV = [
  ["/", "Dashboard"], ["/perimeter", "Perimeter"], ["/violations", "Violations"],
  ["/runbook", "Runbook"], ["/tests", "Tests"],
];

export default function Layout() {
  const [theme, setTheme] = useState(document.documentElement.dataset.theme || "light");
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    setTheme(next);
  };
  return (
    <>
      <header className="topbar">
        <span className="wordmark"><i className="mark" aria-hidden="true" />VPC-SC Console</span>
        <nav aria-label="Main">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className="navlink">{label}</NavLink>
          ))}
        </nav>
        <button className="btn btn-quiet btn-sm" onClick={toggle} aria-pressed={theme === "dark"}>
          {theme === "dark" ? "Light" : "Dark"} theme
        </button>
      </header>
      <main className="page"><Outlet /></main>
    </>
  );
}

export function PageHead({ eyebrow, title, sub }) {
  return (
    <div className="page-head">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {sub && <p className="sub">{sub}</p>}
    </div>
  );
}
