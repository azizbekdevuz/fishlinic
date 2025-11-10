"use client";

import { useState } from "react";
import type { Telemetry } from "@/app/lib/types";
import { Modal } from "./Modal";
import { Download, FileText, FileJson } from "lucide-react";
import { exportToCSV, exportToJSON } from "@/app/lib/export";

type ExportDataModalProps = {
  isOpen: boolean;
  onClose: () => void;
  telemetry: Telemetry[];
};

export function ExportDataModal({ isOpen, onClose, telemetry }: ExportDataModalProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [dateRange, setDateRange] = useState<"all" | "24h" | "1w" | "1m">("all");

  const getFilteredData = (): Telemetry[] => {
    if (dateRange === "all") return telemetry;

    const now = Date.now();
    const cutoffMs = (() => {
      if (dateRange === "24h") return now - 24 * 3600 * 1000;
      if (dateRange === "1w") return now - 7 * 24 * 3600 * 1000;
      return now - 30 * 24 * 3600 * 1000;
    })();

    return telemetry.filter(t => new Date(t.timestamp).getTime() >= cutoffMs);
  };

  const handleExport = () => {
    const data = getFilteredData();
    if (data.length === 0) {
      alert("No data available for the selected date range");
      return;
    }

    if (exportFormat === "csv") {
      exportToCSV(data, `telemetry-${dateRange}`);
    } else {
      exportToJSON(data, `telemetry-${dateRange}`);
    }
    onClose();
  };

  const filteredData = getFilteredData();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data" size="md">
      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block" style={{ color: "rgb(var(--text-primary))" }}>
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setExportFormat("csv")}
              className={`btn ${exportFormat === "csv" ? "btn-primary" : "btn-secondary"} flex items-center gap-2`}
            >
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => setExportFormat("json")}
              className={`btn ${exportFormat === "json" ? "btn-primary" : "btn-secondary"} flex items-center gap-2`}
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>

        {/* Date Range Selection */}
        <div>
          <label className="text-sm font-medium mb-3 block" style={{ color: "rgb(var(--text-primary))" }}>
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="input w-full"
          >
            <option value="all">All Data ({telemetry.length} records)</option>
            <option value="24h">Last 24 Hours</option>
            <option value="1w">Last Week</option>
            <option value="1m">Last Month</option>
          </select>
          <p className="text-xs mt-2" style={{ color: "rgb(var(--text-muted))" }}>
            {filteredData.length} records will be exported
          </p>
        </div>

        {/* Preview Info */}
        <div 
          className="p-4 rounded-lg"
          style={{
            background: "rgb(var(--surface-elevated))",
            border: "1px solid var(--border)"
          }}
        >
          <div className="text-sm space-y-2" style={{ color: "rgb(var(--text-secondary))" }}>
            <div className="flex justify-between">
              <span>Total Records:</span>
              <span className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                {filteredData.length}
              </span>
            </div>
            {filteredData.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span>Date Range:</span>
                  <span className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                    {new Date(filteredData[0].timestamp).toLocaleDateString()} - {new Date(filteredData[filteredData.length - 1].timestamp).toLocaleDateString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose} className="btn btn-ghost flex-1">
            Cancel
          </button>
          <button onClick={handleExport} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </Modal>
  );
}

