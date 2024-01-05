import { AdminUiPlugin as Base } from "@vendure/admin-ui-plugin";

export const AdminUiPlugin = Base.init({
  route: "admin",
  port: 3002,
  adminUiConfig: {},
});
