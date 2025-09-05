import "../styles/globals.css";

export const metadata = {
  title: "HVLoan",
  description: "AI-powered Loan Underwriting",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
