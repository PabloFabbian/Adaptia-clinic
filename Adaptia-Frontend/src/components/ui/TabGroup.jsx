export const RolesTable = ({ roles }) => {
    return (
        <div className="mt-8">
            <div className="flex justify-between items-end mb-4">
                <h2 className="text-2xl font-bold">Roles</h2>
                <button className="bg-black text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <span>+</span> Nuevo rol
                </button>
            </div>

            <div className="border border-border-light rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-border-light text-gray-400">
                        <tr>
                            <th className="px-6 py-3 font-medium">Nombre</th>
                            <th className="px-6 py-3 font-medium">Descripción</th>
                            <th className="px-6 py-3"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                        {roles.map((role) => (
                            <tr key={role.name} className="hover:bg-gray-50 group">
                                <td className="px-6 py-4 font-medium">{role.name}</td>
                                <td className="px-6 py-4 text-gray-500">{role.description}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium flex items-center gap-1 ml-auto">
                                        ↗ Abrir
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};