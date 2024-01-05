import {
  EmailPlugin as Base,
  defaultEmailHandlers,
} from "@vendure/email-plugin";
import path from "path";
import { getEnvs } from "../../../getEnvs";

const { SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, STOREFRONT_URL } =
  getEnvs();
console.log(__dirname);
export const EmailPlugin = Base.init({
  handlers: defaultEmailHandlers,
  templatePath: path.join(__dirname, "templates"),
  transport: {
    type: "smtp",
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    auth: { user: SMTP_USERNAME, pass: SMTP_PASSWORD },
  },
  globalTemplateVars: {
    fromAddress: `"Aexol Demo Vendure Store" <${SMTP_USERNAME}>`,
    verifyEmailAddressUrl: `${STOREFRONT_URL}/customer/verify`,
    passwordResetUrl: `${STOREFRONT_URL}/customer/reset-password`,
    changeEmailAddressUrl: `${STOREFRONT_URL}/customer/verify-email-address-change`,
  },
});
