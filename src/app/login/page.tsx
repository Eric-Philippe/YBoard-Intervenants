"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import {
  IconAlertCircle,
  IconBuildingSkyscraper,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconArrowRight,
} from "@tabler/icons-react";
import { useAuth } from "~/contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        !value || !/^\S+@\S+$/.test(value) ? "Adresse e-mail invalide" : null,
      password: (value) => (!value ? "Le mot de passe est requis" : null),
    },
  });

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      setError("");
      await login(values.email, values.password);
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Échec de la connexion");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7f7] px-4">
      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-40 blur-3xl"
        style={{ backgroundColor: "#2fb6a9" }}
      />
      <div
        className="pointer-events-none absolute -right-24 -bottom-24 h-[28rem] w-[28rem] rounded-full opacity-30 blur-3xl"
        style={{ backgroundColor: "#1a8880" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: "#45c0b2" }}
      />

      <div className="glass-card relative w-full max-w-md p-8 sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="from-brand-500 to-brand-700 shadow-brand-600/30 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg">
            <IconBuildingSkyscraper size={26} />
          </span>
          <h1 className="text-xl font-bold text-gray-900">
            YBoard - Intervenants
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Connectez-vous pour gérer vos périmètres, promotions et enseignants.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <IconAlertCircle size={18} className="shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="relative">
              <IconMail
                size={17}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="prenom.nom@ynov.com"
                className="input-glass pl-10"
                disabled={loading}
                {...form.getInputProps("email")}
              />
            </div>
            {form.errors.email && (
              <p className="mt-1 text-sm text-red-600">{form.errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <div className="relative">
              <IconLock
                size={17}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
              />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Votre mot de passe"
                className="input-glass pr-10 pl-10"
                disabled={loading}
                {...form.getInputProps("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
              >
                {showPassword ? (
                  <IconEyeOff size={17} />
                ) : (
                  <IconEye size={17} />
                )}
              </button>
            </div>
            {form.errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {form.errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 w-full justify-center py-2.5"
          >
            {loading ? (
              <>
                <IconLoader2 size={18} className="animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                Se connecter
                <IconArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
