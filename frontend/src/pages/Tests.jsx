import { PageHead } from "../components/Layout";
import Status from "../components/Status";
import { tests } from "../data";

export default function Tests() {
  return (
    <>
      <PageHead eyebrow="Validation" title="Test plan (T1–T8)"
        sub="Exfiltration allow/deny scenarios from the architecture (FR-21)." />
      <div className="card"><div className="table-wrap"><table>
        <thead><tr><th>#</th><th>Scenario</th><th>Expected</th><th>Result</th></tr></thead>
        <tbody>{tests.map((t) => (
          <tr key={t.id}><td><code>{t.id}</code></td><td>{t.name}</td><td>{t.expect}</td>
            <td>{t.result === "pass" ? <Status tone="good">Pass</Status> : <Status tone="muted" />}</td></tr>))}</tbody>
      </table></div></div>
    </>
  );
}
