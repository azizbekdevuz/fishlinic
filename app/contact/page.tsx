import info from "@/info.json";
import type { Info } from "@/app/types/info";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <section className="card p-8">
        <h1 className="text-2xl font-bold text-slate-100">Contact & Resources</h1>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="text-slate-300 font-medium">Project Links</div>
            <ul className="mt-2 text-sm text-slate-400 list-disc list-inside">
              <li><a className="text-sky-300 hover:underline" href={(info as Info).software.repos.web} target="_blank" rel="noreferrer">GitHub repository</a></li>
              <li><a className="text-sky-300 hover:underline" href={(info as Info).ai.streamUrl || "#"} target="_blank" rel="noreferrer">ESP32-CAM stream</a></li>
              {(info as Info).contact.links.map((l, i) => (
                <li key={i}><a className="text-sky-300 hover:underline" href={l.url} target="_blank" rel="noreferrer">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl p-4 border border-white/10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="text-slate-300 font-medium">Team Contacts</div>
            <ul className="mt-2 text-sm text-slate-400 list-disc list-inside">
              <li><span>Email: {(info as Info).contact.email}</span></li>
              {(info as Info).team.map((m, i) => (
                <li key={i}><a className="text-sky-300 hover:underline" href={m.links.linkedin || m.links.github || "#"} target="_blank" rel="noreferrer">{m.name}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}


