"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ImportResult {
  successful: number;
  failed: number;
  details: {
    success: any[];
    errors: any[];
  };
}

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const data = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: any = {};
        headers.forEach((header, idx) => {
          obj[header] = values[idx] || "";
        });
        return obj;
      });

      setPreview(data.slice(0, 5)); // Show first 5 rows
    } catch (error) {
      console.error("Error parsing CSV:", error);
      toast.error("Failed to parse CSV file");
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setLoading(true);
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const students = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: any = {};
        headers.forEach((header, idx) => {
          obj[header] = values[idx] || "";
        });

        // Map to expected format
        return {
          email: obj.email || obj["email address"],
          first_name: obj.firstname || obj["first name"] || obj.name?.split(" ")[0] || "",
          last_name: obj.lastname || obj["last name"] || obj.name?.split(" ").slice(1).join(" ") || "",
          grade: obj.grade || obj.class || "",
          batch: obj.batch || obj["batch name"] || "",
          phone: obj.phone || obj.mobile || obj["phone number"] || "",
          interests: obj.interests ? obj.interests.split(";") : [],
          goals: obj.goals ? obj.goals.split(";") : [],
        };
      });

      const response = await fetch("/api/admin/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students, type: "students" }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data.results);
        toast.success(
          `Import completed: ${data.data.results.successful} successful, ${data.data.results.failed} failed`
        );
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch (error) {
      console.error("Error importing:", error);
      toast.error("Failed to import students");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      "email",
      "first_name",
      "last_name",
      "grade",
      "batch",
      "phone",
      "interests",
      "goals",
    ];
    const csv = [headers.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bulk Import Students</h1>
          <p className="text-muted-foreground mt-1">
            Import multiple students from a CSV file
          </p>
        </div>
        <Link href="/dashboard/admin/students">
          <Button variant="outline">Back to Students</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Download the template, fill it with student data, and upload it here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="max-w-xs mx-auto"
              />
              {file && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            {preview.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Preview (first 5 rows):</p>
                <div className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                  <pre>{JSON.stringify(preview, null, 2)}</pre>
                </div>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="w-full"
            >
              {loading ? "Importing..." : "Import Students"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Import Results</CardTitle>
              <CardDescription>
                {result.successful} successful, {result.failed} failed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.details.success.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Successful ({result.successful})
                  </p>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {result.details.success.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="text-xs mb-1">
                        {item.email} - {item.first_name} {item.last_name}
                      </div>
                    ))}
                    {result.details.success.length > 10 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ... and {result.details.success.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {result.details.errors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    Failed ({result.failed})
                  </p>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {result.details.errors.slice(0, 10).map((item, idx) => (
                      <div key={idx} className="text-xs mb-1">
                        <div className="font-medium">
                          {item.row?.email || "Unknown"}
                        </div>
                        <div className="text-red-500">{item.error}</div>
                      </div>
                    ))}
                    {result.details.errors.length > 10 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        ... and {result.details.errors.length - 10} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

