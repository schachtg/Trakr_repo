import { PERMISSION_LIST } from "./Constants";
import { baseURL } from "./apis/TicketManager"

export async function hasPermission(permission, project_id) {
    if (!PERMISSION_LIST.includes(permission)) {
        return false;
    }

    try{
        const permissionIndex = PERMISSION_LIST.indexOf(permission);
        const response = await fetch(`${baseURL}/roles/users_permissions/${project_id}`, {
            method: "GET",
            headers: {"Content-Type": "application/json"},
            credentials: "include"
        });
        if (response.status !== 200) {
            return false;
        }

        const data = await response.json();
        return data[permissionIndex];
    } catch (err) {
        console.error(err.message);
        return false;
    }
}