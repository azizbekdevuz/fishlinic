import info from "@/info.json";
import { SafeImage } from "@/app/components/SafeImage";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="card p-8">
        <h1 className="text-2xl font-bold text-slate-100">About the Project</h1>
        <p className="mt-2 text-slate-300">{info.project.overview}</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="text-slate-300 font-medium">Hardware</div>
            <div className="text-sm text-slate-400 mt-1">{info.hardware.boards.join(", ")} · {info.hardware.sensors.join(", ")}</div>
            <div className="mt-3 flex gap-3">
              {info.hardware.photos.map((p, i) => (
                <SafeImage key={i} src={p} alt="hardware" className="w-28 h-20 rounded object-cover" />
              ))}
            </div>
          </div>
          <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="text-slate-300 font-medium">Software</div>
            <div className="text-sm text-slate-400 mt-1">Stack: {info.software.stack.join(", ")}</div>
            <ul className="list-disc list-inside text-sm text-slate-400 mt-2">
              <li><a className="text-sky-300 hover:underline" href={info.software.repos.web} target="_blank" rel="noreferrer">Web dashboard</a></li>
              <li><span>Bridge</span></li>
              <li><span>Firmware</span></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}


