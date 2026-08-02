import { algorithms } from "../engine/algorithms/registry";
import { VideoComposer } from "../components/admin/VideoComposer";

export function AdminPage() {
  const byCategory = algorithms.reduce<Record<string, number>>((acc, algo) => {
    acc[algo.category] = (acc[algo.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col p-4 md:p-6 gap-4">
      <h1 className="font-mono text-lg text-accent-amber">Lumen — Admin</h1>
      <p className="font-mono text-xs text-text-secondary">
        ⚠️ Rota ainda sem proteção de acesso configurada. Não publicar em produção até o Cloudflare Access (ou equivalente) estar ativo.
      </p>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="bg-panel rounded-lg p-4 max-w-sm h-fit">
          <h3 className="font-mono text-xs text-text-secondary uppercase tracking-wide mb-2">
            Algoritmos por categoria
          </h3>
          <dl className="grid grid-cols-2 gap-y-1 font-mono text-sm">
            {Object.entries(byCategory).map(([category, count]) => (
              <div key={category} className="contents">
                <dt className="text-text-secondary">{category}</dt>
                <dd className="text-right text-accent-cyan">{count}</dd>
              </div>
            ))}
          </dl>
        </div>

        <VideoComposer />
      </div>
    </div>
  );
}