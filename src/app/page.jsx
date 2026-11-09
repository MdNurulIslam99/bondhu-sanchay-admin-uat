import { redirect } from "next/navigation";
// There is no public website, only the admin panel
export default function Home() {
    redirect("/admin");
}
