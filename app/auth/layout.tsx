import "@/app/home.css"

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 via-teal-50 to-white">
            {children}
        </div>
    )
}
