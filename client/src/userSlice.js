import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    username: localStorage.getItem("username") || "defaultUsername"
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        updateUser: (state, action) => {
            state.username = action.payload.username;
        }
    }
});

export const { updateUser } = userSlice.actions;

export default userSlice.reducer;