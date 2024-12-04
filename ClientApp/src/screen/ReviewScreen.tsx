import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
    Modal,
    TextInput,
    Button,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Star, ThumbsUp, Filter, MessageCircle } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Rating, RootStackParamList } from '../@types';
import useGetReview from '../hook/rating/useGetReview';

const ReviewItem = ({ review }: { review: Rating }) => {
    const [ modalVisible, setModalVisible ] = useState(false);
    const [ comment, setComment ] = useState('');

    const handleCommentSubmit = () => {
        setModalVisible(false);
    };

    const formattedDate = new Date(review.createdAt).toLocaleString();

    return (
        <View style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>
                    {review.userId.username} - <Text style={styles.reviewDate}>{formattedDate}</Text>
                </Text>
                <View style={styles.ratingContainer}>
                    {[ ...Array(5) ].map((_, i) => (
                        <Star
                            key={i}
                            size={16}
                            color={i < review.rating ? "#FFD700" : "#D3D3D3"}
                            fill={i < review.rating ? "#FFD700" : "transparent"}
                        />
                    ))}
                </View>
            </View>
            <Text style={styles.reviewComment}>{review.review}</Text>
            {review.photos && (
                <FlatList
                    data={review.photos}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <Image
                            source={{ uri: item }}
                            style={styles.reviewPhoto}
                        />
                    )}
                />
            )}
            <View style={styles.reviewFooter}>
                <TouchableOpacity style={styles.likeButton}>
                    <ThumbsUp size={16} color="#4A4A4A" />
                </TouchableOpacity>
                <Text style={styles.likeCount}>2</Text>
                <TouchableOpacity style={styles.commentButton} onPress={() => setModalVisible(true)}>
                    <MessageCircle size={16} color="#4A4A4A" />
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add a Comment</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Write your comment..."
                            value={comment}
                            onChangeText={setComment}
                        />
                        <Button title="Submit" onPress={handleCommentSubmit} />
                        <Button title="Cancel" onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const ReviewScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RootStackParamList, 'Restaurant'>>();
    const restaurant = route.params.restaurant;
    const { reviews, loading, error, refetch, averageRating } = useGetReview('Restaurant', restaurant);
    const [ sortBy, setSortBy ] = useState('recent');
    const [ sortedReviews, setSortedReviews ] = useState<Rating[]>([]);
    console.log(averageRating);
    const toggleSort = () => {
        if (sortBy === 'recent') {
            setSortBy('oldest');
        } else if (sortBy === 'oldest') {
            setSortBy('highestRated');
        } else {
            setSortBy('recent');
        }
    };

    useEffect(() => {
        refetch();
    }, [ refetch ]);

    useEffect(() => {
        let sorted = [ ...reviews ];
        if (sortBy === 'recent') {
            sorted = sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortBy === 'oldest') {
            sorted = sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        } else if (sortBy === 'highestRated') {
            sorted = sorted.sort((a, b) => b.rating - a.rating);
        }
        setSortedReviews(sorted);
    }, [ reviews, sortBy ]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[ '#4a90e2', '#357abd' ]}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reviews</Text>
                <TouchableOpacity onPress={toggleSort} style={styles.sortButton}>
                    <Filter color="#FFF" size={24} />
                </TouchableOpacity>
            </LinearGradient>
            {loading ? (
                <ActivityIndicator size="large" color="#4a90e2" style={styles.loader} />
            ) : (
                <FlatList
                    data={sortedReviews}
                    renderItem={({ item }) => <ReviewItem review={item} />}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.reviewList}
                    ListHeaderComponent={
                        <Text style={styles.sortInfo}>
                            Sorted by: {sortBy === 'recent' ? 'Most Recent' : sortBy === 'oldest' ? 'Oldest' : 'Highest Rated'}
                        </Text>
                    }
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={refetch} />
                    }
                />
            )}
            {error && <Text style={styles.errorText}>Error: {error}</Text>}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    backButton: {
        padding: 8,
    },
    sortButton: {
        padding: 8,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewList: {
        padding: 16,
    },
    sortInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    reviewItem: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewUser: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    ratingContainer: {
        flexDirection: 'row',
    },
    reviewDate: {
        fontSize: 12,
        color: '#666',
    },
    reviewComment: {
        fontSize: 14,
        color: '#333',
        marginBottom: 12,
    },
    reviewPhoto: {
        height: 120,
        width: 120,
        marginRight: 12,
        borderRadius: 8,
        marginBottom: 12,
        resizeMode: 'cover',
    },
    reviewFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
    },
    likeCount: {
        marginLeft: 4,
        fontSize: 14,
        color: '#4A4A4A',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFF',
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    commentInput: {
        height: 100,
        borderColor: '#CCC',
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
        textAlignVertical: 'top',
    },
});

export default ReviewScreen;