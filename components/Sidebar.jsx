import Link from 'next/link';
import { FaHome, FaUserPlus, FaList } from 'react-icons/fa';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg rounded-xl p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img src="/logo.png" alt="Logo" className="h-10" />
        <h1 className="text-xl font-bold text-blue-800">Groupe Tahraoui</h1>
      </div>
      <div className="flex gap-6">
        <Link href="/" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
          <FaHome /> Home
        </Link>
        <Link href="/add-client" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
          <FaUserPlus /> Add Client
        </Link>
        {/* <Link href="/clients" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
          <FaList /> Clients
        </Link> */}
        <Link href="/createP" className="flex items-center gap-2 text-blue-700 hover:text-blue-900">
          <FaList /> Create Proforma
        </Link>
      </div>
    </nav>
  );
}

