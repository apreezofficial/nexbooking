import AuthForm from "@/components/AuthForm";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Create an account",
  description: "Create your EdeBooking account.",
  path: "/signup",
});

export default function SignupPage() {
  return <AuthForm signup />;
}
