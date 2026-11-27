import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Create a vendor account", robots: { index: false } };

export default function VendorSignupPage() {
  return <AuthForm signup vendorSignup />;
}
