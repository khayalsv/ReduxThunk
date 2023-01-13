# Create app

npx create-react-app 'my-app'

# Package install

npm install @faker-js/faker axios classnames json-server

npm install react-redux

# db.json

-app folder
```js
{
  "users": [],
  "albums": [],
  "photos": []
}
```

- package.json 
```js
"scripts": {
   "server": "json-server --watch db.json --port 3005",
},
```

# store 

1. create store folder in src folder
2. create slices folder in store folder
3. create userSlice in slices folder
4. create index.js in store folder
5. write index.js redux in the src folder
 
- userSlice.js

- data - obyektlərdən ibarət array-dir.
- isLoading - dataları alma prosesindəysək true olur. Əgər bir şey getirmiriksə false olaraq qeyd edəciyik.
- error - xəta mesajının lazım olub-olmadığına qərar vermək üçündür. Xəta yoxdursa 'null' dəyərinə sahib olacaq. Əgər bir şeylər tərs gedərsə, nəyin tərs getdiyini deyən obyekt atacağıq.

```js 
import { createSlice } from '@reduxjs/toolkit';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    data: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
});

export const usersReducer = usersSlice.reducer;
```

- store/index.js 

```js
import { configureStore } from "@reduxjs/toolkit";
import { usersReducer } from "./slices/userSlice";

export const store = configureStore({
    reducer:{
        users:usersReducer
    }
});
```

- app/index.js
```js
import { createRoot } from 'react-dom/client'
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store'

const el = document.getElementById('root');

const root = createRoot(el);

root.render(
    <Provider store={store}>
        <App />
    </Provider>
)
```

# Async Thunk

İstəyimizi yeni başlatdığımız və istifadəçiyə Loading mesajı göstərmək istədiyimiz üçün isLoading-i true olaraq qeyd edirik.
```js
{
    isLoading: true,
    data: [],
    error: null
}
```
Bunu etdikdən sora 2 ehtimal var :
1) Bir cavab alıb və data-ları əldə edərik. isLoading dəyərini false olaraq qeyd edib, dataları güncəlləmək istəyirik.
```js
{
    isLoading: false,
    data: [{ id: 1, name: 'Khayal' }],
    error: null
}
```
2) İstəklə bağlı nəsə tərs gedər və error alarıq. isLoading dəyərini false edirik. Çünki bir şeylər tərs getsə də hər hansı bir data yükləmirik və error mesajı göndəririk
```js
{
    isLoading: false,
    data: [],
    error: { message: 'Failed' }
}
```
Bir istək göndərdikdə, Life Cycle dövrü ərzində birdən çox, statusunun dəyişdiyini görürük.

Async Thunk data gətirmə prosesini izləyir və zaman içində bəzi yerlərdə action-ları avtomatik olaraq göndərir.

1. Thunk üçün yeni fayl yaradırıq. Onu sorğunun məqsədindən asılı olaraq adlandırıq.
2. Thunk yaradırıq. Ona sorğunun məqsədini təsvir edən əsas növü veririk.
3. Thunk daxilində sorğu göndəririk, reducer-dən istifadə etmək istədiyiniz məlumatları qaytarırıq.
4. Slice daxilində, thunk tərəfindən yaradılan action types-ları izləyərək, extraReducers əlavə edirik.
5. store/index.js faylından thunk ixrac edirik.
6. İstifadəçi bir şey etdikdə, onu işə salmaq üçün thunk funksiyasını göndəririk.

### code

1. store folderində thunks folderi və daxilində fetchUsers.js yaradırıq.

2. fetchUsers.js
```js
import { createAsyncThunk } from "@reduxjs/toolkit";

const fetchUsers = createAsyncThunk('users/fetch');
```

3. fetchUsers.js
```js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const fetchUsers = createAsyncThunk('users/fetch', async () => {
    const response = await axios.get('http://localhost:3005/users')

    return response.data;
});

export { fetchUsers };
```

4. usersSlice.js

- builder.addCase(); 
1) Gözləmədə olanları izləyəciyik. ( 'fetchUsers.pending' === 'users'/fetch/pending' )
2) İstəyin uğurla tamamlandığı mənasına gəılən fulfilled dəyərini izləyəciyik. ( 'fetchUsers.fulfilled' === 'users'/fetch/fulfilled' )
3) Null dəyərini izləyəciyik. ( 'fetchUsers.rejected' === 'users'/fetch/rejected' )

- Əgər istək uğurla nəticələnirsə isLoading dəyərini false olaraq dəyişdiririk.
- Dataları aldıqdan sonra, isLoading dəyərini false olaraq qeyd edib, arrayı güncəlləyirik.
- Sonra bir şeylər tərs gedərsə isLoading false etmək istəyirik.

fetchUsers daxilində 'return response' etdikdən sonra dataları əldə edirik və avtomatik olaraq action type-ın payload özəlliyinə göndəriləcək.

```js
import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers } from '../thunks/fetchUsers';

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    data: [],
    isLoading: false,
    error: null,
  },
  extraReducers(builder) {
    builder.addCase(fetchUsers.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.data = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error;
    });
  }
});

export const usersReducer = usersSlice.reducer;
```

5. store/index.js

```js
import { configureStore } from '@reduxjs/toolkit';
import { usersReducer } from './slices/usersSlice';

export const store = configureStore({
  reducer: {
    users: usersReducer,
  },
});

export * from './thunks/fetchUsers';
```

6. UsersList component

```js
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUsers } from "../store";

function UsersList() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch]);

  return 'Users List';
}

export default UsersList;
```

- db.json

```js
{
  "users": [
    {
      "id": 1,
      "name": "Khayal"
    }
  ]
}
```

console -> network check api

# Start Project

- UserList.js component ,render user
```js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../store";

function UsersList() {

  const dispatch = useDispatch();

  const { isLoading, data, error } = useSelector((state) => {
    return state.users;
  });

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch]);


  if (isLoading) { return <div>Loading...</div> }

  if (error) { return <div>Error fetching data...</div> }


  const renderedUsers = data.map((user) => {
    return (
      <div key={user.id}>
        {user.name}
      </div>
    )
  })

  return (
    <>
      {renderedUsers}
    </>
  )
}

export default UsersList;
```

## POST

1. create addUser.js in store/thunks

```js
import { faker } from "@faker-js/faker";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


const addUser = createAsyncThunk('users/add', async () => {
    const response = await axios.post('http://localhost:3005/users', {
        name: faker.name.fullName()
    });

    return response.data;
})

export { addUser };
```

2. store/index.js import file

```js
export * from './thunks/addUser';
```

3. usersSlice.js

```js
builder.addCase(addUser.pending, (state, action) => {
    state.isLoading = true;
});
builder.addCase(addUser.fulfilled, (state, action) => {
    state.isLoading = false;
    state.data.push(action.payload);
});
builder.addCase(addUser.rejected, (state, action) => {
    state.isLoading = false;
    state.error = action.error;
});
```

4. UserList.js component GET,POST

```js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser, fetchUsers } from "../store";

function UsersList() {

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

  if (isLoading) { return <div>Loading...</div> }

  if (error) { return <div>Error fetching data...</div> }

  const renderedUsers = data.map((user) => {
    return (
      <div key={user.id}>
        {user.name}
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
```

## DELETE

1. create removeUser.js in store/thunks

```js
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const removeUser = createAsyncThunk('users/remove', async (user) => {
    await axios.delete(`http://localhost:3005/users/${user.id}`);

    return user;
});

export { removeUser };
```

2. store/index.js import file

```js
export * from './thunks/removeUser';
```

3. usersSlice.js

```js
builder.addCase(removeUser.pending, (state, action) => {
    state.isLoading = true;
});
builder.addCase(removeUser.fulfilled, (state, action) => {
    state.isLoading = false;
    state.data = state.data.filter(user => {
    return user.id !== action.payload.id
    })
    // console.log(action);
});
builder.addCase(removeUser.rejected, (state, action) => {
    state.isLoading = false;
    state.error = action.error;
});
```

4. UserList.js GET,POST,DELETE

```js
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

```