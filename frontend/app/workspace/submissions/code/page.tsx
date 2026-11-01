import { redirect } from "next/navigation";

export default function CodeSubmissionPage() {
  redirect("/submissions/new?type=code");
}
