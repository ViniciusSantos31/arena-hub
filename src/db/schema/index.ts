import * as auth from "./auth";
import * as users from "./user";

export const schema = {
  ...users,
  ...auth,
};
