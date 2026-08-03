import { useUsers } from "../../hooks/admin/useUsers"


const UserManagement = () => {

  const { users } = useUsers();

  return (
    <div>
      <h1>user management</h1>
      <table className="text-primary">
        <tbody>

          {users.map(user => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserManagement
