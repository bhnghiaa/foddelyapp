import axios from 'axios';

// Hàm upload ảnh lên Cloudinary
interface CloudinaryResponse {
    secure_url: string;
}

interface FileData {
    uri: string;
    type: string;
    name: string;
}

const uploadImageToCloudinary = async (imageUri: string): Promise<string | null> => {
    const data = new FormData();
    data.append('file', {
        uri: imageUri,
        type: 'image/jpeg', // Điều chỉnh type nếu không phải là JPEG
        name: 'upload.jpg',
    } as FileData);
    data.append('upload_preset', '0');
    data.append('cloud_name', 'diadiykyk');

    try {
        const response = await axios.post<CloudinaryResponse>(
            '0',
            data
        );
        return response.data.secure_url; // Trả về link ảnh sau khi upload
    } catch (error) {
        return null;
    }
};
