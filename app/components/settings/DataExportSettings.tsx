"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/app/hooks/useToast";
import { 
  Download, 
  FileText, 
  Database, 
  Clock,
  Save,
  RotateCcw,
  FileSpreadsheet,
  FileJson,
  Archive
} from "lucide-react";

type ExportSettings = {
  autoExport: boolean;
  exportFormat: "csv" | "json" | "excel";
  exportFrequency: "daily" | "weekly" | "monthly";
  includeMetadata: boolean;
  compressFiles: boolean;
  retentionDays: 30 | 60 | 90 | 180 | 365;
};

const DEFAULT_EXPORT: ExportSettings = {
  autoExport: false,
  exportFormat: "csv",
  exportFrequency: "weekly",
  includeMetadata: true,
  compressFiles: false,
  retentionDays: 90
};

export function DataExportSettings() {
  const toast = useToast();
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT);
  const [hasChanges, setHasChanges] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Load export settings from localStorage
    const saved = localStorage.getItem("exportSettings");
    if (saved) {
      try {
        setExportSettings(JSON.parse(saved));
      } catch {
        // Use defaults if parse fails
      }
    }
  }, []);

  useEffect(() => {
    const original = localStorage.getItem("exportSettings");
    const hasChanges = JSON.stringify(exportSettings) !== (original || JSON.stringify(DEFAULT_EXPORT));
    setHasChanges(hasChanges);
  }, [exportSettings]);

  const handleSave = () => {
    localStorage.setItem("exportSettings", JSON.stringify(exportSettings));
    toast.show("success", "Export settings saved successfully!", 3000);
    setHasChanges(false);
  };

  const handleReset = () => {
    setExportSettings(DEFAULT_EXPORT);
  };

  const updateSetting = <K extends keyof ExportSettings>(
    key: K,
    value: ExportSettings[K]
  ) => {
    setExportSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleManualExport = async () => {
    setIsExporting(true);
    try {
      // Call the export API
      const response = await fetch('/api/telemetry/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: exportSettings.exportFormat,
          includeMetadata: exportSettings.includeMetadata,
          compress: exportSettings.compressFiles
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Export failed');
      }

      // Get the blob and download it
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Set filename based on format
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = exportSettings.exportFormat === 'excel' ? 'xlsx' : exportSettings.exportFormat;
      a.download = `telemetry-data-${timestamp}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.show("success", "Data exported successfully!", 3000);
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error ? error.message : "Export failed. Please try again.";
      toast.show("error", errorMessage, 5000);
    } finally {
      setIsExporting(false);
    }
  };

  const formatOptions = [
    {
      value: "csv",
      label: "CSV",
      icon: FileText,
      description: "Comma-separated values, Excel compatible"
    },
    {
      value: "json",
      label: "JSON",
      icon: FileJson,
      description: "JavaScript Object Notation, developer friendly"
    },
    {
      value: "excel",
      label: "Excel",
      icon: FileSpreadsheet,
      description: "Microsoft Excel format with formatting"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold mb-2" style={{ color: "rgb(var(--text-primary))" }}>
          Data & Export Settings
        </h3>
        <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
          Configure data export preferences and retention policies
        </p>
      </div>

      {/* Manual Export */}
      <div className="p-4 rounded-lg border border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-600/10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-medium mb-1" style={{ color: "rgb(var(--text-primary))" }}>
              Export Current Data
            </h4>
            <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              Download all your telemetry data in your preferred format
            </p>
          </div>
          <button
            onClick={handleManualExport}
            disabled={isExporting}
            className="btn btn-primary flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Export Format */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Export Format
          </label>
        </div>
        <div className="space-y-2">
          {formatOptions.map((format) => {
            const IconComponent = format.icon;
            const isSelected = exportSettings.exportFormat === format.value;
            
            return (
              <button
                key={format.value}
                onClick={() => updateSetting("exportFormat", format.value as "csv" | "json" | "excel")}
                className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                  isSelected
                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                    : "border-white/10 hover:bg-white/5"
                }`}
                style={!isSelected ? { color: "rgb(var(--text-primary))" } : {}}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{format.label}</div>
                    <div className="text-xs opacity-70">{format.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto Export Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Automatic Export
          </label>
        </div>
        
        <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
          <div>
            <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
              Enable Auto Export
            </div>
            <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              Automatically export data at regular intervals
            </div>
          </div>
          <button
            onClick={() => updateSetting("autoExport", !exportSettings.autoExport)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              exportSettings.autoExport ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                exportSettings.autoExport ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {exportSettings.autoExport && (
          <div className="space-y-3 ml-4 pl-4 border-l-2 border-blue-500/30">
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "rgb(var(--text-primary))" }}>
                Export Frequency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "daily", label: "Daily", desc: "Every day" },
                  { value: "weekly", label: "Weekly", desc: "Every week" },
                  { value: "monthly", label: "Monthly", desc: "Every month" }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateSetting("exportFrequency", option.value as "daily" | "weekly" | "monthly")}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      exportSettings.exportFrequency === option.value
                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                    style={exportSettings.exportFrequency !== option.value ? { color: "rgb(var(--text-primary))" } : {}}
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                    <div className="text-xs opacity-70">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
          Export Options
        </h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
            <div>
              <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                Include Metadata
              </div>
              <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                Export timestamps, user info, and system data
              </div>
            </div>
            <button
              onClick={() => updateSetting("includeMetadata", !exportSettings.includeMetadata)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                exportSettings.includeMetadata ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  exportSettings.includeMetadata ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-white/10">
            <div className="flex items-center gap-2">
              <Archive className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
              <div>
                <div className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                  Compress Files
                </div>
                <div className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                  Create ZIP archives for large exports
                </div>
              </div>
            </div>
            <button
              onClick={() => updateSetting("compressFiles", !exportSettings.compressFiles)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                exportSettings.compressFiles ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  exportSettings.compressFiles ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" style={{ color: "rgb(var(--text-primary))" }} />
          <label className="text-sm font-medium" style={{ color: "rgb(var(--text-primary))" }}>
            Data Retention
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 30, label: "30 Days", desc: "1 month" },
            { value: 90, label: "90 Days", desc: "3 months" },
            { value: 180, label: "180 Days", desc: "6 months" },
            { value: 365, label: "365 Days", desc: "1 year" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateSetting("retentionDays", option.value as 30 | 60 | 90 | 180 | 365)}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                exportSettings.retentionDays === option.value
                  ? "bg-blue-500/20 border-blue-500 text-blue-400"
                  : "border-white/10 hover:bg-white/5"
              }`}
              style={exportSettings.retentionDays !== option.value ? { color: "rgb(var(--text-primary))" } : {}}
            >
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs opacity-70">{option.desc}</div>
            </button>
          ))}
        </div>
        <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
          Data older than the retention period will be automatically archived
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-white/10">
        <button
          onClick={handleReset}
          className="btn btn-ghost btn-sm flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset to Defaults
        </button>
        
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`btn btn-sm flex items-center gap-2 ${
            hasChanges 
              ? "btn-primary" 
              : "btn-ghost opacity-50 cursor-not-allowed"
          }`}
        >
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
