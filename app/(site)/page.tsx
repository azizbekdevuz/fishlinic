import info from "@/info.json";
import { SafeImage } from "@/app/components/SafeImage";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl">
      <section className="card p-8">
        <h1 className="text-3xl font-bold text-slate-100">{info.project.name}</h1>
        <p className="mt-2 text-slate-300 max-w-3xl">{info.project.overview}</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {info.features.slice(0,6).map((f, i) => (
            <div key={i} className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-3">
                <SafeImage src={f.image} alt={f.title} className="w-12 h-12 rounded object-cover" />
                <div>
                  <div className="text-slate-300 font-medium">{f.title}</div>
                  <div className="text-sm text-slate-400 mt-1">{f.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


