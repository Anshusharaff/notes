import InboxClient from "./InboxClient";
import { getNotifications } from "@/lib/api/notifications";

export const dynamic = 'force-dynamic';

const Inbox = async () => {
  const result = await getNotifications("*");
  return <InboxClient initialResult={result[0]} initialFilter={result[1]} />;
}

export default Inbox