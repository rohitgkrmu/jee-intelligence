"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
} from "lucide-react";
import Link from "next/link";

interface QuestionAnalysis {
  id: string;
  questionNumber: number;
  sectionType: "A" | "B";
  chapter: string;
  difficulty: string;
  questionType: string;
  questionText: string;
  options: { id: string; text: string }[] | null;
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean | null;
  solution: string | null;
  timeSpent: number;
}

interface ChapterAnalysis {
  chapter: string;
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  accuracy: number;
}

interface Report {
  attemptId: string;
  mockTestName: string;
  candidateName: string;
  totalScore: number;
  maxScore: number;
  percentile: number;
  rank: number | null;
  physicsScore: number;
  chemistryScore: number;
  mathScore: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalTimeSeconds: number;
  duration: number;
  startedAt: string;
  completedAt: string;
  questions: {
    physics: QuestionAnalysis[];
    chemistry: QuestionAnalysis[];
    mathematics: QuestionAnalysis[];
  };
  chapterAnalysis: ChapterAnalysis[];
}

interface Props {
  report: Report;
}

export function ReportView({ report }: Props) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
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

  const scorePercentage = Math.round((report.totalScore / report.maxScore) * 100);

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Mock Test Report
          </h1>
          <p className="text-[var(--text-secondary)]">
            {report.mockTestName} - {report.candidateName}
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Completed on{" "}
            {new Date(report.completedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Score Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Total Score</p>
                  <p className="text-4xl font-bold">
                    {report.totalScore}
                    <span className="text-xl text-[var(--text-muted)]">
                      /{report.maxScore}
                    </span>
                  </p>
                </div>
                <div className="h-20 w-20 rounded-full border-4 border-[var(--zenith-cyan)] flex items-center justify-center">
                  <span className="text-2xl font-bold">{scorePercentage}%</span>
                </div>
              </div>
              <Progress value={scorePercentage} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <p className="text-3xl font-bold">{report.percentile}%</p>
              <p className="text-sm text-[var(--text-muted)]">Percentile</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-[var(--zenith-cyan)]" />
              <p className="text-3xl font-bold">
                {formatTime(report.totalTimeSeconds)}
              </p>
              <p className="text-sm text-[var(--text-muted)]">Time Taken</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Scores */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Subject-wise Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-400">Physics</span>
                  <span className="text-2xl font-bold">
                    {report.physicsScore}
                  </span>
                </div>
                <Progress
                  value={(report.physicsScore / 120) * 100}
                  className="h-2"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Out of 120 marks
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-green-400">Chemistry</span>
                  <span className="text-2xl font-bold">
                    {report.chemistryScore}
                  </span>
                </div>
                <Progress
                  value={(report.chemistryScore / 120) * 100}
                  className="h-2"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Out of 120 marks
                </p>
              </div>

              <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-purple-400">
                    Mathematics
                  </span>
                  <span className="text-2xl font-bold">{report.mathScore}</span>
                </div>
                <Progress
                  value={(report.mathScore / 120) * 100}
                  className="h-2"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Out of 120 marks
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Answer Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-400" />
                <p className="text-3xl font-bold text-green-400">
                  {report.correctCount}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Correct</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <XCircle className="h-6 w-6 mx-auto mb-2 text-red-400" />
                <p className="text-3xl font-bold text-red-400">
                  {report.incorrectCount}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Incorrect</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
                <MinusCircle className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                <p className="text-3xl font-bold text-gray-400">
                  {report.unansweredCount}
                </p>
                <p className="text-sm text-[var(--text-muted)]">Unanswered</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapter Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Chapter-wise Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.chapterAnalysis.slice(0, 10).map((chapter) => (
                <div
                  key={chapter.chapter}
                  className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-elevated)]"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{chapter.chapter}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-[var(--text-muted)]">
                      <span className="text-green-400">
                        {chapter.correct} correct
                      </span>
                      <span className="text-red-400">
                        {chapter.incorrect} wrong
                      </span>
                      <span>{chapter.unanswered} skipped</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold ${
                        chapter.accuracy >= 70
                          ? "text-green-400"
                          : chapter.accuracy >= 40
                          ? "text-yellow-400"
                          : "text-red-400"
                      }`}
                    >
                      {chapter.accuracy}%
                    </span>
                    <p className="text-xs text-[var(--text-muted)]">accuracy</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Question Analysis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Question-wise Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedSubject} onValueChange={setSelectedSubject}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="physics">Physics</TabsTrigger>
                <TabsTrigger value="chemistry">Chemistry</TabsTrigger>
                <TabsTrigger value="mathematics">Mathematics</TabsTrigger>
              </TabsList>

              {["all", "physics", "chemistry", "mathematics"].map((subject) => (
                <TabsContent key={subject} value={subject}>
                  <div className="space-y-3">
                    {(subject === "all"
                      ? [
                          ...report.questions.physics,
                          ...report.questions.chemistry,
                          ...report.questions.mathematics,
                        ]
                      : report.questions[
                          subject as keyof typeof report.questions
                        ]
                    ).map((question, idx) => {
                      const isExpanded = expandedQuestions.has(question.id);
                      return (
                        <div
                          key={question.id}
                          className="border border-[var(--border-dark)] rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleQuestion(question.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-[var(--background-elevated)] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {question.isCorrect === true && (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              )}
                              {question.isCorrect === false && (
                                <XCircle className="h-5 w-5 text-red-400" />
                              )}
                              {question.isCorrect === null && (
                                <MinusCircle className="h-5 w-5 text-gray-400" />
                              )}
                              <span className="font-medium">
                                Q{idx + 1}
                              </span>
                              <Badge variant="secondary" size="sm">
                                {question.chapter}
                              </Badge>
                              <Badge
                                variant={
                                  question.difficulty === "EASY"
                                    ? "success"
                                    : question.difficulty === "MEDIUM"
                                    ? "warning"
                                    : "error"
                                }
                                size="sm"
                              >
                                {question.difficulty}
                              </Badge>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-[var(--text-muted)]" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-[var(--text-muted)]" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="p-4 border-t border-[var(--border-dark)] bg-[var(--background-elevated)]">
                              <div
                                className="prose prose-sm prose-invert max-w-none mb-4"
                                dangerouslySetInnerHTML={{
                                  __html: question.questionText,
                                }}
                              />

                              {question.options && (
                                <div className="space-y-2 mb-4">
                                  {question.options.map((option) => {
                                    const isCorrect =
                                      option.id === question.correctAnswer;
                                    const isUserAnswer =
                                      option.id === question.userAnswer;
                                    return (
                                      <div
                                        key={option.id}
                                        className={`p-3 rounded-lg border ${
                                          isCorrect
                                            ? "border-green-500/50 bg-green-500/10"
                                            : isUserAnswer && !isCorrect
                                            ? "border-red-500/50 bg-red-500/10"
                                            : "border-[var(--border-dark)]"
                                        }`}
                                      >
                                        <span className="font-medium mr-2">
                                          {option.id}.
                                        </span>
                                        <span
                                          dangerouslySetInnerHTML={{
                                            __html: option.text,
                                          }}
                                        />
                                        {isCorrect && (
                                          <Badge
                                            variant="success"
                                            size="sm"
                                            className="ml-2"
                                          >
                                            Correct
                                          </Badge>
                                        )}
                                        {isUserAnswer && !isCorrect && (
                                          <Badge
                                            variant="error"
                                            size="sm"
                                            className="ml-2"
                                          >
                                            Your Answer
                                          </Badge>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {!question.options && (
                                <div className="mb-4 space-y-2">
                                  <p>
                                    <strong>Correct Answer:</strong>{" "}
                                    {question.correctAnswer}
                                  </p>
                                  <p>
                                    <strong>Your Answer:</strong>{" "}
                                    {question.userAnswer || "Not answered"}
                                  </p>
                                </div>
                              )}

                              {question.solution && (
                                <div className="p-3 rounded-lg bg-[var(--background-card)] border border-[var(--border-dark)]">
                                  <p className="font-medium mb-2">Solution:</p>
                                  <div
                                    className="prose prose-sm prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{
                                      __html: question.solution,
                                    }}
                                  />
                                </div>
                              )}

                              <p className="text-xs text-[var(--text-muted)] mt-3">
                                Time spent: {formatTime(question.timeSpent)}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/mock-test">
            <Button variant="gradient" size="lg">
              Take Another Test
            </Button>
          </Link>
          <Button variant="outline" size="lg" disabled>
            <Download className="h-4 w-4 mr-2" />
            Download PDF (Coming Soon)
          </Button>
          <Button variant="outline" size="lg" disabled>
            <Share2 className="h-4 w-4 mr-2" />
            Share (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
}
