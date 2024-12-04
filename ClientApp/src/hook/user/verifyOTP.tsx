import { useCallback, useState } from 'react';
import axios from 'axios';
import { API } from '../../constants/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';

const useVerifyAccount = () => {
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);
    const { token } = useSelector((state: RootState) => state.user);

    const verifyAccount = async (otp: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(
                `${API}/api/user/verify/${otp}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setLoading(false);
            return response.data;
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || 'Verification failed');
            throw err;
        }
    };

    const sendOTP = useCallback(
        async (email: string) => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.post(
                    `${API}/api/auth/resendOTP`,
                    { email } // Send email as body
                );
                setLoading(false);
                return response.data;
            } catch (err: any) {
                setLoading(false);
                setError(err.response?.data?.message || 'Failed to send OTP');
                throw err;
            }
        },
        []
    );

    return { verifyAccount, loading, error, sendOTP };
};

export default useVerifyAccount;
