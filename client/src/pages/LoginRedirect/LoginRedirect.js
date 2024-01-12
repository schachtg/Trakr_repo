import { useEffect } from 'react';
import { baseURL } from '../../apis/TicketManager';

export default function LoginPage() {
    useEffect(() => { 
        const checkTokenCookie = async () => {
            const response = await fetch(`${baseURL}/user_info/verify`, {
                method: "GET",
                headers: {"Content-Type": "application/json"},
                credentials: "include"
            });

            return response.status === 200;
        }

        const redirect = async () => {
            const validCookie = await checkTokenCookie();
            if (validCookie) {
                window.location.assign("/board");
            } else {
                window.location.assign("/login");
            }
        }

        redirect();
    }, []);
}