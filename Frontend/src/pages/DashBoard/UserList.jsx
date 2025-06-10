import React from "react";
import { useGetUsersQuery, useDeleteUserMutation, useToggleUserRoleMutation } from "../../redux/features/user/UserApi";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import Loading from "../../components/Loading";

const UserList = () => {
  const { currentUser } = useAuth();
  const { data: users = [], isLoading, isError, error } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [toggleUserRole] = useToggleUserRoleMutation();

  const handleDeleteUser = async (id, userName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete user "${userName}". This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(id).unwrap();
        Swal.fire({
          title: "Deleted!",
          text: `${userName} has been deleted successfully.`,
          icon: "success",
          confirmButtonColor: "#4F46E5",
        });
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err.data?.message || "Failed to delete user.",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      }
    }
  };

  const handleToggleRole = async (id, userName, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const result = await Swal.fire({
      title: "Change User Role?",
      text: `Do you want to change "${userName}"'s role to ${newRole}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, make ${newRole}!`,
    });

    if (result.isConfirmed) {
      try {
        await toggleUserRole(id).unwrap();
        Swal.fire({
          title: "Success!",
          text: `${userName}'s role has been changed to ${newRole}.`,
          icon: "success",
          confirmButtonColor: "#4F46E5",
        });
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err.data?.message || "Failed to change user role.",
          icon: "error",
          confirmButtonColor: "#EF4444",
        });
      }
    }
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="text-center text-red-600 text-xl font-semibold py-12">
        {error?.data?.message || "Failed to load users"}
      </div>
    );

  return (
    <section className="py-8 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">User Management</h2>
      {users.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.userName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {user._id !== currentUser?.id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleRole(user._id, user.userName, user.role)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title={`Change to ${user.role === "admin" ? "user" : "admin"}`}
                        >
                          Toggle Role
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id, user.userName)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default UserList;