import axios from 'axios';
import { useEffect, useState } from "react";
import { User } from '../@types';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { API } from '../constants/api';

const useUser = () => {
    const [ users, setUsers ] = useState<User[]>([]);
    const [ loading, setLoading ] = useState<boolean>(true);
    const [ error, setError ] = useState<Error | null>(null);
    const { token } = useSelector((state: RootState) => state.user);

    const fetchDataUser = async () => {
        setLoading(true);
        try {
            const response = await axios.get<User[]>(`${API}/api/user/admin-get-all-users`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLoading(false);
            setUsers(response.data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    };

    const updateAccount = async (userId: string, data: { verification: boolean }) => {
        setLoading(true);
        console.log(`${API}/api/user/admin-update-user/${userId}`, {
            verification: data.verification
        });
        try {
            await axios.patch(`${API}/api/user/admin-update-user/${userId}`, {
                verification: data.verification
            });
            setLoading(false);
            refetch();
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDataUser();
    }, []);

    const refetch = () => {
        setLoading(true);
        fetchDataUser();
    };

    return { users, loading, error, refetch, updateAccount };
};

export default useUser;
