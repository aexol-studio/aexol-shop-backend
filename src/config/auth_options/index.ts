import { VendureConfig } from "@vendure/core";
import { getEnvs } from "../../getEnvs";

const { SUPERADMIN_PASSWORD, SUPERADMIN_USERNAME, COOKIE_SECRET } = getEnvs();

export const authOptions: VendureConfig["authOptions"] = {
  tokenMethod: ["bearer", "cookie"],
  superadminCredentials: {
    identifier: SUPERADMIN_USERNAME,
    password: SUPERADMIN_PASSWORD,
  },
  cookieOptions: {
    secret: COOKIE_SECRET,
    domain: ".aexol.com",
    sameSite: "lax",
  },
};
