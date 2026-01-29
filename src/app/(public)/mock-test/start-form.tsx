"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  termsAccepted?: string;
  general?: string;
}

export function MockTestStartForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    class: "",
    targetYear: "",
    termsAccepted: false,
    marketingConsent: false,
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit Indian phone number";
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/mock-test/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          targetYear: formData.targetYear
            ? parseInt(formData.targetYear)
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setErrors({
            general: "Too many attempts. Please try again later.",
          });
        } else if (response.status === 503) {
          setErrors({
            general:
              "Not enough questions available. Please try again later.",
          });
        } else {
          setErrors({
            general: data.error || "Something went wrong. Please try again.",
          });
        }
        return;
      }

      // Redirect to the mock test
      router.push(`/mock-test/${data.attemptId}`);
    } catch (error) {
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start Full Mock Test</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {errors.general}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            error={errors.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            error={errors.email}
            required
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="10-digit mobile number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            error={errors.phone}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Class"
              options={[
                { value: "11", label: "Class 11" },
                { value: "12", label: "Class 12" },
                { value: "Dropper", label: "Dropper" },
              ]}
              value={formData.class}
              onChange={(e) =>
                setFormData({ ...formData, class: e.target.value })
              }
              placeholder="Select class"
            />

            <Select
              label="Target Year"
              options={[
                { value: "2025", label: "JEE 2025" },
                { value: "2026", label: "JEE 2026" },
                { value: "2027", label: "JEE 2027" },
              ]}
              value={formData.targetYear}
              onChange={(e) =>
                setFormData({ ...formData, targetYear: e.target.value })
              }
              placeholder="Select year"
            />
          </div>

          <div className="space-y-3 pt-2">
            <Checkbox
              label={
                <span>
                  I accept the{" "}
                  <Link
                    href="/terms"
                    className="text-[var(--zenith-cyan)] hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-[var(--zenith-cyan)] hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </span>
              }
              checked={formData.termsAccepted}
              onChange={(e) =>
                setFormData({ ...formData, termsAccepted: e.target.checked })
              }
              error={errors.termsAccepted}
            />

            <Checkbox
              label="Send me study tips and JEE updates via email"
              checked={formData.marketingConsent}
              onChange={(e) =>
                setFormData({ ...formData, marketingConsent: e.target.checked })
              }
            />
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-sm text-yellow-300">
            <strong>Important:</strong> This is a full 3-hour test. Make sure
            you have uninterrupted time before starting. Your progress will be
            auto-saved.
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Starting Test..." : "Start Full Mock Test"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
