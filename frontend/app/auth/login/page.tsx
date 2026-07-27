"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { validateAuth } from "@/utils/validateAuth.utils";
import { useTitle } from "@/app/context/TitleContext";

function Home() {
  const router = useRouter();
  const setTitle = useTitle().setPageTitle;
  useEffect(() => {
    setTitle("Login")
  }, [setTitle])
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setLoginState, setLogoutState } =
    useAuth();

  // validate if user is already authenticated
  useEffect(() => {
    validateAuth()
      .then((res) => {
        if (res) {
          setLoginState(res);
          router.push("/dashboard");
        } else {
          setLogoutState();
        }
      })
      .catch(() => {
        setLogoutState();
      });
  }, []);

  const handleSubmit = () => {
    console.log(
      `email: ${email} password: ${password}`
    );

    if (!email) {
      throw new Error("Email is required!");
    }

    const emailRegex =
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

    if (!emailRegex.test(email)) {
      throw new Error(
        "Invalid email address!"
      );
    }

    if (!password) {
      throw new Error(
        "Password is required!"
      );
    }

    return true;
  };

  const handleLogin = async () => {
    try {
      handleSubmit();

      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/v1/auth/signin",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Something went wrong"
        );
        return;
      }

      setLoginState(data.data.user);

      router.push("/dashboard");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black w-full min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-4xl font-bold text-center">
        AIRIS Chronicle
      </h1>

      <p className="text-xl text-center">
        The official newsletter service by
        AIRIS.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="border border-[#FF007F] shadow-[0_0_15px_rgba(255,0,127,0.2)] bg-black/60 rounded-xl px-6 py-6 w-full max-w-md"
      >
        <p className="text-2xl font-bold text-center mb-6 text-white">
          Login
        </p>

        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="email" className="text-sm font-medium text-neutral-300">
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            name="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="border border-neutral-700 py-2 px-3 rounded-lg bg-transparent outline-none text-white focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] transition-all"
          />
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="password" className="text-sm font-medium text-neutral-300">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            name="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="border border-neutral-700 py-2 px-3 rounded-lg bg-transparent outline-none text-white focus:border-[#FF007F] focus:ring-1 focus:ring-[#FF007F] transition-all"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end">
          <Button
            buttonName={
              loading
                ? "Logging in..."
                : "Login"
            }
            buttonType="Primary"
            className="w-full cursor-pointer"
          />
        </div>
      </form>
    </div>
  );
}

export default Home;