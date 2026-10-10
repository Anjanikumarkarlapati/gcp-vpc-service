import { PageHead } from "../components/Layout";
import { decisionTree, rollout } from "../data";

export default function Runbook() {
  return (
    <>
      <PageHead eyebrow="Operate" title="Runbook"
        sub="Violation type to cause to fix, plus the safe rollout and rollback." />
      <div className="card">
        <div className="card-head"><h2>Decision tree</h2></div>
        <div className="table-wrap"><table>
          <thead><tr><th>Violation reason</th><th>Likely cause</th><th>Fix</th></tr></thead>
          <tbody>{decisionTree.map((d) => (
            <tr key={d.reason}><td><code>{d.reason}</code></td><td>{d.cause}</td><td>{d.fix}</td></tr>))}</tbody>
        </table></div>
      </div>
      <div className="card">
        <div className="card-head"><h2>Rollout and rollback</h2></div>
        <ol className="steps">{rollout.map((s) => <li key={s}>{s}</li>)}</ol>
      </div>
    </>
  );
}
