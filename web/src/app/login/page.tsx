import AuthForm from "@/components/AuthForm";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Log in",
  description: "Log in to your EdeBooking account.",
  path: "/login",
});

export default function LoginPage() {
  return <AuthForm />;
}
