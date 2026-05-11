import * as auth from "./auth";
import * as directInvites from "./direct-invite";
import * as feedback from "./feedback";
import * as match from "./match";
import * as member from "./member";
import * as player from "./player";
import * as requests from "./request";
import * as subscription from "./subscription";
import * as tutorial from "./tutorial";
import * as users from "./user";
import * as inviteLinks from "./invite-link";
import * as featureAnnouncements from "./feature-announcement";

export const schema = {
  ...users,
  ...auth,
  ...feedback,
  ...member,
  ...player,
  ...match,
  ...tutorial,
  ...requests,
  ...subscription,
  ...inviteLinks,
  ...featureAnnouncements,
  ...directInvites,
};
