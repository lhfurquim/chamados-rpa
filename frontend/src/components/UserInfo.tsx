import { useAuth } from '../contexts/AuthContext';
import { User, Building, Mail, Phone } from 'lucide-react';

export function UserInfo() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-stefanini-100 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-stefanini-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{user.name}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
            <div className="flex items-center gap-1">
              <Building className="h-4 w-4" />
              <span>{user.department}</span>
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div>Solicitações: {user.requestsSubmitted}</div>
          <div className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {user.isActive ? 'Ativo' : 'Inativo'}
          </div>
        </div>
      </div>
    </div>
  );
}