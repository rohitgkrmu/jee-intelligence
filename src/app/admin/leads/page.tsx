"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  class?: string;
  targetYear?: number;
  city?: string;
  school?: string;
  marketingConsent: boolean;
  whatsappConsent: boolean;
  createdAt: string;
  diagnosticAttempts: {
    id: string;
    status: string;
    readinessScore?: number;
    completedAt?: string;
  }[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    class: "",
    targetYear: "",
  });

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.class && { class: filters.class }),
        ...(filters.targetYear && { targetYear: filters.targetYear }),
      });

      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLeads(data.leads);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [pagination.page, filters.class, filters.targetYear]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchLeads();
  };

  const handleExport = () => {
    const params = new URLSearchParams({
      ...(filters.class && { class: filters.class }),
      ...(filters.targetYear && { targetYear: filters.targetYear }),
    });

    window.open(`/api/leads/export?${params}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-[var(--text-muted)]">
            View and manage captured leads
          </p>
        </div>
        <Button variant="primary" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by name, email, or phone..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
            <Select
              options={[
                { value: "11", label: "Class 11" },
                { value: "12", label: "Class 12" },
                { value: "Dropper", label: "Dropper" },
              ]}
              value={filters.class}
              onChange={(e) =>
                setFilters({ ...filters, class: e.target.value })
              }
              placeholder="All Classes"
            />
            <Select
              options={[
                { value: "2025", label: "JEE 2025" },
                { value: "2026", label: "JEE 2026" },
                { value: "2027", label: "JEE 2027" },
              ]}
              value={filters.targetYear}
              onChange={(e) =>
                setFilters({ ...filters, targetYear: e.target.value })
              }
              placeholder="All Target Years"
            />
            <Button type="submit" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--zenith-cyan)]" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-20 text-[var(--text-muted)]">
              No leads found. Try adjusting your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[var(--border-dark)]">
                  <tr className="text-left text-sm text-[var(--text-muted)]">
                    <th className="p-4">Name</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Academic</th>
                    <th className="p-4">Diagnostic</th>
                    <th className="p-4">Consent</th>
                    <th className="p-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const lastAttempt = lead.diagnosticAttempts[0];

                    return (
                      <tr
                        key={lead.id}
                        className="border-b border-[var(--border-dark)] hover:bg-[var(--background-elevated)]"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            {lead.city && (
                              <p className="text-xs text-[var(--text-muted)]">
                                {lead.city}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                              <span className="text-[var(--text-secondary)]">
                                {lead.email}
                              </span>
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3 text-[var(--text-muted)]" />
                                <span className="text-[var(--text-secondary)]">
                                  {lead.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {lead.class && (
                              <Badge variant="secondary" size="sm">
                                Class {lead.class}
                              </Badge>
                            )}
                            {lead.targetYear && (
                              <p className="text-xs text-[var(--text-muted)]">
                                Target: JEE {lead.targetYear}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {lastAttempt ? (
                            <div>
                              <Badge
                                variant={
                                  lastAttempt.status === "COMPLETED"
                                    ? "success"
                                    : "warning"
                                }
                                size="sm"
                              >
                                {lastAttempt.status}
                              </Badge>
                              {lastAttempt.readinessScore != null && (
                                <p className="text-sm font-medium mt-1">
                                  Score: {Math.round(lastAttempt.readinessScore!)}%
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--text-muted)]">
                              No attempt
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {lead.marketingConsent && (
                              <Badge variant="cyan" size="sm">
                                Email
                              </Badge>
                            )}
                            {lead.whatsappConsent && (
                              <Badge variant="success" size="sm">
                                WA
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-[var(--text-secondary)]">
                          {formatDate(lead.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} leads
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
              disabled={pagination.page === pagination.totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
