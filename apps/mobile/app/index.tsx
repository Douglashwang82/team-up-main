import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAIChat, Message } from '../hooks/useAIChat';
import Animated, { FadeInUp } from 'react-native-reanimated';
import EventListWidget from '../components/chat/widgets/EventListWidget';
import MapWidget from '../components/chat/widgets/MapWidget';
import CreateEventWidget from '../components/chat/widgets/CreateEventWidget';
import MatchedUsersWidget from '../components/chat/widgets/MatchedUsersWidget';
import TrainingPlanWidget from '../components/chat/widgets/TrainingPlanWidget';
import TypingIndicator from '../components/chat/TypingIndicator';
import { useRouter } from 'expo-router';

export default function ChatScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);
    const [inputText, setInputText] = useState('');
    const [showWidgetMenu, setShowWidgetMenu] = useState(false);

    const { messages, isLoading, isInitialized, isLoadingMore, hasMore, loadMore, sendMessage, clearHistory } = useAIChat();

    const lastAppendedMessageId = useRef<string | null>(null);
    const prevMessagesLength = useRef(0);

    // Provide reliable chat scroll behavior
    useEffect(() => {
        if (messages.length > 0) {
            const addedMore = messages.length > prevMessagesLength.current;
            const sameBottom = prevMessagesLength.current > 0 && messages[messages.length - 1].id === lastAppendedMessageId.current;
            const loadedHistory = addedMore && sameBottom;
             
            // Only scroll down automatically if we are opening it fresh or sending/receiving new messages
            if (!loadedHistory) {
                // Short timeout to allow React Native's LayoutManager spacing to catch up
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }

            lastAppendedMessageId.current = messages[messages.length - 1].id;
            prevMessagesLength.current = messages.length;
        }
    }, [messages]);

    const handleSend = () => {
        if (!inputText.trim() || isLoading) return;
        sendMessage(inputText.trim());
        setInputText('');
    };

    const handleWidgetSelect = (command: string) => {
        setShowWidgetMenu(false);
        if (isLoading) return;
        sendMessage(command);
    };

    const renderMessageItem = React.useCallback(({ item, index }: { item: Message, index: number }) => (
        <MessageItem item={item} index={index} />
    ), []);

    return (
        <SafeAreaView style={[styles.container, { paddingBottom: 0 }]} edges={['top']}>

            {/* Top Navigation Bar with Access Points */}
            <View style={[styles.header, { borderBottomColor: Colors.gray[200] }]}>
                <Text style={[styles.headerTitle, { color: Colors.gray[900] }]}>TeamUp AI</Text>

                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.headerButton, { backgroundColor: 'white', borderColor: Colors.gray[200] }]}
                        onPress={() => {
                            Alert.alert(
                                "清除對話",
                                "確定要清除所有的對話紀錄嗎？",
                                [
                                    { text: "取消", style: "cancel" },
                                    { text: "確定", style: "destructive", onPress: clearHistory }
                                ]
                            )
                        }}
                    >
                        <Ionicons name="trash-outline" size={20} color={Colors.error[500]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.headerButton, { backgroundColor: 'white', borderColor: Colors.gray[200] }]}
                        onPress={() => router.push('/my-events')}
                    >
                        <Ionicons name="calendar-outline" size={20} color={Colors.gray[700]} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.profileButton, { borderColor: Colors.gray[200] }]}
                        onPress={() => router.push('/edit-profile')}
                    >
                        {/* Assuming user avatar logic would be here, for now using default icon */}
                        <Ionicons name="person-circle-outline" size={32} color={Colors.gray[600]} />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                style={styles.keyboardAvoidingView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {!isInitialized ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={renderMessageItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        initialNumToRender={10}
                        maxToRenderPerBatch={5}
                        windowSize={5}
                        removeClippedSubviews={Platform.OS === 'android'}
                        refreshControl={
                            <RefreshControl
                                refreshing={isLoadingMore}
                                onRefresh={loadMore}
                                tintColor={Colors.primary[500]}
                                colors={[Colors.primary[500]]}
                            />
                        }
                        onLayout={() => {
                            // Automatically scroll down when keyboard pushes container up
                            if (messages.length > 0 && !isLoadingMore) {
                                setTimeout(() => {
                                    flatListRef.current?.scrollToEnd({ animated: true });
                                }, 50);
                            }
                        }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubbles-outline" size={60} color={Colors.gray[300]} />
                                <Text style={styles.emptyTitle}>How can I help you today?</Text>
                                <Text style={styles.emptySubtitle}>Try asking me to "Show the map", "Find events", or "Create an event" to use my integrated widgets!</Text>
                            </View>
                        }
                        ListFooterComponent={
                            isLoading ? (
                                <Animated.View entering={FadeInUp.duration(300)}>
                                    <View style={styles.messageRow}>
                                        <View style={styles.botAvatar}>
                                            <Ionicons name="hardware-chip" size={16} color="white" />
                                        </View>
                                        <TypingIndicator />
                                    </View>
                                </Animated.View>
                            ) : null
                        }
                    />
                )}

                {/* Widget Popover Menu */}
                {showWidgetMenu && (
                    <Animated.View entering={FadeInUp.duration(250)} style={styles.widgetMenuContainer}>
                        <Text style={styles.widgetMenuTitle}>小工具 Widget</Text>
                        <View style={styles.widgetGrid}>
                            <TouchableOpacity style={styles.widgetOption} onPress={() => handleWidgetSelect('打開地圖')}>
                                <View style={[styles.widgetIcon, { backgroundColor: '#E0E7FF' }]}>
                                    <Ionicons name="map" size={24} color="#4F46E5" />
                                </View>
                                <Text style={styles.widgetOptionText}>活動地圖</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.widgetOption} onPress={() => handleWidgetSelect('找附近的活動')}>
                                <View style={[styles.widgetIcon, { backgroundColor: '#DCFCE7' }]}>
                                    <Ionicons name="calendar" size={24} color="#16A34A" />
                                </View>
                                <Text style={styles.widgetOptionText}>附近活動</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.widgetOption} onPress={() => handleWidgetSelect('我要建立活動')}>
                                <View style={[styles.widgetIcon, { backgroundColor: '#FFEDD5' }]}>
                                    <Ionicons name="add-circle" size={24} color="#EA580C" />
                                </View>
                                <Text style={styles.widgetOptionText}>發起主揪</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.widgetOption} onPress={() => handleWidgetSelect('找球友')}>
                                <View style={[styles.widgetIcon, { backgroundColor: '#FEE2E2' }]}>
                                    <Ionicons name="people" size={24} color="#DC2626" />
                                </View>
                                <Text style={styles.widgetOptionText}>找球友</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}

                {/* Input Area */}
                <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 12 }]}>
                    <View style={styles.inputWrapper}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowWidgetMenu(!showWidgetMenu)}
                        >
                            <Ionicons name={showWidgetMenu ? "close" : "add"} size={26} color={Colors.gray[500]} />
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="問我有哪裡可以打球..."
                            placeholderTextColor={Colors.gray[400]}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                        />

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                            ]}
                            onPress={handleSend}
                            disabled={!inputText.trim() || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Ionicons name="arrow-up" size={20} color="white" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const MessageItem = React.memo(({ item, index }: { item: Message, index: number }) => {
    const isUser = item.role === 'user';

    return (
        <Animated.View
            entering={FadeInUp.springify().damping(14).mass(0.8)}
            style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowBot
            ]}
        >
            {!isUser && (
                <View style={styles.botAvatar}>
                    <Ionicons name="hardware-chip" size={16} color="white" />
                </View>
            )}
            <View style={{ flex: 1, maxWidth: '85%' }}>
                <View style={[
                    styles.messageBubble,
                    isUser ? styles.messageBubbleUser : styles.messageBubbleBot,
                    isUser ? { alignSelf: 'flex-end' } : { alignSelf: 'flex-start' }
                ]}>
                    <Text style={[
                        styles.messageText,
                        isUser ? styles.messageTextUser : styles.messageTextBot
                    ]}>
                        {item.content}
                    </Text>
                </View>

                {!isUser && item.widget && (
                    <View style={{ marginTop: 8, alignSelf: 'stretch' }}>
                        {item.widget.type === 'EventList' && <EventListWidget />}
                        {item.widget.type === 'Map' && <MapWidget />}
                        {item.widget.type === 'CreateEvent' && <CreateEventWidget />}
                        {item.widget.type === 'MatchedUsers' && <MatchedUsersWidget data={item.widget.data} />}
                        {item.widget.type === 'TrainingPlan' && <TrainingPlanWidget data={item.widget.data} />}
                    </View>
                )}
            </View>
        </Animated.View>
    );
}, (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.content === nextProps.item.content &&
    prevProps.item.widget === nextProps.item.widget
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray[50],
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: StyleSheet.hairlineWidth,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    profileButton: {
        padding: 4,
        // Removed marginRight: -4 as it's now part of headerActions gap
    },
    avatarImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '30%',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.gray[700],
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: Colors.gray[500],
        textAlign: 'center',
        paddingHorizontal: 32,
        lineHeight: 20,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'flex-end',
    },
    messageRowUser: {
        justifyContent: 'flex-end',
    },
    messageRowBot: {
        justifyContent: 'flex-start',
    },
    botAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        marginBottom: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    messageBubble: {
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderRadius: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    messageBubbleUser: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    messageBubbleBot: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    messageTextUser: {
        color: 'white',
    },
    messageTextBot: {
        color: Colors.gray[800],
    },
    widgetMenuContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
    },
    widgetMenuTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[500],
        marginBottom: 12,
    },
    widgetGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    widgetOption: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor: Colors.gray[50],
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.gray[100],
    },
    widgetIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    widgetOptionText: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.gray[700],
    },
    inputContainer: {
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[200],
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: Colors.gray[100],
        borderRadius: 24,
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: Colors.gray[200],
    },
    addButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
        marginBottom: 2,
    },
    input: {
        flex: 1,
        minHeight: 36,
        maxHeight: 120,
        fontSize: 16,
        color: Colors.gray[900],
        paddingTop: 8,
        paddingBottom: 8,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginBottom: 2,
    },
    sendButtonDisabled: {
        backgroundColor: Colors.gray[300],
    },
});
