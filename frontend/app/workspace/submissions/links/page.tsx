import { redirect } from "next/navigation";

export default function LinkSubmissionPage() {
  redirect("/submissions/new?type=paste&kind=link");
}
