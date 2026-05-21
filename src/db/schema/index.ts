import * as auth from "./auth";
import * as directInvites from "./direct-invite";
import * as feedback from "./feedback";
import * as match from "./match";
import * as member from "./member";
import * as paymentExemptions from "./payment-exemption";
import * as player from "./player";
import * as punishment from "./punishment";
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
  ...punishment,
  ...tutorial,
  ...requests,
  ...subscription,
  ...inviteLinks,
  ...featureAnnouncements,
  ...directInvites,
  ...paymentExemptions,
};
