export default function Home() {
  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-4">
      <main className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-rose-800 mb-4 tracking-tight">
          Wedding Planner
        </h1>
        <p className="text-lg text-rose-600 mb-8">
          Organiza el día más especial de tu vida, paso a paso.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
          {[
            { title: "Invitados", desc: "Gestiona tu lista de invitados" },
            { title: "Presupuesto", desc: "Controla gastos y pagos" },
            { title: "Agenda", desc: "Planifica cada detalle del día" },
          ].map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl shadow-sm p-6 border border-rose-100 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-rose-700 mb-2">
                {card.title}
              </h2>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
