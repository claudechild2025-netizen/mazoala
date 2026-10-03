export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Overview Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Агуулах ба Хүргэлтийн Удирдлагын Систем</h1>
            <p className="mt-1 text-sm text-slate-500">
              Цагийн бүс: Asia/Ulaanbaatar · Нэгдсэн дэвтэр бүртгэл (Modular Monolith)
            </p>
          </div>
          <div className="mt-4 flex items-center space-x-2 sm:mt-0">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Систем хэвийн
            </span>
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
              Gate 0: Эх сурвалж баталгаажуулах
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm border border-slate-200">
          <dt className="truncate text-sm font-medium text-slate-500">Үлдэгдэлтэй бараа (On-Hand)</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">0</dd>
          <p className="mt-2 text-xs text-slate-400">Нөөцлөгдсөн: 0 · Боломжит: 0</p>
        </div>

        <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm border border-slate-200">
          <dt className="truncate text-sm font-medium text-slate-500">Нөөцөлсөн (Reserved)</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-amber-600">0</dd>
          <p className="mt-2 text-xs text-slate-400">Илүүдэл захиалга зөвшөөрөгдөхгүй</p>
        </div>

        <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm border border-slate-200">
          <dt className="truncate text-sm font-medium text-slate-500">Үнийн зөрүүтэй жагсаалт (Gaps)</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-rose-600">12</dd>
          <p className="mt-2 text-xs text-slate-400">NULL үнэ · Шалгах шаардлагатай</p>
        </div>

        <div className="overflow-hidden rounded-lg bg-white p-5 shadow-sm border border-slate-200">
          <dt className="truncate text-sm font-medium text-slate-500">Кодгүй таг (Quarantined Lids)</dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-slate-600">2</dd>
          <p className="mt-2 text-xs text-slate-400">Худалдаанд гаргахыг хориглосон</p>
        </div>
      </div>

      {/* Legacy Rule Invariants & Execution Checklist */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Үндсэн дүрмүүд ба Хязгаарлалтууд</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-start">
              <span className="mr-2 text-emerald-500 font-bold">✓</span>
              <span><strong>L01 Код ба Өнгө:</strong> Бараа ↔ Барааны код ↔ Өнгө яг тохирсон үед нэгтгэнэ.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-emerald-500 font-bold">✓</span>
              <span><strong>L02 Орлого тооцох:</strong> Тооцоолсон тоо зөвхөн баталгаажсаны дараа үлдэгдэлд нэмэгдэнэ.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-emerald-500 font-bold">✓</span>
              <span><strong>L03 Бэлтгэл хасалт:</strong> Баглаа боодлын бэлтгэл хийгдэх үед үлдэгдэл 1 л удаа хасагдана.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-emerald-500 font-bold">✓</span>
              <span><strong>L04 Лхагва гарагийн тайлан:</strong> Албан ёсны тайлан зөвхөн Asia/Ulaanbaatar бүсийн Лхагва гарагт үүснэ.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Системийн Архитектур</h2>
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-xs font-mono text-slate-700">
            Staff → Next.js Admin & API (/api/v1)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Pure Domain Modules (@mazoala/domain)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Drizzle ORM + PostgreSQL (@mazoala/db)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;→ Transactional Outbox → Background Worker
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Шалгалт болон тестүүд бэлэн болсон. 10 минутын төлөвлөгөөний дагуу бүх суурь сангууд холбогдсон.
          </p>
        </div>
      </div>
    </div>
  );
}
