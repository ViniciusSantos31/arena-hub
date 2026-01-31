import * as auth from "./auth";
import * as match from "./match";
import * as member from "./member";
import * as player from "./player";
import * as tutorial from "./tutorial";
import * as users from "./user";

export const schema = {
  ...users,
  ...auth,
  ...member,
  ...player,
  ...match,
  ...tutorial,
};
