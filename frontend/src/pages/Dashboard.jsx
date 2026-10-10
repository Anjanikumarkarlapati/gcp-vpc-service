import { Link } from "react-router-dom";
import { PageHead } from "../components/Layout";
import Status from "../components/Status";
import { perimeter, violations, tests } from "../data";

export default function Dashboard() {
  const dry = violations.filter((v) => v.dry).length;
  const blocked = violations.length - dry;
  const passed = tests.filter((t) => t.result === "pass").length;
  const pct = Math.round((perimeter.soakDays / perimeter.soakTarget) * 100);
  const max = Math.max(dry, blocked, 1);
  return (
    <>
      <PageHead eyebrow="Overview" title="Perimeter status"
        sub="Is the sensitive project protected, and is it safe to enforce?" />
      <section className="hero">
        <div>
          <div className="eyebrow inv">{perimeter.name}</div>
          <div className="big">{perimeter.soakDays}<span> / {perimeter.soakTarget} days</span></div>
          <p>Dry-run soak. Enforce only after all violations are triaged.</p>
        </div>
        <div className="meter" role="img" aria-label={`Soak ${pct}% complete`}>
          <div style={{ width: `${pct}%` }} />
        </div>
        <Status tone={perimeter.mode === "dry-run" ? "warning" : "good"}>
          {perimeter.mode === "dry-run" ? "Dry-run: not blocking" : "Enforced"}
        </Status>
      </section>
      <div className="grid3">
        <div className="card tile">
          <h2>Violations (7 days)</h2>
          <div className="bars">
            <div className="barrow"><span>Logged (dry-run)</span>
              <i className="bar bar-warn" style={{ width: `${(dry / max) * 100}%` }} /><b>{dry}</b></div>
            <div className="barrow"><span>Denied (enforced)</span>
              <i className="bar bar-crit" style={{ width: `${(blocked / max) * 100}%` }} /><b>{blocked}</b></div>
          </div>
          <Link to="/violations">Open violations</Link>
        </div>
        <div className="card tile">
          <h2>Validation tests</h2>
          <div className="big sm">{passed}<span> / {tests.length} passing</span></div>
          <Status tone="good">{passed} allowed / denied as expected</Status>
          <p><Link to="/tests">See T1–T8</Link></p>
        </div>
        <div className="card tile">
          <h2>Protected services</h2>
          <div className="big sm">{perimeter.services.length}<span> restricted</span></div>
          <p className="muted">Reached through {perimeter.vip}</p>
          <Link to="/perimeter">View perimeter</Link>
        </div>
      </div>
    </>
  );
}
