import { PageHead } from "../components/Layout";
import Status from "../components/Status";
import { perimeter, accessLevels, rules } from "../data";

export default function Perimeter() {
  return (
    <>
      <PageHead eyebrow="Design" title="Perimeter & access"
        sub="What is inside the boundary and who is allowed across it." />
      <div className="banner banner-warning" role="note">
        <Status tone="warning" /> <span>Config is in <code>spec</code> only. Promote to <code>status</code> after triage (FR-10).</span>
      </div>
      <div className="card">
        <div className="card-head"><h2>{perimeter.name}</h2><Status tone="warning" /></div>
        <div className="card-body">
          <p className="muted">Projects: {perimeter.projects.join(", ")}</p>
          <ul className="chips">{perimeter.services.map((s) => <li key={s} className="tag">{s}</li>)}</ul>
        </div>
      </div>
      <div className="card">
        <div className="card-head"><h2>Access levels</h2></div>
        <div className="table-wrap"><table>
          <thead><tr><th>Name</th><th>Type</th><th>Detail</th></tr></thead>
          <tbody>{accessLevels.map((a) => (
            <tr key={a.name}><td><code>{a.name}</code></td><td>{a.kind}</td><td>{a.detail}</td></tr>))}</tbody>
        </table></div>
      </div>
      <div className="card">
        <div className="card-head"><h2>Ingress & egress rules</h2></div>
        <div className="table-wrap"><table>
          <thead><tr><th>ID</th><th>Direction</th><th>Identity</th><th>Scope</th><th>Expires</th></tr></thead>
          <tbody>{rules.map((r) => (
            <tr key={r.id}><td><code>{r.id}</code></td>
              <td><Status tone={r.type === "Ingress" ? "good" : "info"}>{r.type}</Status></td>
              <td>{r.who}</td><td>{r.what}</td><td>{r.expires}</td></tr>))}</tbody>
        </table></div>
      </div>
    </>
  );
}
