import { redirect } from "next/navigation";

export default function FileSubmissionPage() {
  redirect("/submissions/new?type=document");
}
