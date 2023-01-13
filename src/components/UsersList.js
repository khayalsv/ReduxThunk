import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser, fetchUsers, removeUser } from "../store";

function UsersList({ user }) {

  const dispatch = useDispatch();

  const { isLoading, data, error } = useSelector((state) => {
    return state.users;
  });

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch]);

  const handleUserAdd = () => {
    dispatch(addUser());
  }

  const handleUserDelete = (user) => {
    dispatch(removeUser(user));
  }

  if (isLoading) { return <div>Loading...</div> }

  if (error) { return <div>Error fetching data...</div> }

  const renderedUsers = data.map((user) => {
    return (
      <div key={user.id}>
        <div>
          {user.name}
        </div>
        <button key={user.id} onClick={() => handleUserDelete(user)}>- Delete</button>
      </div>
    )
  })


  return (
    <>
      <button onClick={handleUserAdd}>
        + Add user
      </button>
      {renderedUsers}
    </>
  )
}

export default UsersList;
