import Sidebar from "./Sidebar";

export default async function AdminLayout({ children }) {
    return (
        <main>
            <div className="w-full flex justify-end">
                <Sidebar />
            </div>
            {children}
        </main>
    )
}