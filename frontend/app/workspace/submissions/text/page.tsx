import { redirect } from "next/navigation";

export default function TextSubmissionPage() {
  redirect("/submissions/new?type=paste");
}
