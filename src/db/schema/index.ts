import * as auth from "./auth";
import * as match from "./match";
import * as member from "./member";
import * as player from "./player";
import * as requests from "./request";
import * as subscription from "./subscription";
import * as tutorial from "./tutorial";
import * as users from "./user";

export const schema = {
  ...users,
  ...auth,
  ...member,
  ...player,
  ...match,
  ...tutorial,
  ...requests,
  ...subscription,
};
