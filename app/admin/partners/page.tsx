"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Clock, ChevronDown } from "lucide-react";

interface PartnerApplication {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  position: string;
  services: string[];
  status: "Pending" | "Reviewed" | "Approved" | "Rejected";
  createdAt: string;
  rejectionReason?: string;
}

export default function PartnersAdmin() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/partners");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (id: string, newStatus: string, rejectionReason?: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/partners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, rejectionReason }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: newStatus as "Pending" | "Reviewed" | "Approved" | "Rejected", rejectionReason } : app
          )
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApps = applications.filter((app) => {
    if (filter === "all") return true;
    return app.status.toLowerCase() === filter;
  });

  const statusConfig = {
    Pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
    Reviewed: { icon: ChevronDown, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    Approved: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    Rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-black mb-8">Partner Applications</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab as "all" | "pending" | "approved" | "rejected")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filter === tab
                ? "bg-[#5123d4] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({filteredApps.length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredApps.map((app) => {
          const StatusIcon = statusConfig[app.status].icon;
          return (
            <div
              key={app.id}
              className={`border-2 rounded-lg p-4 ${statusConfig[app.status].bg} ${statusConfig[app.status].border}`}
            >
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <StatusIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${statusConfig[app.status].color}`} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-black">{app.fullName}</h3>
                    <p className="text-sm text-gray-600">{app.companyName}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {app.services.map((service) => (
                        <span key={service} className="text-xs bg-white px-2 py-1 rounded font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  <p className={`font-bold ${statusConfig[app.status].color}`}>{app.status}</p>
                </div>
              </div>

              {expandedId === app.id && (
                <div className="mt-4 pt-4 border-t border-current border-opacity-20 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">Email</p>
                      <p className="text-sm text-black">{app.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 uppercase">Position</p>
                      <p className="text-sm text-black">{app.position}</p>
                    </div>
                  </div>

                  {app.status === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(app.id, "Approved")}
                        disabled={updatingId === app.id}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, "Rejected", "Application not suitable")}
                        disabled={updatingId === app.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded font-medium text-sm transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
