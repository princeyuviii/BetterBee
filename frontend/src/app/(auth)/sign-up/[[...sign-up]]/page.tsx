import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex w-full items-center justify-center">
      <SignUp
        appearance={{
          elements: {
            card: "bg-transparent shadow-none border-none p-0 w-full",
            headerTitle: "text-neutral-100",
            headerSubtitle: "text-neutral-400",
            socialButtonsBlockButton: "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-neutral-100",
            socialButtonsBlockButtonText: "text-neutral-100",
            formButtonPrimary: "bg-amber-500 hover:bg-amber-600 text-neutral-900 border-none",
            formFieldLabel: "text-neutral-300",
            formFieldInput: "bg-neutral-800 border-neutral-700 text-neutral-100 focus:border-amber-500 focus:ring-amber-500",
            footerActionText: "text-neutral-400",
            footerActionLink: "text-amber-500 hover:text-amber-400",
          },
        }}
      />
    </div>
  );
}
