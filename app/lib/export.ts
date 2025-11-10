import type { Telemetry } from "./types";

export function exportToCSV(data: Telemetry[], filename = "telemetry-data"): void {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = ["Timestamp", "pH", "Temperature (°C)", "Dissolved Oxygen (mg/L)", "Fish Health (%)", "AI Quality Score", "AI Status"];
  const rows = data.map(item => [
    item.timestamp,
    item.pH.toFixed(2),
    item.temp_c.toFixed(1),
    item.do_mg_l.toFixed(2),
    item.fish_health?.toFixed(0) ?? "",
    item.quality_ai?.toFixed(1) ?? "",
    item.status_ai ?? ""
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: Telemetry[], filename = "telemetry-data"): void {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

