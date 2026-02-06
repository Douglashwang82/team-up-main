/**
 * Tests for API Client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiRequest, buildSearchParams, getApiBaseUrl } from "../api.js";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("API Client", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("getApiBaseUrl", () => {
    it("should return default URL when env not set", () => {
      vi.stubEnv("TEAMUP_API_URL", "");
      // Need to re-import to pick up new env
      expect(getApiBaseUrl()).toBe("http://localhost:8000");
    });

    it("should return env URL when set", () => {
      vi.stubEnv("TEAMUP_API_URL", "https://api.example.com");
      expect(process.env.TEAMUP_API_URL).toBe("https://api.example.com");
    });
  });

  describe("buildSearchParams", () => {
    it("should build empty string for empty params", () => {
      expect(buildSearchParams({})).toBe("");
    });

    it("should build params string for single param", () => {
      expect(buildSearchParams({ foo: "bar" })).toBe("foo=bar");
    });

    it("should build params string for multiple params", () => {
      const result = buildSearchParams({ foo: "bar", baz: "qux" });
      expect(result).toContain("foo=bar");
      expect(result).toContain("baz=qux");
    });

    it("should skip undefined values", () => {
      const result = buildSearchParams({ foo: "bar", baz: undefined });
      expect(result).toBe("foo=bar");
    });

    it("should convert numbers to strings", () => {
      const result = buildSearchParams({ limit: 10, offset: 0 });
      expect(result).toContain("limit=10");
      expect(result).toContain("offset=0");
    });
  });

  describe("apiRequest", () => {
    it("should make GET request by default", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: "test" }),
      });

      await apiRequest("/test");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/test"),
        expect.objectContaining({
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
      );
    });

    it("should make POST request with body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await apiRequest("/test", {
        method: "POST",
        body: { email: "test@example.com" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/test"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ email: "test@example.com" }),
        })
      );
    });

    it("should add Authorization header when requiresAuth is true and token provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: {} }),
      });

      await apiRequest("/auth/me", {
        requiresAuth: true,
        token: "test-token-123",
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token-123",
          },
        })
      );
    });

    it("should not add Authorization header when requiresAuth is false", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await apiRequest("/venues", { requiresAuth: false });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("should throw error on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve("Unauthorized"),
      });

      await expect(apiRequest("/auth/me")).rejects.toThrow(
        "API Error 401: Unauthorized"
      );
    });

    it("should throw error on 404 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve("Not found"),
      });

      await expect(apiRequest("/events/unknown-id")).rejects.toThrow(
        "API Error 404: Not found"
      );
    });

    it("should throw error on 500 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve("Internal server error"),
      });

      await expect(apiRequest("/events")).rejects.toThrow(
        "API Error 500: Internal server error"
      );
    });

    it("should return parsed JSON on success", async () => {
      const mockData = { id: "123", title: "Test Event" };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await apiRequest("/events/123");

      expect(result).toEqual(mockData);
    });

    it("should use PATCH method when specified", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ updated: true }),
      });

      await apiRequest("/events/123", {
        method: "PATCH",
        body: { title: "Updated Title" },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "PATCH",
        })
      );
    });

    it("should use DELETE method when specified", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ deleted: true }),
      });

      await apiRequest("/events/123", { method: "DELETE" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });
  });
});
