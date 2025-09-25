import info from "@/info.json";
import { SafeImage } from "@/app/components/SafeImage";
import type { Info } from "@/app/types/info";

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="card p-8">
        <h1 className="text-2xl font-bold text-slate-100">Our Team</h1>
        <p className="mt-2 text-slate-300">Sejong University Capstone Design — Team Fishlinic</p>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(info as Info).team.map((m, i) => (
            <div key={i} className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
              <SafeImage src={m.photo} alt={m.name} className="w-full h-36 rounded-lg object-cover mb-3" />
              <div className="text-slate-200 font-medium">{m.name}</div>
              <div className="text-sm text-slate-400">{m.role}</div>
              <div className="text-sm text-slate-400 mt-1">{m.bio}</div>
              <div className="mt-2 flex gap-3 text-sm">
                {m.links.github && <a className="text-sky-300 hover:underline" href={m.links.github} target="_blank" rel="noreferrer">GitHub</a>}
                {m.links.linkedin && <a className="text-sky-300 hover:underline" href={m.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


