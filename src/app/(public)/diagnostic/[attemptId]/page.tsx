import { Metadata } from "next";
import { DiagnosticQuiz } from "./quiz";

export const metadata: Metadata = {
  title: "Diagnostic Quiz",
  description: "Answer questions to assess your JEE readiness.",
};

export default async function DiagnosticQuizPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  return (
    <div className="min-h-screen py-8">
      <DiagnosticQuiz attemptId={attemptId} />
    </div>
  );
}
