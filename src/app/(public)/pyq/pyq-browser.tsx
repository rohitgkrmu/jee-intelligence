"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Zap,
  FlaskConical,
  Calculator,
  X,
  RotateCcw,
} from "lucide-react";

interface QuestionOption {
  id: string;
  text: string;
}

interface Question {
  id: string;
  examType: "MAIN" | "ADVANCED";
  examYear: number;
  examSession?: string;
  subject: "PHYSICS" | "CHEMISTRY" | "MATHEMATICS";
  chapter: string;
  topic: string;
  concept: string;
  questionType: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionText: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  solution?: string;
}

interface Filters {
  subject: string | null;
  examType: string | null;
  year: string | null;
  difficulty: string | null;
  chapter: string | null;
  questionType: string | null;
  search: string;
}

interface FilterOptions {
  years: { year: number; count: number }[];
  chapters: Record<string, { chapter: string; count: number }[]>;
  questionTypes: { type: string; count: number }[];
  difficulties: { level: string; count: number }[];
  examTypes: { type: string; count: number }[];
  subjects: { subject: string; count: number }[];
}

export function PYQBrowser() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<Filters>({
    subject: null,
    examType: null,
    year: null,
    difficulty: null,
    chapter: null,
    questionType: null,
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [showFilters, setShowFilters] = useState(true);
  const [showAnswers, setShowAnswers] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Fetch filter options
  useEffect(() => {
    async function fetchFilters() {
      try {
        const params = new URLSearchParams();
        if (filters.subject) params.set("subject", filters.subject);
        if (filters.examType) params.set("examType", filters.examType);

        const res = await fetch(`/api/pyq/filters?${params}`);
        const data = await res.json();
        setFilterOptions(data);
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    }
    fetchFilters();
  }, [filters.subject, filters.examType]);

  // Fetch questions
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      if (showAnswers) params.set("showAnswers", "true");

      if (filters.subject) params.set("subject", filters.subject);
      if (filters.examType) params.set("examType", filters.examType);
      if (filters.year) params.set("year", filters.year);
      if (filters.difficulty) params.set("difficulty", filters.difficulty);
      if (filters.chapter) params.set("chapter", filters.chapter);
      if (filters.questionType) params.set("questionType", filters.questionType);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/pyq?${params}`);
      const data = await res.json();

      setQuestions(data.questions || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, showAnswers]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const updateFilter = (key: keyof Filters, value: string | null) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setFilters({
      subject: null,
      examType: null,
      year: null,
      difficulty: null,
      chapter: null,
      questionType: null,
      search: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case "PHYSICS":
        return <Zap className="w-4 h-4" />;
      case "CHEMISTRY":
        return <FlaskConical className="w-4 h-4" />;
      case "MATHEMATICS":
        return <Calculator className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSubjectColor = (subject: string) => {
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

  const getDifficultyColor = (difficulty: string) => {
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

  const formatQuestionType = (type: string) => {
    switch (type) {
      case "MCQ_SINGLE":
        return "Single Choice";
      case "MCQ_MULTIPLE":
        return "Multiple Choice";
      case "NUMERICAL":
        return "Numerical";
      case "INTEGER":
        return "Integer";
      case "ASSERTION_REASON":
        return "Assertion-Reason";
      case "MATCH_THE_COLUMN":
        return "Match the Column";
      default:
        return type;
    }
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== null && v !== ""
  ).length;

  return (
    <div className="space-y-6">
      {/* Filter Toggle & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search questions, topics, concepts..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value || null)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--background-elevated)] border border-[var(--border-dark)] rounded-lg focus:outline-none focus:border-[var(--zenith-cyan)] transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="cyan" size="sm">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={showAnswers ? "default" : "outline"}
            onClick={() => setShowAnswers(!showAnswers)}
            className="gap-2"
          >
            {showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showAnswers ? "Hide Answers" : "Show Answers"}
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && filterOptions && (
        <Card className="border-[var(--border-dark)]">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Filters</h3>
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-xs">
                  <RotateCcw className="w-3 h-3" />
                  Reset all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Exam Type */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  Exam Type
                </label>
                <select
                  value={filters.examType || ""}
                  onChange={(e) => updateFilter("examType", e.target.value || null)}
                  className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--border-dark)] rounded-lg text-sm focus:outline-none focus:border-[var(--zenith-cyan)]"
                >
                  <option value="">All Exams</option>
                  {filterOptions.examTypes.map((et) => (
                    <option key={et.type} value={et.type}>
                      {et.type} ({et.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  Subject
                </label>
                <select
                  value={filters.subject || ""}
                  onChange={(e) => {
                    updateFilter("subject", e.target.value || null);
                    updateFilter("chapter", null); // Reset chapter when subject changes
                  }}
                  className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--border-dark)] rounded-lg text-sm focus:outline-none focus:border-[var(--zenith-cyan)]"
                >
                  <option value="">All Subjects</option>
                  {filterOptions.subjects.map((s) => (
                    <option key={s.subject} value={s.subject}>
                      {s.subject} ({s.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  Year
                </label>
                <select
                  value={filters.year || ""}
                  onChange={(e) => updateFilter("year", e.target.value || null)}
                  className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--border-dark)] rounded-lg text-sm focus:outline-none focus:border-[var(--zenith-cyan)]"
                >
                  <option value="">All Years</option>
                  {filterOptions.years.map((y) => (
                    <option key={y.year} value={y.year.toString()}>
                      {y.year} ({y.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty || ""}
                  onChange={(e) => updateFilter("difficulty", e.target.value || null)}
                  className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--border-dark)] rounded-lg text-sm focus:outline-none focus:border-[var(--zenith-cyan)]"
                >
                  <option value="">All Levels</option>
                  {filterOptions.difficulties.map((d) => (
                    <option key={d.level} value={d.level}>
                      {d.level} ({d.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Type */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  Question Type
                </label>
                <select
                  value={filters.questionType || ""}
                  onChange={(e) => updateFilter("questionType", e.target.value || null)}
                  className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--border-dark)] rounded-lg text-sm focus:outline-none focus:border-[var(--zenith-cyan)]"
                >
                  <option value="">All Types</option>
                  {filterOptions.questionTypes.map((qt) => (
                    <option key={qt.type} value={qt.type}>
                      {formatQuestionType(qt.type)} ({qt.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter */}
              <div>
                <label className="text-xs text-[var(--text-muted)] mb-1 block">
                  Chapter
                </label>
                <select
                  value={filters.chapter || ""}
                  onChange={(e) => updateFilter("chapter", e.target.value || null)}
                  className="w-full px-3 py-2 bg-[var(--background-dark)] border border-[var(--border-dark)] rounded-lg text-sm focus:outline-none focus:border-[var(--zenith-cyan)]"
                >
                  <option value="">All Chapters</option>
                  {filters.subject && filterOptions.chapters[filters.subject] ? (
                    filterOptions.chapters[filters.subject].map((ch) => (
                      <option key={ch.chapter} value={ch.chapter}>
                        {ch.chapter} ({ch.count})
                      </option>
                    ))
                  ) : (
                    Object.entries(filterOptions.chapters).map(([subject, chapters]) =>
                      chapters.slice(0, 10).map((ch) => (
                        <option key={`${subject}-${ch.chapter}`} value={ch.chapter}>
                          {ch.chapter} ({ch.count})
                        </option>
                      ))
                    )
                  )}
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border-dark)]">
                {filters.examType && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.examType}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => updateFilter("examType", null)}
                    />
                  </Badge>
                )}
                {filters.subject && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.subject}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => updateFilter("subject", null)}
                    />
                  </Badge>
                )}
                {filters.year && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.year}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => updateFilter("year", null)}
                    />
                  </Badge>
                )}
                {filters.difficulty && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.difficulty}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => updateFilter("difficulty", null)}
                    />
                  </Badge>
                )}
                {filters.chapter && (
                  <Badge variant="secondary" className="gap-1">
                    {filters.chapter}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => updateFilter("chapter", null)}
                    />
                  </Badge>
                )}
                {filters.questionType && (
                  <Badge variant="secondary" className="gap-1">
                    {formatQuestionType(filters.questionType)}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => updateFilter("questionType", null)}
                    />
                  </Badge>
                )}
                {filters.search && (
                  <Badge variant="secondary" className="gap-1">
                    &quot;{filters.search}&quot;
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => updateFilter("search", null)}
                    />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          {loading ? (
            "Loading..."
          ) : (
            <>
              Showing {questions.length} of{" "}
              <span className="font-semibold text-[var(--text-primary)]">
                {pagination.total}
              </span>{" "}
              questions
            </>
          )}
        </p>
        <select
          value={pagination.limit}
          onChange={(e) =>
            setPagination((prev) => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))
          }
          className="px-2 py-1 bg-[var(--background-elevated)] border border-[var(--border-dark)] rounded text-sm"
        >
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--zenith-cyan)]" />
        </div>
      ) : questions.length === 0 ? (
        <Card className="border-[var(--border-dark)]">
          <CardContent className="py-12 text-center">
            <p className="text-[var(--text-muted)]">No questions found matching your filters.</p>
            <Button variant="outline" onClick={resetFilters} className="mt-4">
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id} className="border-[var(--border-dark)] overflow-hidden">
              <CardContent className="pt-4">
                {/* Question Header */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge
                    variant={getSubjectColor(q.subject) as "cyan" | "purple" | "default"}
                    size="sm"
                    className="gap-1"
                  >
                    {getSubjectIcon(q.subject)}
                    {q.subject}
                  </Badge>
                  <Badge variant={q.examType === "ADVANCED" ? "warning" : "secondary"} size="sm">
                    {q.examType} {q.examYear}
                  </Badge>
                  <Badge variant={getDifficultyColor(q.difficulty) as "success" | "warning" | "error"} size="sm">
                    {q.difficulty}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {formatQuestionType(q.questionType)}
                  </Badge>
                  <span className="text-xs text-[var(--text-muted)] ml-auto">
                    #{(pagination.page - 1) * pagination.limit + idx + 1}
                  </span>
                </div>

                {/* Chapter & Topic */}
                <div className="text-xs text-[var(--text-muted)] mb-3">
                  <span className="font-medium">{q.chapter}</span>
                  {q.topic && <span> → {q.topic}</span>}
                </div>

                {/* Question Text */}
                <div className="prose prose-invert prose-sm max-w-none mb-4">
                  <p className="whitespace-pre-wrap">{q.questionText}</p>
                </div>

                {/* Options */}
                {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                    {q.options.map((option) => (
                      <div
                        key={option.id}
                        className={`p-2 rounded-lg text-sm ${
                          showAnswers && q.correctAnswer?.includes(option.id)
                            ? "bg-green-500/20 border border-green-500/30"
                            : "bg-[var(--background-dark)]"
                        }`}
                      >
                        <span className="font-medium mr-2">({option.id})</span>
                        {option.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer & Solution Toggle */}
                {showAnswers && (q.correctAnswer || q.solution) && (
                  <div className="border-t border-[var(--border-dark)] pt-3 mt-3">
                    <button
                      onClick={() => toggleQuestion(q.id)}
                      className="flex items-center gap-2 text-sm font-medium text-[var(--zenith-cyan)] hover:underline"
                    >
                      {expandedQuestions.has(q.id) ? (
                        <>
                          <ChevronUp className="w-4 h-4" />
                          Hide Solution
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4" />
                          Show Solution
                        </>
                      )}
                    </button>

                    {expandedQuestions.has(q.id) && (
                      <div className="mt-3 space-y-2">
                        {q.correctAnswer && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--text-muted)]">Answer:</span>
                            <Badge variant="success">{q.correctAnswer}</Badge>
                          </div>
                        )}
                        {q.solution && (
                          <div className="p-3 bg-[var(--background-dark)] rounded-lg">
                            <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">
                              {q.solution}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pagination.page === pageNum ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.totalPages}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
