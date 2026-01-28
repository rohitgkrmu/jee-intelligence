"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";

interface Question {
  id: string;
  examType: string;
  examYear: number;
  subject: string;
  chapter: string;
  topic: string;
  concept: string;
  questionType: string;
  difficulty: string;
  isActive: boolean;
  datasetSource: { name: string; type: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    subject: "",
    difficulty: "",
    examType: "",
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.examType && { examType: filters.examType }),
      });

      const response = await fetch(`/api/questions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setQuestions(data.questions);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [pagination.page, filters.subject, filters.difficulty, filters.examType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchQuestions();
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "success";
      case "MEDIUM":
        return "warning";
      case "HARD":
        return "error";
      default:
        return "secondary";
    }
  };

  const getSubjectBadge = (subject: string) => {
    switch (subject) {
      case "PHYSICS":
        return "cyan";
      case "CHEMISTRY":
        return "purple";
      case "MATHEMATICS":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Questions</h1>
          <p className="text-[var(--text-muted)]">
            Manage JEE historical questions
          </p>
        </div>
        <Link href="/admin/questions/new">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search concepts, topics..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
            <Select
              options={[
                { value: "PHYSICS", label: "Physics" },
                { value: "CHEMISTRY", label: "Chemistry" },
                { value: "MATHEMATICS", label: "Mathematics" },
              ]}
              value={filters.subject}
              onChange={(e) =>
                setFilters({ ...filters, subject: e.target.value })
              }
              placeholder="All Subjects"
            />
            <Select
              options={[
                { value: "EASY", label: "Easy" },
                { value: "MEDIUM", label: "Medium" },
                { value: "HARD", label: "Hard" },
              ]}
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
              placeholder="All Difficulties"
            />
            <Select
              options={[
                { value: "MAIN", label: "JEE Main" },
                { value: "ADVANCED", label: "JEE Advanced" },
              ]}
              value={filters.examType}
              onChange={(e) =>
                setFilters({ ...filters, examType: e.target.value })
              }
              placeholder="All Exams"
            />
            <Button type="submit" variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[var(--zenith-cyan)]" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 text-[var(--text-muted)]">
              No questions found. Try adjusting your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[var(--border-dark)]">
                  <tr className="text-left text-sm text-[var(--text-muted)]">
                    <th className="p-4">Concept</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Chapter</th>
                    <th className="p-4">Exam</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question) => (
                    <tr
                      key={question.id}
                      className="border-b border-[var(--border-dark)] hover:bg-[var(--background-elevated)]"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{question.concept}</p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {question.topic}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getSubjectBadge(question.subject) as "default" | "cyan" | "purple" | "secondary"} size="sm">
                          {question.subject}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-[var(--text-secondary)]">
                        {question.chapter}
                      </td>
                      <td className="p-4 text-sm">
                        {question.examType} {question.examYear}
                      </td>
                      <td className="p-4">
                        <Badge variant={getDifficultyBadge(question.difficulty) as "success" | "warning" | "error" | "secondary"} size="sm">
                          {question.difficulty}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={question.isActive ? "success" : "secondary"}
                          size="sm"
                        >
                          {question.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/questions/${question.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
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
            {pagination.total} questions
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
