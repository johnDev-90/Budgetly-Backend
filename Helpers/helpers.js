import bcrypt from "bcrypt";

export async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);
    return hashedPassword;
  } catch (error) {
    console.error("Error hashing password:", error);
  }
}

export function formatFechaToYYYYMMDD(fecha) {
  const date = new Date(fecha);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Agregar cero si es necesario
  const day = String(date.getDate()).padStart(2, "0"); // Agregar cero si es necesario
  return `${year}-${month}-${day}`;
}

export const formatearDinero = (valor) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return formatter.format(valor);
};

