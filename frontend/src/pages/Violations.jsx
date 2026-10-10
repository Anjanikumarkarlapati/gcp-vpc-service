import { useState } from "react";
import { PageHead } from "../components/Layout";
import Status from "../components/Status";
import { violations, decisionTree } from "../data";

export default function Violations() {
  const [q, setQ] = useState("");
  const [found, setFound] = useState(null);
  const lookup = (e) => {
    e.preventDefault();
    const v = violations.find((x) => x.id === q.trim());
    setFound(v ? { v, d: decisionTree.find((d) => d.reason === v.reason) } : false);
  };
  return (
    <>
      <PageHead eyebrow="Troubleshooting" title="Violations"
        sub="Look up a denial by its unique ID (FR-14, FR-17)." />
      <form className="card lookup" onSubmit={lookup}>
        <label htmlFor="uid">Why was I denied? Violation ID</label>
        <div className="row">
          <input id="uid" className="input" placeholder="vpcsc-7f3a91" value={q}
            onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-primary" type="submit">Look up</button>
        </div>
        {found === false && <p role="alert"><Status tone="critical">No match</Status> Check the ID from the 403 error.</p>}
        {found && (
          <div role="status" className="result">
            <p><Status tone={found.v.dry ? "warning" : "critical"} /> <code>{found.v.reason}</code></p>
            <p><b>Likely cause:</b> {found.d.cause}</p>
            <p><b>Fix:</b> {found.d.fix}</p>
          </div>
        )}
      </form>
      <div className="card">
        <div className="card-head"><h2>Recent violations</h2></div>
        <div className="table-wrap"><table>
          <thead><tr><th>Time</th><th>ID</th><th>Principal</th><th>Service / method</th><th>Reason</th><th>Outcome</th></tr></thead>
          <tbody>{violations.map((v) => (
            <tr key={v.id}><td>{v.time}</td><td><code>{v.id}</code></td><td>{v.principal}</td>
              <td>{v.service}<br /><span className="muted">{v.method}</span></td>
              <td><code>{v.reason}</code></td>
              <td><Status tone={v.dry ? "warning" : "critical"} /></td></tr>))}</tbody>
        </table></div>
      </div>
    </>
  );
}
