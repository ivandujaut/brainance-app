import { describe, expect, it } from "vitest";
import { isValidDomain } from "./domains";

describe("isValidDomain", () => {
  it.each(["tienda.com.ar", "mi-negocio.store", "shop.ejemplo.com", "www.ejemplo.com", "ejemplo.digital", "Ejemplo.COM"])(
    "accepts %s",
    (domain) => {
      expect(isValidDomain(domain)).toBe(true);
    },
  );

  it.each([
    "http://ejemplo.com",
    "ejemplo",
    "-ejemplo.com",
    "ejemplo-.com",
    "ejemplo.com/",
    "ejemplo.com/contacto",
    "ejemplo..com",
    "ejemplo.c",
    "ejemplo.com:3000",
    "mi negocio.com",
    "",
    `${"a".repeat(64)}.com`,
  ])("rejects %j", (domain) => {
    expect(isValidDomain(domain)).toBe(false);
  });
});
